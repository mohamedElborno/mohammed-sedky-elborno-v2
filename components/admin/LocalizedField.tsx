"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, type Localized } from "@/content/localized";

type Props = {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
};

export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  hint,
}: Props) {
  const [active, setActive] = useState<keyof Localized>("ar");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {LOCALE_LABELS.map((locale) => (
            <button
              key={locale.id}
              type="button"
              onClick={() => setActive(locale.id)}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                active === locale.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
                !value[locale.id] && "italic",
              )}
            >
              {locale.label}
              {!value[locale.id] && " •"}
            </button>
          ))}
        </div>
      </div>

      {multiline ? (
        <textarea
          dir={active === "ar" ? "rtl" : "ltr"}
          rows={rows}
          value={value[active]}
          onChange={(event) =>
            onChange({ ...value, [active]: event.target.value })
          }
          className="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        />
      ) : (
        <Input
          dir={active === "ar" ? "rtl" : "ltr"}
          value={value[active]}
          onChange={(event) =>
            onChange({ ...value, [active]: event.target.value })
          }
        />
      )}

      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
