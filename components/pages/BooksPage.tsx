"use client";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Book } from "@/content/types";

export const BooksPage = ({
  locale,
  preloaded,
}: {
  locale: string;
  preloaded: Preloaded<typeof api.content.getBooks>;
}) => {
  const booksDetails = usePreloadedQuery(preloaded);
  const t = useTranslations("books");
  const tNav = useTranslations("navigation");
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
        <Separator />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {booksDetails?.map((book: Book, index: number) => (
            <div key={index}>
              <Card className="overflow-hidden h-full flex flex-col dark:hover:bg-zinc-800 duration-300 hover:bg-zinc-100">
                <Image
                  src={
                    book?.coverImage || "/placeholder.svg?height=400&width=300"
                  }
                  height={400}
                  width={300}
                  alt={`غلاف كتاب ${book?.title}`}
                  className="w-full h-[400px] p-4 py-0 rounded-2xl"
                />

                <CardHeader className="p-4 py-0">
                  <h2 className="text-lg font-semibold leading-relaxed line-clamp-3">
                    {book?.title}
                  </h2>
                </CardHeader>

                <CardDescription className="p-4 py-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {book?.description || ""}
                  </p>
                </CardDescription>

                <div className="mt-auto">
                  <CardFooter className="flex justify-between p-4 py-0">
                    {book?.url ? (
                      <Link
                        href={book?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          aria-label={`تحميل كتاب ${book?.title}`}
                          className="rounded-lg cursor-pointer"
                        >
                          {t("bookRead")}
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-sm dark:text-red-900 text-red-800">
                        {t("bookNotFoundPDF")}
                      </span>
                    )}
                  </CardFooter>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
