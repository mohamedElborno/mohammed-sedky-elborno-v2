import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const BurgerMenu = ({
  isOpen,
  toggleMenu,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
}) => {
  const t = useTranslations("common");
  const line =
    "absolute left-1/2 top-1/2 h-[1.5px] w-[18px] -translate-x-1/2 rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]";

  return (
    <button
      type="button"
      onClick={toggleMenu}
      aria-label={isOpen ? t("closeMenu") : t("openMenu")}
      aria-expanded={isOpen}
      className="relative size-9 rounded-full transition-colors hover:bg-foreground/5 lg:hidden"
    >
      <span
        className={cn(
          line,
          isOpen ? "-translate-y-1/2 rotate-45" : "-translate-y-[4px]",
        )}
      />
      <span
        className={cn(
          line,
          isOpen ? "-translate-y-1/2 -rotate-45" : "translate-y-[3px]",
        )}
      />
    </button>
  );
};
