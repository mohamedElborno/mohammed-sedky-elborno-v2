import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./authz";
import {
  bookFields,
  biographyFields,
  galleryFields,
  homePageFields,
  lessonsPageFields,
} from "./schema";

type StorageId = Id<"_storage">;

/** Files no longer referenced after a save would otherwise linger forever. */
async function deleteUnusedFiles(
  ctx: MutationCtx,
  before: (StorageId | null | undefined)[],
  after: (StorageId | null | undefined)[],
) {
  const kept = new Set(after.filter(Boolean) as StorageId[]);
  const removed = before.filter(
    (id): id is StorageId => Boolean(id) && !kept.has(id as StorageId),
  );
  await Promise.all(removed.map((id) => ctx.storage.delete(id)));
}

const homePageImages = (doc: Doc<"homePage"> | { image: StorageId | null; worksCategory: { icon: StorageId | null }[] }) => [
  doc.image,
  ...doc.worksCategory.map((item) => item.icon),
];

const lessonsPageImages = (
  doc: Doc<"lessonsPage"> | { image: StorageId | null; lessons: { image: StorageId | null }[] },
) => [doc.image, ...doc.lessons.map((lesson) => lesson.image)];

const galleryImages = (photos: { image: StorageId | null }[]) =>
  photos.map((photo) => photo.image);

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Resolves storage ids to URLs so the panel can preview current images. */
export const getImageUrls = query({
  args: { ids: v.array(v.id("_storage")) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx);
    const entries = await Promise.all(
      ids.map(async (id) => [id, await ctx.storage.getUrl(id)] as const),
    );
    return Object.fromEntries(entries) as Record<string, string | null>;
  },
});

export const getHomePage = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("homePage").first();
  },
});

export const saveHomePage = mutation({
  args: homePageFields,
  handler: async (ctx, data) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("homePage").first();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      await deleteUnusedFiles(
        ctx,
        homePageImages(existing),
        homePageImages(data),
      );
      return existing._id;
    }
    return ctx.db.insert("homePage", data);
  },
});

export const getBiography = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("biography").first();
  },
});

export const saveBiography = mutation({
  args: biographyFields,
  handler: async (ctx, data) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("biography").first();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      await deleteUnusedFiles(
        ctx,
        [existing.card.image],
        [data.card.image],
      );
      return existing._id;
    }
    return ctx.db.insert("biography", data);
  },
});

export const getLessonsPage = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("lessonsPage").first();
  },
});

export const saveLessonsPage = mutation({
  args: lessonsPageFields,
  handler: async (ctx, data) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("lessonsPage").first();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      await deleteUnusedFiles(
        ctx,
        lessonsPageImages(existing),
        lessonsPageImages(data),
      );
      return existing._id;
    }
    return ctx.db.insert("lessonsPage", data);
  },
});

export const getGallery = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("gallery").first();
  },
});

export const saveGallery = mutation({
  args: galleryFields,
  handler: async (ctx, data) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("gallery").first();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      await deleteUnusedFiles(
        ctx,
        galleryImages(existing.photos),
        galleryImages(data.photos),
      );
      return existing._id;
    }
    return ctx.db.insert("gallery", data);
  },
});

export const listBooks = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("books").withIndex("by_order").collect();
  },
});

async function assertSlugIsFree(
  ctx: MutationCtx,
  slug: string,
  ignore?: Id<"books">,
) {
  const clash = await ctx.db
    .query("books")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (clash && clash._id !== ignore) {
    throw new Error(`المُعرّف "${slug}" مستخدم في كتاب آخر`);
  }
}

export const createBook = mutation({
  args: bookFields,
  handler: async (ctx, data) => {
    await requireAdmin(ctx);
    await assertSlugIsFree(ctx, data.slug);
    return ctx.db.insert("books", data);
  },
});

export const updateBook = mutation({
  args: { id: v.id("books"), ...bookFields },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("الكتاب غير موجود");
    await assertSlugIsFree(ctx, data.slug, id);
    await ctx.db.patch(id, data);
    await deleteUnusedFiles(ctx, [existing.coverImage], [data.coverImage]);
    return id;
  },
});

export const deleteBook = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) return;

    // A deleted book must not stay referenced by the biography card.
    const biography = await ctx.db.query("biography").first();
    if (biography?.card.publishedWorks.some((work) => work === id)) {
      await ctx.db.patch(biography._id, {
        card: {
          ...biography.card,
          publishedWorks: biography.card.publishedWorks.filter(
            (work) => work !== id,
          ),
        },
      });
    }

    await ctx.db.delete(id);
    if (existing.coverImage) {
      await ctx.storage.delete(existing.coverImage);
    }
  },
});
