"use client";

import { useState } from "react";
import Image from "next/image";
import {
  youtubeThumbnail,
  type ThumbnailQuality,
} from "@/lib/youtube";

/**
 * A video's own YouTube thumbnail. It asks for the sharp widescreen version
 * first, and falls back to the standard one for videos that have no HD image.
 */
export function YouTubeThumb({
  url,
  alt,
  sizes,
  className,
  priority,
}: {
  url: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [quality, setQuality] = useState<ThumbnailQuality>("maxresdefault");
  const [failed, setFailed] = useState(false);

  const src = youtubeThumbnail(url, quality);
  if (!src || failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (quality === "maxresdefault") setQuality("hqdefault");
        else setFailed(true);
      }}
    />
  );
}
