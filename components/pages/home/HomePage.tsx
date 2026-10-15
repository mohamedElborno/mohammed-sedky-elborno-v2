"use client";
import { Link as LocaleLink } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import YouTubeModal from "./YouTubeModal";
import { PhotoGallery } from "./PhotoGallery";
import { FeaturedWorks } from "./FeaturedWorks";
import { AboutSection } from "./AboutSection";
import { ContributeSection } from "./ContributeSection";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
        <AboutSection about={homePage?.about ?? null} />
        <ContributeSection />
      </main>
    </div>
  );
};
