import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { bookFields, lessonsPageFields, biographyCard, localized, timelineItem } from "./schema";

// Temporary, admin-only migration helpers. No public endpoint and no schema changes.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).sort().map(k => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
async function digest(s: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,"0")).join("");
}
const sourceBiography = v.union(v.null(), v.object({
  description: localized,
  card: v.object({ ...biographyCard.fields, publishedWorks: v.array(v.string()) }),
  timeline: v.array(timelineItem),
}));
const commitArgs = {
  mode: v.union(v.literal("insert-only"), v.literal("replace-test-data")),
  expectedState: v.string(),
  books: v.array(v.object({ sourceId: v.string(), data: v.object(bookFields) })),
  biography: sourceBiography,
  lessonsPage: v.union(v.null(), v.object(lessonsPageFields)),
};

export const generateUploadUrl = internalMutation({ args: {}, handler: async ctx => ctx.storage.generateUploadUrl() });
export const fileInfo = internalQuery({ args: { id: v.id("_storage") }, handler: async (ctx, {id}) => ctx.db.system.get(id) });
export const version = internalQuery({ args: {}, handler: async () => 1 });

export const commit = internalMutation({
  args: commitArgs,
  handler: async (ctx, args) => {
    const current = {
      books: await ctx.db.query("books").collect(),
      biography: await ctx.db.query("biography").collect(),
      lessonsPage: await ctx.db.query("lessonsPage").collect(),
    };
    const strip = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith("_")));
    const ids: Record<string, Id<"books">> = {};
    const sources = new Set<string>(); const slugs = new Set<string>();
    for (const row of args.books) {
      if (sources.has(row.sourceId) || slugs.has(row.data.slug) || !row.data.slug || !row.data.title.ar.trim()) throw Error("Duplicate or invalid source book");
      sources.add(row.sourceId); slugs.add(row.data.slug);
    }
    if (!args.books.length || args.books.length > 200 || !args.biography || !args.lessonsPage) throw Error("Incomplete migration bundle");
    for (const ref of args.biography.card.publishedWorks) if (!sources.has(ref)) throw Error("Unresolved source book reference");
    function resolveBiography() {
      const b = args.biography!;
      return { ...b, card: { ...b.card, publishedWorks: b.card.publishedWorks.map(ref => ids[ref]) } };
    }
    // A lost response can be retried without deleting/reinserting completed data.
    let alreadyApplied = current.books.length === args.books.length;
    for (const row of args.books) {
      const matches = current.books.filter(b => b.slug === row.data.slug);
      if (matches.length !== 1 || canonical(strip(matches[0])) !== canonical(row.data)) alreadyApplied = false;
      if (matches.length === 1) ids[row.sourceId] = matches[0]._id;
    }
    if (alreadyApplied && current.biography.length === 1 && current.lessonsPage.length === 1
      && canonical(strip(current.biography[0])) === canonical(resolveBiography())
      && canonical(strip(current.lessonsPage[0])) === canonical(args.lessonsPage)) {
      return { status: "already-applied", bookIds: ids, biographyId: current.biography[0]._id, lessonsPageId: current.lessonsPage[0]._id };
    }
    if (canonical(current) !== args.expectedState) throw Error("Target changed since dry-run; export and review a new plan");
    if (args.mode === "insert-only" && Object.values(current).some(rows => rows.length)) throw Error("Target contains data; insert-only mode refuses changes");
    // Validate every storage reference before the first write.
    const imageIds = new Set<Id<"_storage">>();
    for (const b of args.books) if (b.data.coverImage) imageIds.add(b.data.coverImage);
    if (args.biography.card.image) imageIds.add(args.biography.card.image);
    for (const t of args.biography.timeline) if (t.image) imageIds.add(t.image);
    if (args.lessonsPage.image) imageIds.add(args.lessonsPage.image);
    for (const l of args.lessonsPage.lessons) if (l.image) imageIds.add(l.image);
    for (const id of imageIds) if (!await ctx.db.system.get(id)) throw Error("Missing uploaded image");
    // All document writes/deletes are one Convex transaction. A failure rolls back all.
    // Old storage files are retained because other pages may still reference them.
    if (args.mode === "replace-test-data") {
      for (const rows of Object.values(current)) for (const row of rows) await ctx.db.delete(row._id);
    }
    for (const row of args.books) ids[row.sourceId] = await ctx.db.insert("books", row.data);
    const biographyId = await ctx.db.insert("biography", resolveBiography());
    const lessonsPageId = await ctx.db.insert("lessonsPage", args.lessonsPage);
    return { status: "applied", bookIds: ids, biographyId, lessonsPageId };
  },
});

export const applyUploadedPlan = internalAction({
  args: { bundleId: v.id("_storage"), approvedPlanId: v.string() },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.bundleId);
    if (!blob || blob.size > 900000) throw Error("Missing or oversized bundle");
    const { payload, uploads } = JSON.parse(await blob.text());
    if (await digest(canonical(payload)) !== args.approvedPlanId) throw Error("Approval hash does not match plan");
    const deployedUrl = process.env.CONVEX_CLOUD_URL;
    if (!deployedUrl || new URL(deployedUrl).origin !== payload.config.convexUrl) throw Error("Wrong deployment");
    // Destructive mode is additionally pinned by the caller to the explicit dev deployment.
    if (payload.mode === "replace-test-data" && payload.config.deployment !== "cheerful-horse-763") throw Error("Replacement is restricted to the reviewed development deployment");
    for (const [assetId, asset] of Object.entries(payload.assets) as [string, {sha256:string; bytes:number}][]) {
      const info = await ctx.runQuery(makeFunctionReference<"query">("sanityMigration:fileInfo"), {id:uploads[assetId]});
      const expected = btoa(String.fromCharCode(...new Uint8Array(asset.sha256.match(/../g)!.map(h => parseInt(h,16)))));
      if (!info || info.sha256 !== expected || info.size !== asset.bytes) throw Error("Uploaded asset hash mismatch");
    }
    function resolve(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(resolve);
      if (value && typeof value === "object") {
        const o = value as Record<string, unknown>;
        if (typeof o.$asset === "string") {
          if (!uploads[o.$asset] || !payload.assets[o.$asset]) throw Error("Unmapped image");
          return uploads[o.$asset];
        }
        return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,resolve(v)]));
      }
      return value;
    }
    return ctx.runMutation(makeFunctionReference<"mutation">("sanityMigration:commit"), {
      mode:payload.mode, expectedState:payload.expectedState,
      books:resolve(payload.books), biography:resolve(payload.biography), lessonsPage:resolve(payload.lessonsPage),
    });
  },
});
