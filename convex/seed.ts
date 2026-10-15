import { internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  CARD,
  DESCRIPTION_AR,
  PUBLISHED_WORKS,
  TIMELINE,
} from "./seedData/biography";

// These are internal functions: they cannot be called from the website, only
// from the Convex CLI (`npm run seed:biography`), which runs with admin rights.

/** Arabic titles are compared without diacritics, tatweel or spacing noise. */
const normalize = (title: string) =>
  title
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();

const localized = (ar: string) => ({ ar, tr: "", en: "" });

/** What is in the database now: used to back it up before seeding. */
export const state = internalQuery({
  args: {},
  handler: async (ctx) => ({
    biography: await ctx.db.query("biography").first(),
    books: (await ctx.db.query("books").collect()).map((book) => ({
      id: book._id,
      title: book.title.ar,
      slug: book.slug,
    })),
  }),
});

/** Loads convex/seedData/biography.ts into the `biography` singleton. */
export const biography = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("biography").first();
    const books = await ctx.db.query("books").collect();
    const byTitle = new Map(
      books.map((book) => [normalize(book.title.ar), book._id]),
    );
    const slugs = new Set(books.map((book) => book.slug));

    // Link every published work, creating the books that do not exist yet.
    const publishedWorks: Id<"books">[] = [];
    const created: string[] = [];
    let order = books.length;
    for (const work of PUBLISHED_WORKS) {
      let id = byTitle.get(normalize(work.title));
      if (!id) {
        if (slugs.has(work.slug)) {
          throw new Error(`The slug "${work.slug}" is already used by another book`);
        }
        id = await ctx.db.insert("books", {
          title: localized(work.title),
          description: localized(""),
          url: "",
          slug: work.slug,
          order: order++,
          coverImage: null,
          date: "",
        });
        slugs.add(work.slug);
        created.push(work.title);
      }
      publishedWorks.push(id);
    }

    const data = {
      description: localized(DESCRIPTION_AR),
      card: {
        // The portrait is uploaded from the admin panel; keep it if it is there.
        image: existing?.card.image ?? null,
        name: localized(CARD.name),
        birthDate: CARD.birthDate,
        deathDate: CARD.deathDate,
        birthPlace: localized(CARD.birthPlace),
        majorEducationalInstitution: localized(CARD.majorEducationalInstitution),
        publishedWorks,
      },
      timeline: TIMELINE.map((item) => ({
        title: localized(item.title),
        date: `${item.year}-01-01`,
      })),
    };

    if (existing) await ctx.db.replace(existing._id, data);
    else await ctx.db.insert("biography", data);

    return {
      action: existing ? "replaced" : "inserted",
      timelineItems: data.timeline.length,
      descriptionCharacters: DESCRIPTION_AR.length,
      linkedBooks: publishedWorks.length,
      booksCreated: created.length,
    };
  },
});
