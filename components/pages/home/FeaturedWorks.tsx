"use client";

import Image from "next/image";
import { OliveBranch } from "@/components/OliveBranch";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WorkCategory } from "@/content/types";

export function FeaturedWorks({ items }: { items: WorkCategory[] }) {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <section className="section-alt relative w-full overflow-hidden py-16 md:py-24">
      <OliveBranch
        branch={6}
        className="start-0 top-16 w-[300px] opacity-15 md:w-[520px] md:opacity-25 rtl:-scale-x-100"
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

        {/* Frosted cards: the branch behind the section shows through the blur. */}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item, index) => (
            <motion.li
              key={`${item.workUrl}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="h-full"
            >
              <Link
                href={`/${item.workUrl.replace(/^\/+/, "")}`}
                className="group flex h-full flex-col gap-4 rounded-3xl border border-foreground/10 bg-card/40 p-6 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center text-foreground/70 md:size-8">
                    {item.icon ? (
                      <Image
                        src={item.icon}
                        width={64}
                        height={64}
                        alt=""
                        className="size-full object-contain dark:invert"
                      />
                    ) : (
                      <ScrollText className="size-full" strokeWidth={1.5} />
                    )}
                  </span>
                  <h3 className="text-xl font-bold leading-snug md:text-2xl">
                    {item.title}
                  </h3>
                </div>
                {item.description && (
                  <p className="line-clamp-3 text-pretty leading-relaxed text-muted-foreground">
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
