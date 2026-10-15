"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpen, FileX, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { OliveBranch } from "@/components/OliveBranch";
import { Button } from "@/components/ui/button";
import { Book } from "@/content/types";
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

/** Below this many books a search box would only be in the way. */
const SEARCH_FROM = 6;

export const BooksPage = ({
  preloaded,
}: {
  locale: string;
  preloaded: Preloaded<typeof api.content.getBooks>;
}) => {
  const books = usePreloadedQuery(preloaded) as Book[];
  const t = useTranslations("books");
  const tNav = useTranslations("navigation");
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return books;
    return books.filter((book) =>
      normalize(`${book.title} ${book.description}`).includes(needle),
    );
  }, [books, query]);

  if (books.length === 0) return <EmptyContent />;

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <OliveBranch
        branch={2}
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

        <header className="mb-12 flex flex-wrap items-end justify-between gap-x-8 gap-y-6 md:mb-16">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <p className="text-sm font-medium text-muted-foreground">
              {t("count", { count: books.length })}
            </p>
            {books.length >= SEARCH_FROM && (
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
        </header>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-lg text-muted-foreground">
            {t("noResults")}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((book, index) => (
              <motion.li
                key={book._id}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: (index % 4) * 0.07,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="flex flex-col"
              >
                <BookCover book={book} alt={t("coverAlt", { title: book.title })} />

                <div className="mt-4 flex flex-1 flex-col gap-2 sm:mt-5">
                  <h2 className="line-clamp-3 text-base font-bold leading-relaxed sm:text-lg">
                    {book.title}
                  </h2>
                  {book.description && (
                    <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {book.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3">
                    {book.url ? (
                      <Button
                        asChild
                        variant="ghost"
                        className="h-auto min-h-10 rounded-xl bg-foreground/10 px-4 py-2 text-center text-sm font-medium whitespace-normal text-foreground backdrop-blur-xl hover:bg-foreground/15 dark:hover:bg-foreground/15"
                      >
                        <a
                          href={book.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("downloadLabel", { title: book.title })}
                        >
                          <BookOpen className="size-4 shrink-0" />
                          {t("bookRead")}
                        </a>
                      </Button>
                    ) : (
                      <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileX className="mt-0.5 size-4 shrink-0" />
                        {t("bookNotFoundPDF")}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function BookCover({ book, alt }: { book: Book; alt: string }) {
  const frame =
    "relative block aspect-[2/3] w-full overflow-hidden rounded-2xl bg-muted shadow-md ring-1 ring-black/5 transition-shadow duration-300 dark:ring-white/10";

  const cover = book.coverImage ? (
    <Image
      src={book.coverImage}
      alt={alt}
      fill
      sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 26vw, (min-width: 640px) 44vw, 90vw"
      className="object-cover"
    />
  ) : (
    // No cover yet: a quiet typographic stand-in with the title.
    <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
      <BookOpen aria-hidden="true" className="size-9 text-foreground/25" />
      <span className="line-clamp-5 text-balance text-xl font-bold leading-relaxed text-foreground/60">
        {book.title}
      </span>
    </div>
  );

  return book.url ? (
    <a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      className={`${frame} hover:shadow-xl`}
    >
      {cover}
    </a>
  ) : (
    <div className={frame}>{cover}</div>
  );
}
