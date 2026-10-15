"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  state: SaveState;
  error: string | null;
  onSave: () => void;
};

export function SaveBar({ state, error, onSave }: Props) {
  return (
    <div className="sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur md:px-5">
      <div aria-live="polite" className="min-h-6 text-sm font-medium">
        {state === "saved" && (
          <span className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="size-4" />
            تم الحفظ
          </span>
        )}
        {state === "error" && (
          <span className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="size-4" />
            {error ?? "فشل الحفظ"}
          </span>
        )}
        {state === "idle" && (
          <span className="text-muted-foreground">
            لا تُنشر التغييرات حتى تضغط حفظ
          </span>
        )}
      </div>
      <Button
        type="button"
        onClick={onSave}
        disabled={state === "saving"}
        className="h-11 min-w-32 rounded-xl px-8 text-base font-semibold"
      >
        {state === "saving" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            جارٍ الحفظ...
          </>
        ) : (
          "حفظ"
        )}
      </Button>
    </div>
  );
}
