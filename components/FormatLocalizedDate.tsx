import type { Locale } from "@/i18n/routing";

// Dates are stored as plain "YYYY-MM-DD" strings, so they are read in UTC to
// avoid shifting a day depending on the visitor's time zone.
export const formatLocalizedDate = (dateString: string, locale: Locale) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
    timeZone: "UTC",
  }).format(date);
};

export const formatYearOnly = (dateString: string) =>
  `${new Date(dateString).getUTCFullYear()}`;
