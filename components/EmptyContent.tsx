import { useTranslations } from "next-intl";

export const EmptyContent = () => {
  const t = useTranslations("navigation");
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center md:px-8">
      <h1 className="text-2xl font-bold">{t("siteTitle")}</h1>
      <p className="text-muted-foreground">
        لا يوجد محتوى منشور بعد. أضف المحتوى من لوحة التحكم.
      </p>
    </div>
  );
};
