"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Play, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { OliveBranch } from "@/components/OliveBranch";
import { LessonType } from "@/content/types";
import { YouTubeThumb } from "@/components/YouTubeThumb";
import { EmptyContent } from "../EmptyContent";

/** Searching ignores Arabic diacritics, tatweel and letter-form differences. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

/** Below this many videos a search box would only be in the way. */
const SEARCH_FROM = 8;

export const LessonsPage = ({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.content.getLessons>;
}) => <LessonsView lessonsPage={usePreloadedQuery(preloaded)} />;

export type LessonsPageData = {
  image: string;
  url: string;
  lessons: LessonType[];
} | null;

export const LessonsView = ({
  lessonsPage,
}: {
  lessonsPage: LessonsPageData;
}) => {
  const t = useTranslations("media");
  const tNav = useTranslations("navigation");
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const lessons: LessonType[] = useMemo(
    () => lessonsPage?.lessons ?? [],
    [lessonsPage],
  );

  const visible = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return lessons;
    return lessons.filter((lesson) =>
      normalize(`${lesson.title} ${lesson.description}`).includes(needle),
    );
  }, [lessons, query]);

  if (!lessonsPage) return <EmptyContent />;

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <OliveBranch
        branch={5}
        eager
        className="end-0 top-0 hidden w-[420px] opacity-15 md:block lg:w-[520px] rtl:-scale-x-100"
      />
      <div className="relative z-10 container px-6 py-10 md:px-8 md:py-14">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {tNav("backToHome")}
        </Link>

        <header className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-6 md:mb-14">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {lessons.length > 0 && (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <p className="text-sm font-medium text-muted-foreground">
                {t("count", { count: lessons.length })}
              </p>
              {lessons.length >= SEARCH_FROM && (
                <label className="relative block w-full sm:w-72">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("search")}
                    aria-label={t("search")}
                    className="h-11 w-full rounded-xl border bg-card ps-10 pe-4 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30"
                  />
                </label>
              )}
            </div>
          )}
        </header>

        {lessonsPage.image && (
          <ChannelBanner
            image={lessonsPage.image}
            url={lessonsPage.url}
            title={t("title")}
            label={t("visitChannel")}
          />
        )}

        {lessons.length > 0 &&
          (visible.length === 0 ? (
            <p className="py-16 text-center text-lg text-muted-foreground">
              {t("noResults")}
            </p>
          ) : (
            <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((lesson, index) => {
                const card = (
                  <>
                    <span className="relative isolate block w-full">
                      <Glow />
                      <span className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-md ring-1 ring-black/5 dark:ring-white/10">
                      {lesson.image ? (
                        <Image
                          src={lesson.image}
                          alt={t("thumbAlt", { title: lesson.title })}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                          className="object-cover"
                        />
                      ) : (
                        // No picture was added: use the video's own thumbnail.
                        <YouTubeThumb
                          url={lesson.url ?? ""}
                          alt={t("thumbAlt", { title: lesson.title })}
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                          className="object-cover"
                        />
                      )}
                      {lesson.url && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span className="flex size-14 items-center justify-center rounded-full bg-white/85 text-black shadow-lg backdrop-blur">
                            <Play className="size-6 translate-x-px fill-current" />
                          </span>
                        </span>
                      )}
                      </span>
                    </span>

                    <span className="mt-4 block space-y-1.5">
                      <span className="line-clamp-2 block text-lg font-bold leading-relaxed">
                        {lesson.title}
                      </span>
                      {lesson.description && (
                        <span className="line-clamp-2 block text-pretty leading-relaxed text-muted-foreground">
                          {lesson.description}
                        </span>
                      )}
                    </span>
                  </>
                );

                return (
                  <motion.li
                    key={`${lesson.url}-${index}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: (index % 3) * 0.07,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    {lesson.url ? (
                      <a
                        href={lesson.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("watch")}: ${lesson.title}`}
                        className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                      >
                        {card}
                      </a>
                    ) : (
                      <div>{card}</div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          ))}
      </div>
    </div>
  );
};

/** A soft light under the item that fades in while it is hovered or focused. */
function Glow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[8%] -bottom-5 -z-10 h-16 rounded-full bg-foreground/35 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
    />
  );
}

function ChannelBanner({
  image,
  url,
  title,
  label,
}: {
  image: string;
  url: string;
  title: string;
  label: string;
}) {
  const inner = (
    <>
      <Glow />
      <span className="relative block overflow-hidden rounded-[2rem] bg-muted shadow-md ring-1 ring-black/5 dark:ring-white/10">
        {/* The banner keeps the proportions of the picture that was uploaded. */}
        <Image
          src={image}
          alt={title}
          width={0}
          height={0}
          priority
          sizes="(min-width: 1400px) 1300px, 94vw"
          className="h-auto w-full"
        />
        {url && (
          <span className="absolute bottom-5 end-5 inline-flex items-center gap-1.5 rounded-xl bg-black/40 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-xl">
            {label}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </span>
        )}
      </span>
    </>
  );

  const frame = "group relative isolate block w-full";

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={frame + " rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"}
    >
      {inner}
    </a>
  ) : (
    <div className={frame}>{inner}</div>
  );
}
