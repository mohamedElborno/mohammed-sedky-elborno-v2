"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Languages } from "lucide-react";

// Each language is listed by its own name, so a reader can find theirs
// whatever language the page is in right now.
const LOCALE_NAMES: Record<Locale, string> = {
  ar: "العربية",
  tr: "Türkçe",
  en: "English",
};

export default function LanguageChanger() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("common");

  // Switching is a client-side navigation: keep the reader where they were
  // instead of jumping back to the top, which made it feel like a reload.
  const handleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    router.replace(pathname, { locale: newLocale, scroll: false });
  };

  // Fetch the other languages while the menu is open so the switch is instant.
  const prefetchLocales = (open: boolean) => {
    if (!open) return;
    for (const locale of routing.locales) {
      if (locale !== currentLocale) router.prefetch(pathname, { locale });
    }
  };

  return (
    <DropdownMenu onOpenChange={prefetchLocales}>
      <DropdownMenuTrigger asChild value={currentLocale}>
        <Button
          variant="ghost"
          size="icon"
          className="transition-colors hover:bg-foreground/10 dark:hover:bg-foreground/10"
          aria-label={t("changeLanguage")}
        >
          <Languages className="scale-125" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {routing.locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => handleChange(locale)}>
            {LOCALE_NAMES[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
