import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { getTranslations } from "next-intl/server";
import { api } from "@/convex/_generated/api";
import { BooksPage } from "@/components/pages/BooksPage";
import { JsonLd } from "@/components/JsonLd";
import { toLocale } from "@/i18n/routing";
import {
  PERSON_ID,
  breadcrumbJsonLd,
  graph,
  pageUrl,
  seoFor,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return seoFor(locale, "books", "/books");
}

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const preloaded = await preloadQuery(api.content.getBooks, { locale });
  const books = preloadedQueryResult(preloaded);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tNav = await getTranslations({ locale, namespace: "navigation" });

  return (
    <>
      <JsonLd
        data={graph({
          "@type": "CollectionPage",
          url: pageUrl(locale, "/books"),
          name: t("books.title"),
          description: t("books.description"),
          inLanguage: locale,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: books.map((book, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Book",
                name: book.title,
                ...(book.description && { description: book.description }),
                ...(book.coverImage && { image: book.coverImage }),
                ...(book.url && { url: book.url }),
                inLanguage: "ar",
                author: { "@id": PERSON_ID },
              },
            })),
          },
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "" },
          { name: tNav("books"), path: "/books" },
        ])}
      />
      <BooksPage locale={locale} preloaded={preloaded} />
    </>
  );
}
