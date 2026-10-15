"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Languages, Mail, MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OliveBranch } from "@/components/OliveBranch";

const CONTACT_EMAIL = "elborno.family@gmail.com";

const WAYS = [
  { key: "materials", icon: ImagePlus },
  { key: "translations", icon: Languages },
  { key: "memories", icon: MessageSquareQuote },
] as const;

export function ContributeSection() {
  const t = useTranslations("home.contribute");
  const reduceMotion = useReducedMotion();

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    t("emailSubject"),
  )}&body=${encodeURIComponent(t("emailBody"))}`;

  return (
    <section className="relative w-full overflow-x-clip py-16 md:py-24 lg:py-32">
      <OliveBranch
        branch={3}
        className="start-0 top-0 w-[300px] opacity-15 md:w-[480px] md:opacity-25 rtl:-scale-x-100"
      />
      <div className="relative z-10 container px-6 md:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="grid gap-12 rounded-[2rem] border border-foreground/10 bg-card/40 shadow-sm backdrop-blur-2xl backdrop-saturate-150 p-8 md:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:p-16"
        >
          <div className="flex flex-col items-start gap-6">
            <h2 className="text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-xl text-pretty text-lg leading-loose text-muted-foreground">
              {t("description")}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
              <Button
                asChild
                variant="ghost"
                className="h-11 rounded-xl bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/85 hover:text-background dark:hover:bg-foreground/85"
              >
                <a href={mailto}>
                  <Mail className="size-4" />
                  {t("button")}
                </a>
              </Button>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                dir="ltr"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <ul className="divide-y self-center">
            {WAYS.map(({ key, icon: Icon }) => (
              <li key={key} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-foreground/10">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold">{t(`ways.${key}.title`)}</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {t(`ways.${key}.text`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
