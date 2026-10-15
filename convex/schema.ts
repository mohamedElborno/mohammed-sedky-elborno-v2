import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Only real content lives in the database: images, links, and the repeatable
 * lists (books, timeline, lessons, work cards, gallery photos). Page headings, descriptions,
 * button labels and the quote are static UI text and live in locales/*.json.
 */

/** Every editable text exists in both site languages. */
export const localized = v.object({
  ar: v.string(),
  tr: v.string(),
  en: v.string(),
});

/** Images live in Convex file storage; the document only keeps the id. */
export const imageId = v.union(v.id("_storage"), v.null());

export const worksCategoryItem = v.object({
  icon: imageId,
  title: localized,
  description: localized,
  workUrl: v.string(),
});

export const timelineItem = v.object({
  title: localized,
  date: v.string(),
  // Optional, so timelines saved before images existed stay valid.
  image: v.optional(imageId),
});

export const lessonItem = v.object({
  title: localized,
  description: localized,
  image: imageId,
  url: v.string(),
});

export const biographyCard = v.object({
  image: imageId,
  name: localized,
  birthDate: v.string(),
  deathDate: v.string(),
  birthPlace: localized,
  majorEducationalInstitution: localized,
  publishedWorks: v.array(v.id("books")),
});

export const galleryPhoto = v.object({
  image: imageId,
  caption: localized,
});

export const galleryFields = {
  photos: v.array(galleryPhoto),
};

/**
 * The "about the Sheikh" block of the home page. It is optional so the
 * existing home page document stays valid until it is saved with this block.
 */
export const aboutBlock = v.object({
  image: imageId,
  description: localized,
  quote: v.object({
    text: localized,
    author: localized,
    source: localized,
  }),
});

export const homePageFields = {
  video: v.string(),
  image: imageId,
  worksCategory: v.array(worksCategoryItem),
  about: v.optional(aboutBlock),
};

export const biographyFields = {
  description: localized,
  card: biographyCard,
  timeline: v.array(timelineItem),
};

export const lessonsPageFields = {
  image: imageId,
  url: v.string(),
  lessons: v.array(lessonItem),
};

export const bookFields = {
  title: localized,
  description: localized,
  url: v.string(),
  slug: v.string(),
  order: v.number(),
  coverImage: imageId,
  date: v.string(),
};

export default defineSchema({
  // homePage, biography, lessonsPage and gallery are singletons: only one document each.
  homePage: defineTable(homePageFields),
  biography: defineTable(biographyFields),
  lessonsPage: defineTable(lessonsPageFields),
  gallery: defineTable(galleryFields),
  books: defineTable(bookFields)
    .index("by_order", ["order"])
    .index("by_slug", ["slug"]),
});
