const VIDEO_ID = /^[\w-]{11}$/;

/**
 * The video id of any common YouTube link: watch?v=, youtu.be/, /embed/,
 * /shorts/, /live/, and the m., music. and nocookie variants. Returns null
 * for anything that is not a YouTube video link.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const link = new URL(url.trim());
    const host = link.hostname.replace(/^(www|m|music)\./, "");

    if (host === "youtu.be") {
      const id = link.pathname.slice(1).split("/")[0];
      return VIDEO_ID.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const fromQuery = link.searchParams.get("v");
      if (fromQuery && VIDEO_ID.test(fromQuery)) return fromQuery;
      const fromPath = link.pathname.match(
        /^\/(?:embed|shorts|live|v)\/([\w-]{11})/,
      );
      if (fromPath) return fromPath[1];
    }
  } catch {
    // Not a valid address.
  }
  return null;
}

export type ThumbnailQuality = "maxresdefault" | "hqdefault";

/** The thumbnail YouTube makes for a video, or "" if the link is not a video. */
export function youtubeThumbnail(
  url: string | null | undefined,
  quality: ThumbnailQuality = "hqdefault",
) {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : "";
}

/** The address that can be placed in an iframe to play the video. */
export function youtubeEmbedUrl(url: string) {
  const id = youtubeId(url);
  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    : url;
}
