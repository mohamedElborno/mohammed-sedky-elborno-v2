"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WorkCategory } from "@/content/types";

export function FeaturedWorks({ items }: { items: WorkCategory[] }) {
  const t = useTranslations("home");
  const isRtl = useLocale() === "ar";
  const reduceMotion = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      <Image
        src="/olive2.svg"
        alt=""
        width={400}
        height={400}
        className={`pointer-events-none absolute top-20 z-0 h-auto opacity-10 md:opacity-20 dark:invert ${
          isRtl ? "-right-4 scale-x-[-1]" : "-left-4"
        }`}
      />
      <div className="relative z-10 container px-6 md:px-8">
        <div className="mb-10 max-w-2xl space-y-3 md:mb-14">
          <p className="text-sm font-medium text-muted-foreground">
            {t("featuredWorks.subtitle")}
          </p>
          <h2 className="text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {t("featuredWorks.title")}
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("featuredWorks.description")}
          </p>
        </div>

        {/* Laid out like a table of contents: quiet rows between hairlines. */}
        <ul className="divide-y border-y">
          {items.map((item, index) => (
            <motion.li
              key={`${item.workUrl}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <Link
                href={`/${item.workUrl.replace(/^\/+/, "")}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-3 px-1 py-7 transition-colors duration-300 hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:gap-x-8 md:px-4 md:py-9"
              >
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted md:size-16 dark:bg-white">
                  <Image
                    src={item.icon || "/logo.svg"}
                    width={128}
                    height={128}
                    alt=""
                    className="size-full object-contain p-2.5"
                  />
                </span>

                <h3 className="text-xl font-bold leading-snug md:text-3xl">
                  {item.title}
                </h3>

                <ArrowUpRight className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground md:order-last md:size-6 rtl:-scale-x-100" />

                {item.description && (
                  <p className="col-span-3 text-pretty leading-relaxed text-muted-foreground md:col-span-1 md:col-start-3 md:row-start-1">
                    {item.description}
                  </p>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
