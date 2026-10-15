"use client";

import { useId, useState } from "react";
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
  const id = useId();
  const [active, setActive] = useState<keyof Localized>("ar");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <div
          role="tablist"
          aria-label={label}
          className="flex items-center gap-0.5 rounded-lg bg-muted p-1"
        >
          {LOCALE_LABELS.map((locale) => {
            const filled = Boolean(value[locale.id]);
            return (
              <button
                key={locale.id}
                type="button"
                role="tab"
                aria-selected={active === locale.id}
                onClick={() => setActive(locale.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  active === locale.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {locale.label}
                <span
                  aria-label={filled ? "مكتوب" : "فارغ"}
                  className={cn(
                    "size-1.5 rounded-full",
                    filled ? "bg-emerald-600" : "bg-amber-500",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <textarea
          id={id}
          dir={active === "ar" ? "rtl" : "ltr"}
          rows={rows}
          value={value[active]}
          onChange={(event) =>
            onChange({ ...value, [active]: event.target.value })
          }
          className="w-full rounded-md border border-input bg-white px-3 py-2.5 text-[15px] leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
      ) : (
        <Input
          id={id}
          dir={active === "ar" ? "rtl" : "ltr"}
          value={value[active]}
          onChange={(event) =>
            onChange({ ...value, [active]: event.target.value })
          }
        />
      )}

      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
