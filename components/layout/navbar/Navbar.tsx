"use client";
import { useEffect, useRef, useState } from "react";
import { NavbarMobile } from "./NavbarMobile";
import { NavbarDesktop } from "./NavbarDesktop";
import { useTranslations } from "next-intl";
import { NavparDataType } from "@/content/types";
import { usePathname } from "next/navigation";

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
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
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
    <div
      ref={navRef}
      className={`fixed top-0 left-0 right-0 flex items-center z-50 w-full transition-all mx-auto ${scrolled ? "shadow-md max-w-[90%] mx-auto mt-5 rounded-3xl duration-300 min-h-16 bg-popover/30 backdrop-blur-lg bg-opacity-20 py-3 border-none" : "bg-opacity-0 backdrop-blur-lg min-h-20 border-b py-5"}`}
    >
      <div className="flex flex-col justify-center items-center w-full">
        <NavbarDesktop
          navbarData={navbarData}
          isOpen={isOpen}
          toggleMenu={toggleMenu}
        />
        <NavbarMobile boolean={isOpen} navbarData={navbarData} />
      </div>
    </div>
  );
}
