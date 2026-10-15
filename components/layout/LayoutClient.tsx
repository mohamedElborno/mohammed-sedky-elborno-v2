"use client";
import type React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "../providers/theme-provider";
import Footer from "./footer/Footer";
import Navbar from "./navbar/Navbar";
import { ScrollToTop } from "./scroll-to-top";
import { SplashScreen } from "./SplashScreen";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL مفقود من ملف البيئة");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function LayoutClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const isRtl = locale === "ar";

  return (
    <>
      <SplashScreen />
    <div
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mt-20 flex min-h-[calc(100svh-5rem)] flex-col">
        <ConvexProvider client={convex}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </ConvexProvider>
        <ScrollToTop isRtl={isRtl} />
      </div>
    </div>
    </>
  );
}
