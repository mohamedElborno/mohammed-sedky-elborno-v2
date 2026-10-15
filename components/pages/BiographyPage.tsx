"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Link } from "@/i18n/navigation";
import { api } from "@/convex/_generated/api";
import type { Timeline } from "@/content/types";
import { toLocale } from "@/i18n/routing";
import { RichText } from "../BlockStyle";
import { EmptyContent } from "../EmptyContent";
import { formatLocalizedDate, formatYearOnly } from "../FormatLocalizedDate";
import { BiographyTimeline } from "./BiographyTimeline";

export const BiographyPage = ({
  locale,
  preloaded,
}: {
  locale: string;
  preloaded: Preloaded<typeof api.content.getBiography>;
}) => {
  const biography = usePreloadedQuery(preloaded);
  const t = useTranslations("biography");
  const tNav = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const isRtl = locale === "ar";

  if (!biography) return <EmptyContent />;

  const { card, timeline } = biography;
  const lifespan = [card.birthDate, card.deathDate]
    .map((date) => formatLocalizedDate(date, toLocale(locale)))
    .filter(Boolean)
    .join(" - ");

  const facts = [
    { label: t("facts.lifespan"), value: lifespan },
    { label: t("facts.birthPlace"), value: card.birthPlace },
    { label: t("facts.institution"), value: card.majorEducationalInstitution },
  ].filter((fact) => fact.value);

  const entries = timeline.map((item: Timeline) => ({
    year: item.date ? formatYearOnly(item.date) : tCommon("dateUnavailable"),
    title: item.title,
    image: item.image || undefined,
  }));

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, delay, ease: [0.32, 0.72, 0, 1] as const },
  });

  // overflow-x-clip (not hidden) clips the decorative branches without turning
  // this wrapper into a scroll container.
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <Image
        src="/olive2.svg"
        alt=""
        width={400}
        height={400}
        className="pointer-events-none absolute -right-8 top-20 z-0 hidden h-auto -rotate-[9deg] -scale-x-[1] opacity-20 md:block dark:invert"
      />
      <Image
        src="/olive10.svg"
        alt=""
        width={600}
        height={600}
        loading="eager"
        className="pointer-events-none absolute -left-8 bottom-56 z-0 hidden h-auto w-[600px] max-w-none -rotate-[9deg] -scale-x-[1] opacity-20 lg:block dark:invert"
      />
      {/* The small branch for phones. */}
      <Image
        src="/olive2.svg"
        alt=""
        width={200}
        height={200}
        loading="eager"
        className={`pointer-events-none absolute top-10 z-0 h-auto w-[200px] max-w-none opacity-30 md:hidden dark:invert ${
          isRtl
            ? "-right-16 rotate-[220deg] scale-y-[-1]"
            : "-left-16 -rotate-45"
        }`}
      />

      <div className="relative z-10 container px-6 py-10 md:px-8 md:py-14">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {tNav("backToHome")}
        </Link>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
          {/* The card, then (on large screens) the timeline beneath it. */}
          <aside className="order-1 space-y-12 lg:order-2">
            <motion.div
              {...reveal()}
              className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border bg-card shadow-sm lg:max-w-none"
            >
              <div className="relative aspect-[5/4] bg-muted">
                <Image
                  src={card.image || "/placeholder.svg"}
                  alt={t("portraitAlt")}
                  fill
                  sizes="(min-width: 1024px) 22rem, 24rem"
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="space-y-4 p-5">
                {card.name && (
                  <h2 className="text-xl font-bold leading-snug">
                    {card.name}
                  </h2>
                )}

                {facts.length > 0 && (
                  <dl className="divide-y border-y">
                    {facts.map((fact) => (
                      <div key={fact.label} className="py-2.5">
                        <dt className="text-xs text-muted-foreground">
                          {fact.label}
                        </dt>
                        <dd className="text-[15px] font-medium leading-snug">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {card.publishedWorks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("facts.works")}
                    </p>
                    <ul className="space-y-2">
                      {card.publishedWorks.map(
                        (book: { title: string }, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-[15px] leading-relaxed"
                          >
                            <BookOpen className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                            {book.title}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {entries.length > 0 && (
              <BiographyTimeline
                title={t("timeline")}
                entries={entries}
                className="hidden lg:block"
              />
            )}
          </aside>

          <article className="order-2 min-w-0 lg:order-1">
            <motion.header {...reveal()} className="mb-10 space-y-3 md:mb-14">
              <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
            </motion.header>

            <motion.div {...reveal(0.05)} className="max-w-3xl">
              <RichText value={biography.description} />
            </motion.div>
          </article>

          {/* On phones the timeline closes the page instead. */}
          {entries.length > 0 && (
            <BiographyTimeline
              title={t("timeline")}
              entries={entries}
              className="order-3 lg:hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
};
