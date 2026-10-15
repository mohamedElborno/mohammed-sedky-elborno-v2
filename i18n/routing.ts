import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "tr", "en"],
  defaultLocale: "ar",
  localeDetection: false, // disable locale detection
});

export type Locale = (typeof routing.locales)[number];

export function toLocale(value: string): Locale {
  return routing.locales.includes(value as Locale)
    ? (value as Locale)
    : routing.defaultLocale;
}
