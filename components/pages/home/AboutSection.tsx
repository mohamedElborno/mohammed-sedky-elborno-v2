"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AboutBlock } from "@/content/types";
import { cn } from "@/lib/utils";
import { OliveBranch } from "@/components/OliveBranch";

// Everything here comes from the admin panel except the section title and the
// button, which are fixed text in the translation files. A missing description
// falls back to the default text; a missing quote or portrait is simply not
// shown.
export function AboutSection({ about }: { about: AboutBlock | null }) {
  const t = useTranslations("home");
  const tPerson = useTranslations("metadata.person");
  const reduceMotion = useReducedMotion();

  const description = about?.description || t("about.description");
  const image = about?.image || "";
  const quote = about?.quote.text.trim() ? about.quote : null;

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, delay, ease: [0.32, 0.72, 0, 1] as const },
  });

  return (
    <section className="section-alt relative w-full overflow-x-clip py-16 md:py-24 lg:py-32">
      <OliveBranch
        branch={1}
        className="end-0 bottom-0 hidden w-[420px] opacity-15 md:block lg:w-[520px] rtl:-scale-x-100"
      />
      <div className="relative z-10 container px-6 md:px-8">
        <div
          className={cn(
            "grid items-center gap-12 lg:gap-20",
            image && "lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]",
          )}
        >
          {image && (
            <motion.div
              {...reveal()}
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-muted lg:mx-0 lg:max-w-none"
            >
              <Image
                src={image}
                alt={tPerson("name")}
                fill
                sizes="(min-width: 1024px) 26rem, 24rem"
                className="object-cover object-top"
              />
            </motion.div>
          )}

          <div className="space-y-12">
            <motion.div {...reveal(0.05)} className="space-y-6">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                {t("about.title")}
              </h2>
              <p className="max-w-2xl text-pretty text-lg leading-loose text-muted-foreground md:text-xl md:leading-loose">
                {description}
              </p>
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-xl bg-foreground/10 px-5 text-sm font-medium text-foreground backdrop-blur-xl hover:bg-foreground/15 dark:hover:bg-foreground/15"
              >
                <Link href="/biography">
                  {t("about.button")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </motion.div>

            {quote && (
              <motion.figure
                {...reveal(0.1)}
                className="space-y-5 border-t pt-10"
              >
                <Quote
                  aria-hidden="true"
                  className="size-8 text-foreground/25 rtl:-scale-x-100"
                />
                <blockquote className="whitespace-pre-line text-balance text-2xl font-medium leading-relaxed md:text-3xl md:leading-relaxed">
                  {quote.text}
                </blockquote>
                <figcaption className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {quote.author || tPerson("name")}
                  </span>
                  {quote.source && <span> — {quote.source}</span>}
                </figcaption>
              </motion.figure>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
