"use client";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import YouTubeModal from "./YouTubeModal";
import { PhotoGallery } from "./PhotoGallery";
import { FeaturedWorks } from "./FeaturedWorks";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RichText } from "@/components/BlockStyle";

export const HomePage = ({
  locale,
  preloaded,
  gallery,
}: {
  locale: string;
  preloaded: Preloaded<typeof api.content.getHomePage>;
  gallery: Preloaded<typeof api.content.getGallery>;
}) => {
  const homePage = usePreloadedQuery(preloaded);
  const photos = usePreloadedQuery(gallery);
  const isRtl = locale === "ar";
  const t = useTranslations("home");

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Image
        src="/olive1.svg"
        alt=""
        width={400}
        height={400}
        className={`h-auto overflow-hidden dark:invert z-0 absolute opacity-10 md:opacity-20 top-20  ${
          isRtl ? "-left-1 scale-x-[-1]" : "-right-1 scale-x-[1]"
        }`}
        priority
        loading="eager"
      />
      <main className="flex-1">
        <section className="pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="container px-6 md:px-8">
            <div
              className={`grid items-center gap-12 lg:gap-16 ${
                homePage?.video ? "lg:grid-cols-2" : ""
              }`}
            >
              <div className="relative z-10 flex flex-col items-start gap-6">
                <h1 className="text-balance text-4xl font-bold leading-[1.25] sm:text-5xl xl:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t("hero.description")}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-xl bg-foreground/10 px-5 text-sm font-medium text-foreground backdrop-blur-xl hover:bg-foreground/15 dark:hover:bg-foreground/15"
                  >
                    <LocaleLink href="/biography">
                      {t("hero.primaryButton")}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </LocaleLink>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-xl px-4 text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground dark:hover:bg-foreground/5"
                  >
                    <LocaleLink href="/books">
                      {t("hero.secondaryButton")}
                    </LocaleLink>
                  </Button>
                </div>
              </div>
              {homePage?.video && (
                <div className="mx-auto w-full max-w-xl lg:max-w-none">
                  <YouTubeModal
                    videoUrl={homePage.video}
                    thumbnailUrl={homePage.image}
                  />
                </div>
              )}
            </div>

          </div>
        </section>
        <PhotoGallery photos={photos} />
        <FeaturedWorks items={homePage?.worksCategory ?? []} />
        <section className="w-full py-12 md:py-24 lg:py-32 dark:bg-muted/40 bg-muted/90">
          <div className="container px-5 md:px-8">
            <div className="grid gap-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className={`text-3xl font-bold md:text-4xl/tight`}>
                  {t("about.title")}
                </h2>
                <p className={`text-muted-foreground md:text-xl`}>
                  {t("about.description")}
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={`/${locale}/biography`}>
                    <Button variant="outline" className="cursor-pointer">
                      {t("about.button")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <blockquote className={`text-xl italic border-s-4 ps-4 py-3`}>
                  <RichText value={t("about.quote.text")} />
                </blockquote>
                <div className="flex items-center gap-4">
                  <div>
                    <div className={`font-semibold`}>
                      {t("about.quote.author")}
                    </div>
                    <div className={`text-sm text-muted-foreground`}>
                      {t("about.quote.source")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-5 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className={`text-3xl font-bold sm:text-4xl md:text-5xl`}>
                  {t("contribute.title")}
                </h2>
                <p
                  className={`max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed`}
                >
                  {t("contribute.description")}
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Link
                  href={`mailto:elborno.family@gmail.com?subject=${encodeURIComponent(t("contribute.emailSubject"))}&body=${encodeURIComponent(t("contribute.emailBody"))}`}
                >
                  <Button className="w-full cursor-pointer">
                    {t("contribute.button")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
