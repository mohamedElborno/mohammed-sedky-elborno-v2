"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Convex queries hand back a fresh object on every update, so the form is
 * seeded only on the first load to avoid overwriting what is being typed.
 */
export function useEditorForm<T>(
  loaded: T | null | undefined,
  makeDefault: () => T,
) {
  const [form, setForm] = useState<T | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || loaded === undefined) return;
    seeded.current = true;
    setForm(loaded ?? makeDefault());
  }, [loaded, makeDefault]);

  return [form, setForm] as const;
}

export function stripSystemFields<T extends Record<string, unknown>>(
  doc: T | null | undefined,
) {
  if (!doc) return null;
  const { _id, _creationTime, ...rest } = doc as T & {
    _id: unknown;
    _creationTime: unknown;
  };
  void _id;
  void _creationTime;
  return rest;
}
