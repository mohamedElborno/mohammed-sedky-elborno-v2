"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import YouTubeModal from "./YouTubeModal";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WorkCategory } from "@/content/types";
import { RichText } from "@/components/BlockStyle";

export const HomePage = ({
  locale,
  preloaded,
}: {
  locale: string;
  preloaded: Preloaded<typeof api.content.getHomePage>;
}) => {
  const homePage = usePreloadedQuery(preloaded);
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
        <section className="flex h-full items-center justify-center pb-12 md:pb-24">
          <div className="container flex flex-col w-full h-full space-y-8 px-6 md:px-8">
            <div className="flex flex-col gap-4 md:gap-10 mt-12">
              <div className={isRtl ? "" : " max-w-[1000px]"}>
                <h1
                  className={`text-3xl font-bold sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]`}
                >
                  {t("hero.title")}
                </h1>
              </div>
              <div className={isRtl ? "order-1" : ""}>
                <p
                  className={`max-w-[700px] text-muted-foreground text-lg md:text-2xl`}
                >
                  {t("hero.description")}
                </p>
                <div className="flex flex-col w-fit xs-w-full xs-flex-row mt-4 space-y-2 xs-space-y-0 -mb-2 sm:mb-0">
                  <Link
                    href={`/${locale}/biography`}
                    className="z-10 flex h-9 w-fit items-center justify-center rounded-md bg-primary px-4 py-2 text-md font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {t("hero.primaryButton")}
                    {!isRtl && <ArrowRight className="ms-2 h-4 w-4" />}
                    {isRtl && (
                      <ArrowRight className="ms-2 h-4 w-4 rotate-180" />
                    )}
                  </Link>
                  <Link
                    href={`/${locale}/books`}
                    className="z-10 flex h-9 xs-mx-4 w-full xs-w-fit items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-md font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {t("hero.secondaryButton")}
                  </Link>
                </div>
              </div>
            </div>
            {homePage?.video && (
              <YouTubeModal
                videoUrl={homePage.video}
                thumbnailUrl={homePage.image}
              />
            )}
          </div>
        </section>
        <section className="w-full py-12 md:py-24 dark:bg-muted/30 bg-muted/60 relative">
          <Image
            src="/olive2.svg"
            alt=""
            width={400}
            height={400}
            className={`h-auto overflow-hidden dark:invert z-0 absolute opacity-10 md:opacity-20 top-20  ${
              isRtl ? "-right-4 scale-x-[-1]" : "-left-4 scale-x-[1]"
            }`}
          />
          <div className="container space-y-12 px-4 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div
                className={`inline-block rounded-lg bg-muted px-3 py-1 lg:px-4 lg:py-2 text-lg lg:text-xl`}
              >
                {t("featuredWorks.subtitle")}
              </div>
              <h2 className={`text-3xl my-8 font-bold mx-auto sm:text-5xl`}>
                {t("featuredWorks.title")}
              </h2>
              <p
                className={`max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed`}
              >
                {t("featuredWorks.description")}
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl px-2 md:px-8 sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              {homePage?.worksCategory?.map(
                (item: WorkCategory, index: number) => (
                  <div className="grid gap-1 h-full" key={index}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Image
                        src={item?.icon || "/logo.svg"}
                        width={100}
                        height={100}
                        alt={`Category ${index}`}
                        className="h-8 w-8 object-cover dark:invert"
                      />
                    </div>
                    <h3 className={`text-xl font-bold px-2 mt-2`}>
                      {item?.title}
                    </h3>
                    <p className={`text-lg text-muted-foreground px-2`}>
                      {item?.description}
                    </p>
                    <Link
                      href={`/${locale}/${item?.workUrl}`}
                      className="mt-2 w-fit"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        {t("categories.viewCollection")}
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
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
                <Link href="mailto:elborno.family@gmail.com?subject=استفسار&body=السلام عليكم ورحمة الله وبركاته">
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
