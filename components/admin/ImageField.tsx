"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { Crop, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useImageEditor } from "@/components/admin/useImageEditor";

type Props = {
  label: string;
  value: Id<"_storage"> | null;
  onChange: (value: Id<"_storage"> | null) => void;
  /** Width / height of the frame the picture is shown in, e.g. 2 / 3 for a book cover. */
  aspect?: number;
};

export function ImageField({ label, value, onChange, aspect }: Props) {
  const urls = useQuery(
    api.admin.getImageUrls,
    value ? { ids: [value] } : "skip",
  );
  const editor = useImageEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = value ? urls?.[value] : null;

  const run = async (task: () => Promise<Id<"_storage"> | null>) => {
    setBusy(true);
    setError(null);
    try {
      const id = await task();
      if (id) onChange(id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "فشل رفع الصورة");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold">{label}</span>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border border-input bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={label}
              width={112}
              height={112}
              className="size-28 object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xs text-muted-foreground">لا صورة</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file)
                void run(() =>
                  editor.open({ source: file, aspect, allowOriginal: true }),
                );
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {value ? "استبدال" : "رفع صورة"}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(() => editor.open({ source: previewUrl, aspect }))
              }
            >
              <Crop className="size-4" />
              قص وتعديل
            </Button>
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4 text-destructive" />
              إزالة
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {editor.dialog}
    </div>
  );
}
