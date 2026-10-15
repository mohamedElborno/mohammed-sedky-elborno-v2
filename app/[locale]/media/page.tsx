import { preloadQuery } from "convex/nextjs";
import { getTranslations } from "next-intl/server";
import { api } from "@/convex/_generated/api";
import { LessonsPage } from "@/components/pages/LessonsPage";
import { JsonLd } from "@/components/JsonLd";
import { toLocale } from "@/i18n/routing";
import { breadcrumbJsonLd, seoFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return seoFor(locale, "media", "/media");
}

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const preloaded = await preloadQuery(api.content.getLessons, { locale });
  const tNav = await getTranslations({ locale, namespace: "navigation" });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "" },
          { name: tNav("media"), path: "/media" },
        ])}
      />
      <LessonsPage preloaded={preloaded} />
    </>
  );
}
