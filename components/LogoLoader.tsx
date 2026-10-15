"use client";

import { useEffect, useId, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ART_PATHS, LOGO_VIEWBOX } from "@/components/logo-art";
import {
  DOT_REVEAL_RADIUS,
  PEN_WIDTH,
  SEQUENCE,
  strokeToPath,
  type PenItem,
  type Point,
} from "@/components/logo-strokes";

// The logo is written with a pen. The real artwork is always what is on
// screen: a mask follows the pen path and uncovers the letters stroke by
// stroke, the pen tip rides the head of the stroke, and the diamonds are
// dotted in after their letters.

const LIFT = 26; // pen travel between strokes, counted as extra "length"
const DOT_TIME = 22; // time to put in a dot, counted the same way
const WORD_PAUSE = 75; // the pen rests a little between words
const NIB_RADIUS = 8;

const lengthOf = (points: readonly Point[]) =>
  points.reduce(
    (sum, point, i) =>
      i === 0
        ? 0
        : sum +
          Math.hypot(point[0] - points[i - 1][0], point[1] - points[i - 1][1]),
    0,
  );

const cost = (item: PenItem) =>
  item.kind === "stroke"
    ? lengthOf(item.points) + LIFT
    : item.kind === "dot"
      ? DOT_TIME
      : WORD_PAUSE;

// When each item starts and ends, as fractions of the whole pass.
const TIMELINE = (() => {
  const total = SEQUENCE.reduce((sum, item) => sum + cost(item), 0);
  let cursor = 0;
  return SEQUENCE.map((item) => {
    const lead = item.kind === "stroke" ? LIFT : 0;
    const start = (cursor + lead) / total;
    cursor += cost(item);
    return { start, end: cursor / total };
  });
})();

type Props = {
  className?: string;
  /** Write the logo, rub it out the same way, and repeat until removed. */
  loop?: boolean;
  /** Draw in white, for backgrounds that are dark in every theme. */
  light?: boolean;
  /** Called once when a single writing pass has finished (not when looping). */
  onDone?: () => void;
  /** Seconds one pass takes. */
  duration?: number;
};

export function LogoLoader({
  className,
  loop = false,
  light = false,
  onDone,
  duration = 2.4,
}: Props) {
  const t = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const maskId = `logo-pen-${useId().replace(/:/g, "")}`;

  const progress = useMotionValue(reduceMotion ? 1 : 0);
  // Uncovers whatever the pen path missed (tiny corners), so a finished pass
  // is always the complete logo.
  const completed = useMotionValue(reduceMotion ? 1 : 0);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const nibRef = useRef<SVGGElement>(null);
  const nibOpacity = useTransform(progress, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);

  // Keep the pen tip on the head of the stroke being drawn.
  useMotionValueEvent(progress, "change", (value) => {
    const nib = nibRef.current;
    if (!nib) return;
    const index = TIMELINE.findIndex(
      ({ start, end }, i) =>
        SEQUENCE[i].kind === "stroke" && value >= start && value <= end,
    );
    const path = index === -1 ? null : pathRefs.current[index];
    if (!path) return;
    const { start, end } = TIMELINE[index];
    const at = ((value - start) / (end - start)) * path.getTotalLength();
    const point = path.getPointAtLength(at);
    nib.setAttribute("transform", `translate(${point.x} ${point.y})`);
  });

  useEffect(() => {
    if (reduceMotion) {
      onDone?.();
      return;
    }

    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    const play = (
      value: MotionValue<number>,
      to: number,
      seconds: number,
      ease: "linear" | "easeInOut" = "easeInOut",
    ) => {
      const running = animate(value, to, { duration: seconds, ease });
      controls = running;
      return running.finished;
    };
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      do {
        progress.set(0);
        completed.set(0);
        await play(progress, 1, duration, "linear");
        if (cancelled) return;
        await play(completed, 1, 0.25);
        if (cancelled) return;
        if (!loop) {
          onDone?.();
          return;
        }
        await wait(700);
        if (cancelled) return;
        // Then the pen retraces the whole drawing in reverse, rubbing it out
        // the way it was written.
        await play(completed, 0, 0.25);
        if (cancelled) return;
        await play(progress, 0, duration, "linear");
        if (cancelled) return;
        await wait(350);
      } while (!cancelled);
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [completed, duration, loop, onDone, progress, reduceMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("loading")}
      className={cn(
        "relative inline-block",
        light ? "text-white" : "text-foreground",
        className,
      )}
      style={{ aspectRatio: `${LOGO_VIEWBOX.width} / ${LOGO_VIEWBOX.height}` }}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-20}
            y={-20}
            width={LOGO_VIEWBOX.width + 40}
            height={LOGO_VIEWBOX.height + 40}
          >
            <g
              fill="none"
              stroke="white"
              strokeWidth={PEN_WIDTH}
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              {SEQUENCE.map((item, index) =>
                item.kind === "stroke" ? (
                  <Stroke
                    key={index}
                    d={strokeToPath(item.points)}
                    progress={progress}
                    start={TIMELINE[index].start}
                    end={TIMELINE[index].end}
                    pathRef={(node) => {
                      pathRefs.current[index] = node;
                    }}
                  />
                ) : null,
              )}
            </g>
            {SEQUENCE.map((item, index) =>
              item.kind === "dot" ? (
                <DotReveal
                  key={index}
                  x={item.x}
                  y={item.y}
                  progress={progress}
                  start={TIMELINE[index].start}
                  end={TIMELINE[index].end}
                />
              ) : null,
            )}
            <motion.rect
              x={-20}
              y={-20}
              width={LOGO_VIEWBOX.width + 40}
              height={LOGO_VIEWBOX.height + 40}
              fill="white"
              style={{ opacity: completed }}
            />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`} fill="currentColor">
          {ART_PATHS.map((d, index) => (
            <path key={index} d={d} />
          ))}
        </g>

        <motion.g style={{ opacity: nibOpacity }}>
          <g ref={nibRef}>
            <circle r={NIB_RADIUS * 2} fill="currentColor" opacity={0.12} />
            <circle r={NIB_RADIUS} fill="currentColor" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

function Stroke({
  d,
  progress,
  start,
  end,
  pathRef,
}: {
  d: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  pathRef: (node: SVGPathElement | null) => void;
}) {
  const pathLength = useTransform(progress, [start, end], [0, 1], {
    clamp: true,
  });
  // A zero-length dash with square caps still paints a small square, so the
  // stroke stays hidden until the pen actually reaches it.
  const opacity = useTransform(progress, (value) => (value > start ? 1 : 0));
  return <motion.path ref={pathRef} d={d} style={{ pathLength, opacity }} />;
}

function DotReveal({
  x,
  y,
  progress,
  start,
  end,
}: {
  x: number;
  y: number;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const scale = useTransform(progress, [start, end], [0, 1], { clamp: true });
  // The group places the circle; the circle is centred on the origin so it
  // grows around its own middle.
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.circle
        r={DOT_REVEAL_RADIUS}
        fill="white"
        style={{ scale, transformOrigin: "0px 0px" }}
      />
    </g>
  );
}
