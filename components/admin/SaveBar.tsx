"use client";

import { Button } from "@/components/ui/button";

export type SaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  state: SaveState;
  error: string | null;
  onSave: () => void;
};

export function SaveBar({ state, error, onSave }: Props) {
  return (
    <div className="bg-background/90 sticky bottom-0 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="text-sm">
        {state === "saved" && <span className="text-green-600">تم الحفظ</span>}
        {state === "error" && (
          <span className="text-destructive">{error ?? "فشل الحفظ"}</span>
        )}
      </div>
      <Button type="button" onClick={onSave} disabled={state === "saving"}>
        {state === "saving" ? "جارٍ الحفظ..." : "حفظ"}
      </Button>
    </div>
  );
}
