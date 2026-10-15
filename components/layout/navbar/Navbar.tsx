"use client";
import { useEffect, useRef, useState } from "react";
import { NavbarMobile } from "./NavbarMobile";
import { NavbarDesktop } from "./NavbarDesktop";
import { useTranslations } from "next-intl";
import { NavparDataType } from "@/content/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("navigation");
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // The menu is tied to the route it was opened on, so navigating closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;
  const setIsOpen = (open: boolean) => setOpenedOn(open ? pathname : null);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenedOn(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarData: NavparDataType[] = [
    {
      link: "/",
      title: t("home"),
    },
    {
      link: "/biography",
      title: t("biography"),
    },
    {
      link: "/books",
      title: t("books"),
    },
    {
      link: "/media",
      title: t("media"),
    },
  ];

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <div
        ref={navRef}
        data-scrolled={scrolled}
        className={cn(
          "pointer-events-auto flex flex-col items-center border-border/50 bg-background/70 backdrop-blur-xl backdrop-saturate-150",
          "transition-[width,margin,border-radius,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          scrolled
            ? "mt-3 w-[min(62rem,calc(100%-1.5rem))] rounded-[1.75rem] border shadow-lg shadow-black/5"
            : "mt-0 w-full rounded-none border-b",
        )}
      >
        <NavbarDesktop
          navbarData={navbarData}
          isOpen={isOpen}
          scrolled={scrolled}
          toggleMenu={toggleMenu}
        />
        <NavbarMobile boolean={isOpen} navbarData={navbarData} />
      </div>
    </header>
  );
}
