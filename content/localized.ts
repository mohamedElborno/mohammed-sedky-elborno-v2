export type Localized = { ar: string; tr: string; en: string };

export const LOCALE_LABELS: { id: keyof Localized; label: string }[] = [
  { id: "ar", label: "العربية" },
  { id: "tr", label: "Türkçe" },
  { id: "en", label: "English" },
];

export const emptyLocalized = (): Localized => ({ ar: "", tr: "", en: "" });
