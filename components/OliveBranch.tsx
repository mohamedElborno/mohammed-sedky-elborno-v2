import Image from "next/image";
import { cn } from "@/lib/utils";

const BRANCHES = {
  1: { src: "/olive/branch-1.webp", width: 1100, height: 1100 },
  2: { src: "/olive/branch-2.webp", width: 1100, height: 825 },
  3: { src: "/olive/branch-3.webp", width: 1100, height: 825 },
  4: { src: "/olive/branch-4.webp", width: 825, height: 1100 },
  5: { src: "/olive/branch-5.webp", width: 1100, height: 825 },
  6: { src: "/olive/branch-6.webp", width: 1100, height: 825 },
} as const;

export type BranchId = keyof typeof BRANCHES;

// A decorative olive-branch engraving. The artwork is dark ink with a
// transparent background, so it inverts to light ink in dark mode. Place it
// inside a `relative` parent; the caller sets position, width and opacity.
export function OliveBranch({
  branch,
  className,
  eager = false,
}: {
  branch: BranchId;
  className?: string;
  eager?: boolean;
}) {
  const { src, width, height } = BRANCHES[branch];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      sizes="(min-width: 1024px) 560px, 320px"
      className={cn(
        "pointer-events-none absolute z-0 h-auto max-w-none select-none dark:invert",
        className,
      )}
    />
  );
}
