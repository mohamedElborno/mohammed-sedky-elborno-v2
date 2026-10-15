"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "../ui/card";
import { LessonType } from "@/content/types";
import { EmptyContent } from "../EmptyContent";

export const LessonsPage = ({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.content.getLessons>;
}) => {
  const lessonsPage = usePreloadedQuery(preloaded);
  const t = useTranslations("media");
  const tNav = useTranslations("navigation");
  const locale = useLocale();

  if (!lessonsPage) return <EmptyContent />;

  return (
    <div className="container py-12 px-6 md:px-8">
      <LocaleLink
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary mb-8"
      >
        <ArrowLeft className={`h-4 w-4 ${locale === "ar" && "rotate-180"}`} />
        {tNav("backToHome")}
      </LocaleLink>

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold sm:text-5xl">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href={`${lessonsPage?.url}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={lessonsPage?.image || "/placeholder.svg?height=400&width=300"}
            alt={t("title")}
            width={6000}
            height={6000}
            className="h-auto w-full hover:drop-shadow transition-all duration-300 rounded-3xl"
          />
        </Link>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6 md:pt-8">
          {lessonsPage?.lessons?.map((lesson: LessonType, index: number) => (
            <Link
              href={`${lesson?.url}`}
              key={index}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="overflow-hidden h-full flex flex-col dark:hover:bg-zinc-800 duration-300 hover:bg-zinc-100">
                <Image
                  src={lesson?.image || "/placeholder.svg?height=400&width=300"}
                  height={500}
                  width={500}
                  alt={lesson?.title}
                  className="w-full object-cover h-44 rounded-xl p-2 -translate-y-5"
                />

                <div className="p-4 py-0 -translate-y-5">
                  <h2 className="text-lg font-semibold">{lesson?.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {lesson?.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
