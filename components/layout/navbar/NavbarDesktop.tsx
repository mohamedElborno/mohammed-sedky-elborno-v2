import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BurgerMenu } from "./BurgerMenu";
import { ModeToggle } from "@/components/toggleButtons/ModeToggle";
import LanguageChanger from "@/components/toggleButtons/LanguageChanger";
import { NavparDataType } from "@/content/types";

export const NavbarDesktop = ({
  isOpen,
  scrolled,
  toggleMenu,
  navbarData,
}: {
  isOpen: boolean;
  scrolled: boolean;
  toggleMenu: () => void;
  navbarData: NavparDataType[];
}) => {
  const t = useTranslations("common");
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1400px] items-center justify-between transition-[height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        scrolled ? "h-16 lg:h-14" : "h-[4.25rem] lg:h-16",
      )}
    >
      <Link href="/" className="mx-6 md:mx-8">
        <Image
          src="/logo.svg"
          alt={t("logoAlt")}
          width={100}
          height={100}
          className={cn(
            "w-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:invert",
            scrolled ? "h-7" : "h-9",
          )}
        />
      </Link>
      <div className="hidden lg:flex">
        <ul className="flex items-center gap-1">
          {navbarData.map((item: { link: string; title: string }) => {
            const active =
              item.link === "/"
                ? pathname === "/"
                : pathname.startsWith(item.link);
            return (
              <li key={item.link}>
                <Link
                  href={item.link}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                    active
                      ? "text-foreground"
                      : "text-foreground/50 hover:text-foreground/90",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mx-4 flex items-center gap-1 sm:mx-6 sm:gap-2">
        <div className="flex items-center gap-1">
          <LanguageChanger />
          <ModeToggle />
        </div>
        <BurgerMenu isOpen={isOpen} toggleMenu={toggleMenu} />
      </div>
    </div>
  );
};
