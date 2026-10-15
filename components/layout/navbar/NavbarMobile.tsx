import { NavparDataType } from "@/content/types";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export const NavbarMobile = ({
  boolean,
  navbarData,
}: {
  boolean: boolean;
  navbarData: NavparDataType[];
}) => {
  const pathname = usePathname();

  // The panel opens by animating its row from 0fr to 1fr, so it grows to its
  // real height instead of jumping.
  return (
    <div
      aria-hidden={!boolean}
      className={cn(
        "grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden",
        boolean ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <ul className="min-h-0 overflow-hidden px-3">
        {navbarData.map((item) => {
          const active =
            item.link === "/" ? pathname === "/" : pathname.startsWith(item.link);
          return (
            <li key={item.link} className="border-t border-border/50 first:border-t-0">
              <Link
                href={item.link}
                tabIndex={boolean ? 0 : -1}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block px-3 py-3.5 text-xl font-semibold transition-colors duration-300",
                  active
                    ? "text-foreground"
                    : "text-foreground/45 hover:text-foreground/90",
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
        <li aria-hidden="true" className="h-2" />
      </ul>
    </div>
  );
};
