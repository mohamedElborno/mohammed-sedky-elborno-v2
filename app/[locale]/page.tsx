import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePage } from "@/components/pages/home/HomePage";
import { toLocale } from "@/i18n/routing";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const preloaded = await preloadQuery(api.content.getHomePage, {
    locale: toLocale(locale),
  });
  return <HomePage locale={locale} preloaded={preloaded} />;
}
