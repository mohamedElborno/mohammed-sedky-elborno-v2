"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { YouTubeThumb } from "@/components/YouTubeThumb";
import { youtubeEmbedUrl } from "@/lib/youtube";

interface YouTubeModalProps {
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function YouTubeModal({
  videoUrl,
  thumbnailUrl,
}: YouTubeModalProps) {
  const t = useTranslations("common.video");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="group relative w-full cursor-pointer overflow-hidden rounded-2xl dark:shadow-gray-500/20 shadow hover:shadow-lg duration-300"
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t("play")}
      >
        {/* The uploaded thumbnail, or else the video's own one from YouTube. */}
        <div className="relative aspect-video w-full rounded-2xl bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={t("thumbnailAlt")}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="rounded-2xl object-cover"
              priority
            />
          ) : (
            <YouTubeThumb
              url={videoUrl}
              alt={t("thumbnailAlt")}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="rounded-2xl object-cover"
              priority
            />
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
          <svg
            className="size-12 text-white/90 drop-shadow transition-transform duration-300 group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 rounded-2xl"
      >
        <div
          className="fixed inset-0 bg-black/80 rounded-2xl"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 rounded-2xl">
          <Dialog.Panel className="relative bg-black rounded-lg max-w-3xl w-full aspect-video">
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t("close")}
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1 hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={youtubeEmbedUrl(videoUrl)}
              title={t("title")}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
