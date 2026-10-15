import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, pageUrl } from "@/lib/seo";

const PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/biography", priority: 0.9, changeFrequency: "monthly" },
  { path: "/books", priority: 0.8, changeFrequency: "weekly" },
  { path: "/media", priority: 0.7, changeFrequency: "weekly" },
] as const;

const UPDATED = new Date();

// One entry per page and language, each pointing to its translations so
// search engines show the right language to the right reader.
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: pageUrl(locale, page.path),
      lastModified: UPDATED,
      changeFrequency: page.changeFrequency,
      priority: locale === routing.defaultLocale ? page.priority : page.priority - 0.1,
      alternates: { languages: languageAlternates(page.path) },
    })),
  );
}
