"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog } from "@headlessui/react";
import { useMutation } from "convex/react";
import { Loader2, RotateCcw, RotateCw } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Pictures are saved no larger than this on their longest side. */
const MAX_SIDE = 2400;

type Source = File | string;

type Request = {
  /** A file chosen from the computer, or the address of an uploaded image. */
  source: Source;
  /** Width / height of the frame this picture is shown in, if it is fixed. */
  aspect?: number;
  /** Offer to keep a new file exactly as it is, without cropping. */
  allowOriginal?: boolean;
};

type Session = Request & {
  src: string;
  type: string;
  resolve: (id: Id<"_storage"> | null) => void;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذّر فتح الصورة"));
    image.src = src;
  });

/** Draws the chosen part of the (rotated) picture and returns it as a file. */
async function cropToBlob(
  src: string,
  area: Area,
  rotation: number,
  type: string,
): Promise<Blob> {
  const image = await loadImage(src);
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const width = image.width * cos + image.height * sin;
  const height = image.width * sin + image.height * cos;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("تعذّر تجهيز الصورة");
  context.translate(width / 2, height / 2);
  context.rotate(radians);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const scale = Math.min(1, MAX_SIDE / Math.max(area.width, area.height));
  const output = document.createElement("canvas");
  output.width = Math.round(area.width * scale);
  output.height = Math.round(area.height * scale);
  const outContext = output.getContext("2d");
  if (!outContext) throw new Error("تعذّر تجهيز الصورة");
  outContext.drawImage(
    canvas,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    output.width,
    output.height,
  );

  return new Promise((resolve, reject) =>
    output.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("تعذّر حفظ الصورة"))),
      type,
      0.92,
    ),
  );
}

const PRESETS = [
  { id: "original", label: "الأصلي" },
  { id: "1", label: "1:1", value: 1 },
  { id: "5/4", label: "5:4", value: 5 / 4 },
  { id: "4/3", label: "4:3", value: 4 / 3 },
  { id: "16/9", label: "16:9", value: 16 / 9 },
  { id: "4/5", label: "4:5", value: 4 / 5 },
  { id: "3/4", label: "3:4", value: 3 / 4 },
  { id: "2/3", label: "2:3", value: 2 / 3 },
] as const;

/**
 * Opens an editor to crop, zoom and rotate a picture, and uploads the result.
 * `open()` resolves with the new file's id, or null if the editor was closed.
 */
export function useImageEditor() {
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Object URLs hold the picture in memory until they are released.
  useEffect(
    () => () => {
      if (sessionRef.current?.src.startsWith("blob:")) {
        URL.revokeObjectURL(sessionRef.current.src);
      }
    },
    [],
  );

  const upload = useCallback(
    async (body: Blob) => {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": body.type || "application/octet-stream" },
        body,
      });
      if (!response.ok) throw new Error(`فشل الرفع (${response.status})`);
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      return storageId;
    },
    [generateUploadUrl],
  );

  const open = useCallback(
    async (request: Request) => {
      // Vector and animated pictures cannot be cropped without flattening them.
      if (
        request.source instanceof File &&
        /^image\/(svg\+xml|gif)$/.test(request.source.type)
      ) {
        return upload(request.source);
      }

      let src: string;
      let type: string;
      if (request.source instanceof File) {
        src = URL.createObjectURL(request.source);
        type = request.source.type;
      } else {
        // Fetched first so the picture can be drawn without browser restrictions.
        const response = await fetch(request.source);
        if (!response.ok) throw new Error("تعذّر تحميل الصورة للتعديل");
        const blob = await response.blob();
        src = URL.createObjectURL(blob);
        type = blob.type;
      }

      return new Promise<Id<"_storage"> | null>((resolve) => {
        setSession({ ...request, src, type, resolve });
      });
    },
    [upload],
  );

  const finish = (id: Id<"_storage"> | null) => {
    if (!session) return;
    URL.revokeObjectURL(session.src);
    session.resolve(id);
    setSession(null);
  };

  const dialog = session ? (
    <EditorDialog
      key={session.src}
      session={session}
      upload={upload}
      onFinish={finish}
    />
  ) : null;

  return { open, dialog };
}

function EditorDialog({
  session,
  upload,
  onFinish,
}: {
  session: Session;
  upload: (body: Blob) => Promise<Id<"_storage">>;
  onFinish: (id: Id<"_storage"> | null) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [natural, setNatural] = useState<number | null>(null);
  const [preset, setPreset] = useState<string>(
    session.aspect
      ? (PRESETS.find((p) => "value" in p && Math.abs(p.value - session.aspect!) < 0.01)?.id ?? "custom")
      : "original",
  );
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImage(session.src).then((image) => {
      if (!cancelled) setNatural(image.width / image.height);
    });
    return () => {
      cancelled = true;
    };
  }, [session.src]);

  const aspect =
    preset === "custom"
      ? (session.aspect ?? 1)
      : preset === "original"
        ? (natural ?? 1)
        : (PRESETS.find((p) => p.id === preset && "value" in p) as
            | { value: number }
            | undefined)?.value ?? 1;

  const outputType = session.type === "image/png" ? "image/png" : "image/jpeg";

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await cropToBlob(session.src, area, rotation, outputType);
      onFinish(await upload(blob));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "فشل حفظ الصورة");
      setBusy(false);
    }
  };

  const useOriginal = async () => {
    if (!(session.source instanceof File)) return;
    setBusy(true);
    setError(null);
    try {
      onFinish(await upload(session.source));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "فشل رفع الصورة");
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={() => (busy ? undefined : onFinish(null))}
      className="admin-ui relative z-50"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <Dialog.Panel className="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-4 text-foreground shadow-2xl sm:p-6">
          <div className="space-y-1">
            <Dialog.Title className="text-lg font-bold">
              قص الصورة وتحديد مركزها
            </Dialog.Title>
            <p className="text-sm text-muted-foreground">
              حرّك الصورة داخل الإطار ليبقى الجزء المهم في المنتصف، وكبّرها أو
              أدِرها بالأدوات أسفلها.
            </p>
          </div>

          <div className="relative h-[50vh] min-h-72 overflow-hidden rounded-xl bg-neutral-900">
            <Cropper
              image={session.src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              minZoom={1}
              maxZoom={4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, pixels) => setArea(pixels)}
              showGrid
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">شكل الإطار:</span>
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  preset === item.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex min-w-48 flex-1 items-center gap-3 text-sm font-semibold">
              التكبير
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="flex-1 accent-primary"
              />
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="تدوير لليسار"
                onClick={() => setRotation((value) => value - 90)}
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="تدوير لليمين"
                onClick={() => setRotation((value) => value + 90)}
              >
                <RotateCw className="size-4" />
              </Button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => onFinish(null)}
            >
              إلغاء
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {session.allowOriginal && session.source instanceof File && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={useOriginal}
                >
                  استخدام الصورة كما هي
                </Button>
              )}
              <Button
                type="button"
                disabled={busy || !area}
                onClick={apply}
                className="min-w-32 font-semibold"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  "تطبيق"
                )}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
