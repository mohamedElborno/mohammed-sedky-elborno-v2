import type { Metadata } from "next";
import LayoutClient from "@/components/layout/LayoutClient";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { thmanyah } from "@/app/fonts/thmanyah";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    metadataBase: new URL("https://mohammed-sedky-elborno.vercel.app"),
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/logo.svg",
    },
    other: {
      "google-site-verification": "s0Dj8N7kfJLX9pGqhwkhmUP87lw9aKCWqXtXZCDbGIE",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: t("title"),
      images: [
        {
          url: "https://mohammed-sedky-elborno.vercel.app/photoGraph.png",
          width: 1200,
          height: 630,
          alt: t("description"),
        },
      ],
    },
  };
}

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
  const t = await getTranslations({ locale });
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t("metadata.person.name"),
    description: t("biography.subtitle"),
    image: "https://mohammed-sedky-elborno.vercel.app/photoGraph.png",
    sameAs: ["https://www.youtube.com/@MohammedSidqiAlborno"],
  };

  return (
    <html lang={locale} className={thmanyah.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // "<" is escaped so translated text can never close the tag.
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LayoutClient locale={locale}>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
