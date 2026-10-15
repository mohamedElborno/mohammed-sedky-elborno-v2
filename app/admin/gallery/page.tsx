"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection } from "@/components/admin/FormSection";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { SaveBar } from "@/components/admin/SaveBar";
import {
  stripSystemFields,
  useEditorForm,
} from "@/components/admin/useEditorForm";
import { useSave } from "@/components/admin/useSave";
import { Button } from "@/components/ui/button";
import { emptyLocalized } from "@/content/localized";
import { cn } from "@/lib/utils";

type GalleryForm = Omit<Doc<"gallery">, "_id" | "_creationTime">;
type Photo = GalleryForm["photos"][number];

const makeDefault = (): GalleryForm => ({ photos: [] });

/** How many files are sent to Convex storage at the same time. */
const UPLOAD_BATCH = 3;

export default function GalleryEditor() {
  return (
    <AdminShell>
      <Editor />
    </AdminShell>
  );
}

function Editor() {
  const doc = useQuery(api.admin.getGallery);
  const save = useMutation(api.admin.saveGallery);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const { state, error, run } = useSave();
  const [form, setForm] = useEditorForm<GalleryForm>(
    doc === undefined ? undefined : (stripSystemFields(doc) as GalleryForm),
    makeDefault,
  );
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number }>();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const ids = (form?.photos ?? [])
    .map((photo) => photo.image)
    .filter((id): id is Id<"_storage"> => id !== null);
  const urls = useQuery(
    api.admin.getImageUrls,
    ids.length > 0 ? { ids } : "skip",
  );

  if (!form) {
    return <p className="text-muted-foreground py-20 text-center">تحميل...</p>;
  }

  const photos = form.photos;
  const setPhotos = (next: Photo[]) => setForm({ ...form, photos: next });
  const current = photos[selected] as Photo | undefined;

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;

    setUploadErrors([]);
    setProgress({ done: 0, total: images.length });
    const added: (Photo | null)[] = new Array(images.length).fill(null);
    const failed: string[] = [];
    let done = 0;

    for (let start = 0; start < images.length; start += UPLOAD_BATCH) {
      await Promise.all(
        images.slice(start, start + UPLOAD_BATCH).map(async (file, offset) => {
          try {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!response.ok) throw new Error(`(${response.status})`);
            const { storageId } = (await response.json()) as {
              storageId: Id<"_storage">;
            };
            added[start + offset] = {
              image: storageId,
              caption: emptyLocalized(),
            };
          } catch {
            failed.push(file.name);
          } finally {
            done += 1;
            setProgress({ done, total: images.length });
          }
        }),
      );
    }

    const uploaded = added.filter((photo): photo is Photo => photo !== null);
    if (uploaded.length > 0) {
      setSelected(photos.length);
      setPhotos([...photos, ...uploaded]);
    }
    setUploadErrors(failed);
    setProgress(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateCurrent = (next: Photo) =>
    setPhotos(photos.map((photo, i) => (i === selected ? next : photo)));

  const remove = () => {
    setPhotos(photos.filter((_, i) => i !== selected));
    setSelected(Math.max(0, Math.min(selected, photos.length - 2)));
  };

  // The panel is right-to-left, so "earlier" photos sit toward the right.
  const move = (direction: -1 | 1) => {
    const target = selected + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[selected], next[target]] = [next[target], next[selected]];
    setPhotos(next);
    setSelected(target);
  };

  const uploading = progress !== undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ألبوم الصور</h1>
      <p className="text-muted-foreground text-sm">
        تظهر الصور في الصفحة الرئيسية بنفس ترتيبها هنا. عنوان القسم ثابت في
        ملفات الترجمة.
      </p>

      <FormSection
        title="الصور"
        description={`${photos.length} صورة. اختر أكثر من صورة دفعة واحدة، ثم اضغط على أي صورة لتعديل وصفها أو ترتيبها.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void uploadFiles([...(event.target.files ?? [])])}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            {uploading
              ? `جارٍ الرفع ${progress.done} / ${progress.total}...`
              : "إضافة صور"}
          </Button>
        </div>

        {uploadErrors.length > 0 && (
          <p className="text-destructive text-sm">
            تعذّر رفع: {uploadErrors.join("، ")}
          </p>
        )}

        {photos.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
            لا صور بعد
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {photos.map((photo, index) => {
              const url = photo.image ? urls?.[photo.image] : null;
              return (
                <li key={`${photo.image}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-label={`صورة ${index + 1}`}
                    aria-current={index === selected}
                    className={cn(
                      "bg-muted relative block aspect-square w-full overflow-hidden rounded-xl border-2 transition-all",
                      index === selected
                        ? "border-primary"
                        : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    {url && (
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <span className="absolute start-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white">
                      {index + 1}
                    </span>
                    {photo.caption.ar && (
                      <span className="absolute end-1 bottom-1 size-2 rounded-full bg-green-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </FormSection>

      {current && (
        <FormSection title={`الصورة ${selected + 1}`}>
          <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
            <div className="bg-muted relative aspect-square w-full max-w-56 overflow-hidden rounded-2xl border">
              {current.image && urls?.[current.image] && (
                <Image
                  src={urls[current.image] as string}
                  alt=""
                  fill
                  sizes="224px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

            <div className="space-y-4">
              <LocalizedField
                label="الوصف (اختياري)"
                value={current.caption}
                onChange={(caption) => updateCurrent({ ...current, caption })}
                multiline
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={selected === 0}
                  onClick={() => move(-1)}
                >
                  <ArrowRight className="size-4" />
                  تقديم
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={selected === photos.length - 1}
                  onClick={() => move(1)}
                >
                  تأخير
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={remove}
                >
                  <Trash2 className="size-4" />
                  حذف الصورة
                </Button>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      <SaveBar
        state={state}
        error={error}
        onSave={() => run(() => save(form))}
      />
    </div>
  );
}
