"use client";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t mt-auto ">
      <div className="border-t py-6 md:py-8">
        <div className="container px-6 md:px-8 flex flex-col items-center md:flex-row">
          <p
            className={`text-center text-sm text-muted-foreground md:text-left`}
          >
            &copy; {new Date().getFullYear()}
            {" | " + t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
