import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, toLocale, type Locale } from "@/i18n/routing";

/**
 * The public address of the site. Set NEXT_PUBLIC_SITE_URL when the site gets
 * its own domain; every canonical link, sitemap entry and share link follows.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohammed-sedky-elborno.vercel.app"
).replace(/\/$/, "");

/** Open Graph language codes, as Facebook and WhatsApp expect them. */
export const OG_LOCALE: Record<Locale, string> = {
  ar: "ar_AR",
  tr: "tr_TR",
  en: "en_US",
};

/** The picture shown when a link is shared (1200 x 630, under 100 KB). */
export const SHARE_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
};

/** Other pages and profiles that identify the Sheikh as the same person. */
export const SAME_AS = [
  "https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D8%AF%D9%82%D9%8A_%D8%A7%D9%84%D8%A8%D9%88%D8%B1%D9%86%D9%88",
  "https://www.wikidata.org/wiki/Q133547660",
  "https://www.youtube.com/@MohammedSidqiAlborno",
];

/** The ways people write and search his name, in the three site languages. */
export const NAME_VARIANTS = [
  "محمد صدقي البورنو",
  "الشيخ محمد صدقي البورنو",
  "محمد البورنو",
  "محمد صدقي",
  "أبو الحارث الغزي",
  "محمد صدقي بن أحمد آل بورنو",
  "Muhammad Sidqi al-Burnu",
  "Mohammed Sedky El-Borno",
  "Mohammad Sidqi Al-Borno",
  "Muhammed Sedki El-Borno",
  "Muhammed Sıdkı el-Burnu",
];

export const pageUrl = (locale: string, path = "") =>
  `${SITE_URL}/${locale}${path}`;

/** hreflang links for one page in every language, plus the default. */
export function languageAlternates(path = "") {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, pageUrl(locale, path)]),
    ),
    "x-default": pageUrl(routing.defaultLocale, path),
  };
}

type PageSeo = {
  locale: Locale;
  /** The page's path without the language, such as "/books". */
  path?: string;
  title: string;
  description: string;
  keywords?: string;
  siteName: string;
  imageAlt?: string;
  type?: "website" | "profile";
};

/** Everything a page needs to rank in search and look right when shared. */
export function pageMetadata({
  locale,
  path = "",
  title,
  description,
  keywords,
  siteName,
  imageAlt,
  type = "website",
}: PageSeo): Metadata {
  const url = pageUrl(locale, path);

  return {
    title: { absolute: title },
    description,
    keywords: keywords?.split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((other) => other !== locale)
        .map((other) => OG_LOCALE[other]),
      images: [{ ...SHARE_IMAGE, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

type PageKey = "home" | "biography" | "books" | "media";

/** Metadata for one page, with its text taken from the language's messages. */
export async function seoFor(
  rawLocale: string,
  key: PageKey,
  path = "",
): Promise<Metadata> {
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({
    locale,
    path,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    keywords: t(`${key}.keywords`),
    siteName: t("site.name"),
    imageAlt: t("site.imageAlt"),
  });
}

// ---- Structured data (schema.org) ----

export const PERSON_ID = `${SITE_URL}/#sheikh`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type PersonDetails = {
  locale: Locale;
  name: string;
  description: string;
  jobTitle: string;
  knowsAbout: string;
  image?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  alumniOf?: string;
};

/** The Sheikh as a person, with every spelling of his name search engines may see. */
export function personJsonLd(details: PersonDetails) {
  const { locale, name, description, jobTitle, knowsAbout } = details;
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name,
    alternateName: NAME_VARIANTS,
    description,
    jobTitle,
    url: pageUrl(locale),
    image: details.image || SHARE_IMAGE.url,
    sameAs: SAME_AS,
    knowsAbout: knowsAbout.split(",").map((topic) => topic.trim()),
    ...(details.birthDate && { birthDate: details.birthDate }),
    ...(details.deathDate && { deathDate: details.deathDate }),
    ...(details.birthPlace && {
      birthPlace: { "@type": "Place", name: details.birthPlace },
    }),
    ...(details.alumniOf && {
      alumniOf: { "@type": "CollegeOrUniversity", name: details.alumniOf },
    }),
  };
}

export function websiteJsonLd(locale: Locale, name: string, description: string) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: pageUrl(locale),
    name,
    description,
    inLanguage: locale,
    about: { "@id": PERSON_ID },
  };
}

/** The trail Google can show instead of the plain address in results. */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(locale, item.path),
    })),
  };
}

export const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});
