"use client";
import type React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "../providers/theme-provider";
import { Roboto, Cairo } from "next/font/google";
import Footer from "./footer/Footer";
import Navbar from "./navbar/Navbar";
import { ScrollToTop } from "./scroll-to-top";
import LoadingIndicator from "./Loading";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL مفقود من ملف البيئة");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-cairo",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export default function LayoutClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const isRtl = locale === "tr";

  return (
    <div
      className={`${cairo.variable} ${roboto.variable} ${locale === "ar" ? "font-cairo" : "font-roboto tracking-wider"}`}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mt-20 min-h-screen">
        <ConvexProvider client={convex}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
            <Footer />
            <LoadingIndicator />
          </ThemeProvider>
        </ConvexProvider>
        <ScrollToTop isRtl={isRtl} />
      </div>
    </div>
  );
}
