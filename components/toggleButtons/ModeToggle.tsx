"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeToNothing = () => () => {};

// "System" is only the starting point (the theme follows the visitor's OS until
// they choose); the button itself just flips between light and dark.
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common.theme");
  // The resolved theme is unknown on the server, so it is only used after
  // hydration; otherwise the markup would not match.
  const hydrated = React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const isDark = hydrated && resolvedTheme === "dark";
  const ariaLabel = hydrated ? t(isDark ? "dark" : "light") : t("change");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] scale-125 transition-all duration-500 ease-in-out",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 opacity-100",
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] scale-125 transition-all duration-500 ease-in-out",
          isDark ? "rotate-0 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  );
}
