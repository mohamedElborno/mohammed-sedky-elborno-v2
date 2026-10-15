"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  threshold?: number;
  isRtl?: boolean;
}

export function ScrollToTop({
  threshold = 400,
  isRtl = false,
}: ScrollToTopProps) {
  const t = useTranslations("common");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > threshold);
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("scrollToTop")}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        "fixed bottom-6 z-40 flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-background/90 active:scale-95",
        isRtl ? "left-6" : "right-6",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.25} />
    </button>
  );
}
