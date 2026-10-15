import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePage } from "@/components/pages/home/HomePage";
import { toLocale } from "@/i18n/routing";
import { seoFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return seoFor(locale, "home");
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const args = { locale: toLocale(locale) };
  const [preloaded, gallery] = await Promise.all([
    preloadQuery(api.content.getHomePage, args),
    preloadQuery(api.content.getGallery, args),
  ]);
  return <HomePage preloaded={preloaded} gallery={gallery} />;
}
