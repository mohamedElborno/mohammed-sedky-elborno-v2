import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LayoutClient from "@/components/layout/LayoutClient";
import { JsonLd } from "@/components/JsonLd";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, toLocale } from "@/i18n/routing";
import { thmanyah } from "@/app/fonts/thmanyah";
import { SITE_URL, graph, personJsonLd, websiteJsonLd } from "@/lib/seo";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

// Site-wide settings. Each page sets its own title, description, canonical
// link, language alternates and share card (see lib/seo.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const t = await getTranslations({
    locale: toLocale(rawLocale),
    namespace: "metadata",
  });

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t("site.name"),
    authors: [{ name: t("person.name") }],
    creator: t("person.name"),
    category: "religion",
    icons: {
      icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "google-site-verification": "s0Dj8N7kfJLX9pGqhwkhmUP87lw9aKCWqXtXZCDbGIE",
    },
  };
}

// Root layout for the app
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "metadata" });

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={thmanyah.variable}
      suppressHydrationWarning
    >
      <head>
        <JsonLd
          data={graph(
            websiteJsonLd(locale, t("site.name"), t("home.description")),
            personJsonLd({
              locale,
              name: t("person.name"),
              description: t("person.description"),
              jobTitle: t("person.jobTitle"),
              knowsAbout: t("person.knowsAbout"),
            }),
          )}
        />
      </head>
      <body className="overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LayoutClient locale={locale}>{children}</LayoutClient>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
