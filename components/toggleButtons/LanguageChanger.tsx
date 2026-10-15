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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Each language is listed by its own name (and its note is in that language),
// so a reader can find theirs whatever language the page is in right now.
const LOCALE_NAMES: Record<Locale, string> = {
  ar: "العربية",
  tr: "Türkçe",
  en: "English",
};

// Arabic is the source language; the others are machine translated.
const TRANSLATION_NOTES: Partial<Record<Locale, string>> = {
  tr: "Çeviri yapay zeka ile yapılmıştır.",
  en: "This translation was generated with AI.",
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
        <TooltipProvider>
          {routing.locales.map((locale) => {
            const note = TRANSLATION_NOTES[locale];
            const name = LOCALE_NAMES[locale];

            return (
              <DropdownMenuItem
                key={locale}
                onClick={() => handleChange(locale)}
              >
                {note ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">{name}</div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="mt-1 bg-popover text-popover-foreground border"
                    >
                      <p>{note}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  name
                )}
              </DropdownMenuItem>
            );
          })}
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
