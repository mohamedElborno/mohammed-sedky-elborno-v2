"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type TimelineEntry = { year: string; title: string; image?: string };

const EASE = [0.32, 0.72, 0, 1] as const;

// The event's picture sits behind it, faint, with its edges dissolved into
// the card instead of ending in a hard border.
const FEATHER =
  "radial-gradient(ellipse 90% 90% at 50% 50%, #000 10%, transparent 100%)";

// A vertical timeline for the side column: a line runs down it and fills in as
// the reader scrolls, each event fades in, and its dot lights up when reached.
export function BiographyTimeline({
  title,
  entries,
  className,
}: {
  title: string;
  entries: TimelineEntry[];
  className?: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className={className}>
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>

      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-[7px] w-0.5 bg-foreground/15"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: reduceMotion ? 1 : fill }}
          className="absolute inset-y-0 start-[7px] w-0.5 origin-top bg-foreground"
        />

        <ol ref={listRef} className="relative space-y-4">
          {entries.map((entry, index) => (
            <TimelineItem
              key={index}
              entry={entry}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({
  entry,
  reduceMotion,
}: {
  entry: TimelineEntry;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // Lit once the event has reached the middle of the screen.
  const reached = useInView(ref, { margin: "0px 0px -50% 0px" });

  return (
    <li ref={ref} className="relative ps-9">
      <span
        aria-hidden="true"
        className={cn(
          "absolute start-0 top-5 z-10 size-4 rounded-full border-2 border-foreground bg-background transition-all duration-500",
          reached && "bg-foreground ring-4 ring-foreground/15",
        )}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border bg-card px-4 py-3.5"
      >
        {entry.image && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ maskImage: FEATHER, WebkitMaskImage: FEATHER }}
          >
            <Image
              src={entry.image}
              alt=""
              fill
              sizes="22rem"
              className="object-cover opacity-25"
            />
          </div>
        )}

        <div className="relative space-y-0.5">
          <p className="text-xl font-bold tabular-nums">{entry.year}</p>
          <p
            className={cn(
              "text-[15px] leading-relaxed",
              entry.image ? "text-foreground/85" : "text-muted-foreground",
            )}
          >
            {entry.title}
          </p>
        </div>
      </motion.div>
    </li>
  );
}
