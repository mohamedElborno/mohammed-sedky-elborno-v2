"use client";

import { useState } from "react";
import type { SaveState } from "./SaveBar";

export function useSave() {
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setState("saving");
    setError(null);
    try {
      await action();
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "فشل الحفظ");
      setState("error");
    }
  };

  return { state, error, run };
}
