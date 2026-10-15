import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { getTranslations } from "next-intl/server";
import { api } from "@/convex/_generated/api";
import { BiographyPage } from "@/components/pages/BiographyPage";
import { JsonLd } from "@/components/JsonLd";
import { toLocale } from "@/i18n/routing";
import {
  breadcrumbJsonLd,
  graph,
  personJsonLd,
  pageUrl,
  seoFor,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return seoFor(locale, "biography", "/biography");
}

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const preloaded = await preloadQuery(api.content.getBiography, { locale });
  const biography = preloadedQueryResult(preloaded);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tNav = await getTranslations({ locale, namespace: "navigation" });

  // The person's details come from the same data the page shows, so search
  // engines and visitors always see the same facts.
  const card = biography?.card;
  const person = personJsonLd({
    locale,
    name: card?.name || t("person.name"),
    description: t("person.description"),
    jobTitle: t("person.jobTitle"),
    knowsAbout: t("person.knowsAbout"),
    image: card?.image || undefined,
    birthDate: card?.birthDate || undefined,
    deathDate: card?.deathDate || undefined,
    birthPlace: card?.birthPlace || undefined,
    alumniOf: card?.majorEducationalInstitution || undefined,
  });

  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "ProfilePage",
            "@id": `${pageUrl(locale, "/biography")}#profile`,
            url: pageUrl(locale, "/biography"),
            name: t("biography.title"),
            description: t("biography.description"),
            inLanguage: locale,
            mainEntity: person,
          },
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "" },
          { name: tNav("biography"), path: "/biography" },
        ])}
      />
      <BiographyPage locale={locale} preloaded={preloaded} />
    </>
  );
}
