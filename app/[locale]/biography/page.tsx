import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BiographyPage } from "@/components/pages/BiographyPage";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { toLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.biography" });
  return {
    metadataBase: new URL("https://mohammed-sedky-elborno.vercel.app"),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    icons: {
      icon: "/logo.svg",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: t("title"),
      images: [
        {
          url: "https://mohammed-sedky-elborno.vercel.app/metaGraph.svg",
          width: 1200,
          height: 630,
          alt: t("description"),
        },
      ],
    },
  };
}

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const preloaded = await preloadQuery(api.content.getBiography, {
    locale: toLocale(locale),
  });
  return <BiographyPage locale={locale} preloaded={preloaded} />;
}
