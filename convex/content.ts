import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const localeValidator = v.union(
  v.literal("ar"),
  v.literal("tr"),
  v.literal("en"),
);

type Locale = "ar" | "tr" | "en";
type LocalizedField = { ar: string; tr: string; en: string };

/** Arabic is the source language, so it is the fallback for missing translations. */
function text(field: LocalizedField | undefined, locale: Locale): string {
  if (!field) return "";
  return field[locale] || field.ar || "";
}

async function imageUrl(
  ctx: QueryCtx,
  id: Id<"_storage"> | null | undefined,
): Promise<string> {
  if (!id) return "";
  return (await ctx.storage.getUrl(id)) ?? "";
}

export const getHomePage = query({
  args: { locale: localeValidator },
  handler: async (ctx, { locale }) => {
    const doc = await ctx.db.query("homePage").first();
    if (!doc) return null;

    return {
      video: doc.video,
      image: await imageUrl(ctx, doc.image),
      worksCategory: await Promise.all(
        doc.worksCategory.map(async (item) => ({
          icon: await imageUrl(ctx, item.icon),
          title: text(item.title, locale),
          description: text(item.description, locale),
          workUrl: item.workUrl,
        })),
      ),
      about: doc.about
        ? {
            image: await imageUrl(ctx, doc.about.image),
            description: text(doc.about.description, locale),
            quote: {
              text: text(doc.about.quote.text, locale),
              author: text(doc.about.quote.author, locale),
              source: text(doc.about.quote.source, locale),
            },
          }
        : null,
    };
  },
});

export const getBiography = query({
  args: { locale: localeValidator },
  handler: async (ctx, { locale }) => {
    const doc = await ctx.db.query("biography").first();
    if (!doc) return null;

    const publishedWorks = await Promise.all(
      doc.card.publishedWorks.map(async (bookId) => {
        const book = await ctx.db.get(bookId);
        if (!book) return null;
        return {
          _id: book._id as string,
          title: text(book.title, locale),
          slug: book.slug,
        };
      }),
    );

    return {
      description: text(doc.description, locale),
      card: {
        image: await imageUrl(ctx, doc.card.image),
        name: text(doc.card.name, locale),
        birthDate: doc.card.birthDate,
        deathDate: doc.card.deathDate,
        birthPlace: text(doc.card.birthPlace, locale),
        majorEducationalInstitution: text(
          doc.card.majorEducationalInstitution,
          locale,
        ),
        publishedWorks: publishedWorks.filter((work) => work !== null),
      },
      timeline: await Promise.all(
        doc.timeline.map(async (item) => ({
          title: text(item.title, locale),
          date: item.date,
          image: await imageUrl(ctx, item.image),
        })),
      ),
    };
  },
});

export const getBooks = query({
  args: { locale: localeValidator },
  handler: async (ctx, { locale }) => {
    const docs = await ctx.db.query("books").withIndex("by_order").collect();

    return Promise.all(
      docs.map(async (doc) => ({
        _id: doc._id as string,
        title: text(doc.title, locale),
        description: text(doc.description, locale),
        url: doc.url,
        slug: doc.slug,
        coverImage: await imageUrl(ctx, doc.coverImage),
      })),
    );
  },
});

export const getLessons = query({
  args: { locale: localeValidator },
  handler: async (ctx, { locale }) => {
    const doc = await ctx.db.query("lessonsPage").first();
    if (!doc) return null;

    return {
      image: await imageUrl(ctx, doc.image),
      url: doc.url,
      lessons: await Promise.all(
        doc.lessons.map(async (lesson) => ({
          title: text(lesson.title, locale),
          description: text(lesson.description, locale),
          image: await imageUrl(ctx, lesson.image),
          url: lesson.url,
        })),
      ),
    };
  },
});

export const getGallery = query({
  args: { locale: localeValidator },
  handler: async (ctx, { locale }) => {
    const doc = await ctx.db.query("gallery").first();
    if (!doc) return [];

    const photos = await Promise.all(
      doc.photos.map(async (photo) => ({
        image: await imageUrl(ctx, photo.image),
        caption: text(photo.caption, locale),
      })),
    );
    return photos.filter((photo) => photo.image !== "");
  },
});
