"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  value: Id<"_storage"> | null;
  onChange: (value: Id<"_storage"> | null) => void;
};

export function ImageField({ label, value, onChange }: Props) {
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const urls = useQuery(
    api.admin.getImageUrls,
    value ? { ids: [value] } : "skip",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = value ? urls?.[value] : null;

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error(`فشل الرفع (${response.status})`);
      }
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      onChange(storageId);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "فشل رفع الصورة",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-muted/40 flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={label}
              width={96}
              height={96}
              className="h-24 w-24 object-cover"
              unoptimized
            />
          ) : (
            <span className="text-muted-foreground text-xs">لا صورة</span>
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
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "جارٍ الرفع..." : value ? "استبدال" : "رفع صورة"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange(null)}
            >
              إزالة
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
