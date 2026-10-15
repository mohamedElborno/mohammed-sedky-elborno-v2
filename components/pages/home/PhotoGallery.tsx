"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { GalleryPhoto } from "@/content/types";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/LogoLoader";

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const t = useTranslations("gallery");
  const rtl = useLocale() === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // The photo that has finished loading; the loader shows until it matches.
  const [readyIndex, setReadyIndex] = useState<number | null>(null);
  const total = photos.length;
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [edges, setEdges] = useState({ start: true, end: true });
  // Size and position of the scroll indicator, as fractions of its rail.
  const [bar, setBar] = useState({ size: 1, offset: 0 });
  const touchStartX = useRef<number | null>(null);

  // scrollLeft is 0 at the reading start in both directions (negative in RTL),
  // so the absolute value works for either.
  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const offset = Math.abs(track.scrollLeft);
    setEdges({
      start: offset <= 1,
      end: offset + track.clientWidth >= track.scrollWidth - 1,
    });
    const size = Math.min(1, track.clientWidth / track.scrollWidth);
    const travel = track.scrollWidth - track.clientWidth;
    setBar({ size, offset: travel > 0 ? (offset / travel) * (1 - size) : 0 });
  }, []);

  useEffect(() => {
    updateEdges();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateEdges, total]);

  const scrollTrack = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.8 * direction * (rtl ? -1 : 1);
    track.scrollBy({ left: amount, behavior: "smooth" });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: track.scrollLeft,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || !track) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > 5) {
      state.moved = true;
      track.setPointerCapture(event.pointerId);
    }
    if (state.moved) track.scrollLeft = state.startScroll - delta;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const step = useCallback(
    (direction: -1 | 1) =>
      setOpenIndex((current) =>
        current === null ? current : (current + direction + total) % total,
      ),
    [total],
  );

  // Arrow keys follow the page direction: the visual right/left arrow is
  // "next"/"previous" in LTR and the opposite in RTL.
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const forward = (event.key === "ArrowRight") !== rtl;
      step(forward ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, rtl, step]);

  if (total === 0) return null;
  const current = openIndex === null ? null : photos[openIndex];

  return (
    <section className="section-alt w-full py-16 md:py-24">
      <div className="container px-6 md:px-8">
        <div className="mb-8 space-y-2 md:mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("title")}</h2>
          <p className="text-lg text-muted-foreground">{t("description")}</p>
        </div>

        <div className="relative">
          <ul
            ref={trackRef}
            onScroll={updateEdges}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex cursor-grab select-none gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((photo, index) => (
              <li
                key={`${photo.image}-${index}`}
                className="w-60 shrink-0 sm:w-64 lg:w-72"
              >
                <button
                  type="button"
                  onClick={() => {
                    // A drag that ends over a photo must not open it.
                    if (drag.current.moved) {
                      drag.current.moved = false;
                      return;
                    }
                    setOpenIndex(index);
                  }}
                  aria-label={t("open", { index: index + 1 })}
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted"
                >
                  <Image
                    src={photo.image}
                    alt={photo.caption}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 18rem, 16rem"
                    draggable={false}
                    className="size-full object-cover"
                  />
                  {photo.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-12 text-start text-sm font-medium leading-snug text-white">
                      <span className="line-clamp-2">{photo.caption}</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {!(edges.start && edges.end) && (
            <>
              <div className="pointer-events-none mt-5 h-1 rounded-full bg-foreground/10" aria-hidden="true">
                <div
                  className="relative h-full rounded-full bg-foreground/40 transition-[inset-inline-start] duration-150"
                  style={{ width: `${bar.size * 100}%`, insetInlineStart: `${bar.offset * 100}%` }}
                />
              </div>
              <RowArrow
                label={t("previous")}
                hidden={edges.start}
                className="start-2"
                onClick={() => scrollTrack(-1)}
              >
                <ChevronLeft className="size-5 rtl:rotate-180" strokeWidth={2.25} />
              </RowArrow>
              <RowArrow
                label={t("next")}
                hidden={edges.end}
                className="end-2"
                onClick={() => scrollTrack(1)}
              >
                <ChevronRight className="size-5 rtl:rotate-180" strokeWidth={2.25} />
              </RowArrow>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={current !== null}
        onClose={() => setOpenIndex(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <Dialog.Panel
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              const start = touchStartX.current;
              touchStartX.current = null;
              if (start === null) return;
              const delta = event.changedTouches[0].clientX - start;
              if (Math.abs(delta) < 50) return;
              // Swiping toward the page start moves forward.
              step((delta < 0) !== rtl ? 1 : -1);
            }}
            className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4">
            {current && (
              <>
                <div className="relative flex min-h-48 min-w-48 items-center justify-center">
                  {readyIndex !== openIndex && (
                    <LogoLoader loop light className="absolute w-36" />
                  )}
                  <Image
                    key={openIndex}
                    src={current.image}
                    alt={current.caption}
                    width={1600}
                    height={1200}
                    sizes="100vw"
                    onLoad={() => setReadyIndex(openIndex)}
                    className={cn(
                      "max-h-[75vh] w-auto max-w-full rounded-3xl object-contain transition-opacity duration-300",
                      readyIndex === openIndex ? "opacity-100" : "opacity-0",
                    )}
                    priority
                  />
                </div>
                <div className="space-y-1 text-center text-white">
                  {current.caption && (
                    <p className="text-lg">{current.caption}</p>
                  )}
                  <p className="text-sm text-white/60" dir="ltr">
                    {t("counter", { current: (openIndex ?? 0) + 1, total })}
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label={t("close")}
              className="absolute end-0 top-0 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl transition-all hover:bg-white/25 active:scale-95"
            >
              <X className="size-5" strokeWidth={2.25} />
            </button>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("previous")}
                  className="absolute start-0 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl transition-all hover:bg-white/25 active:scale-95"
                >
                  <ChevronLeft className="size-5 rtl:rotate-180" strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("next")}
                  className="absolute end-0 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl transition-all hover:bg-white/25 active:scale-95"
                >
                  <ChevronRight className="size-5 rtl:rotate-180" strokeWidth={2.25} />
                </button>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
}

function RowArrow({
  label,
  hidden,
  className,
  onClick,
  children,
}: {
  label: string;
  hidden: boolean;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:bg-background/90 active:scale-95",
        hidden && "pointer-events-none opacity-0",
        className,
      )}
    >
      {children}
    </button>
  );
}
