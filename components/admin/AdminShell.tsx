"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  ExternalLink,
  Home,
  Images,
  Info,
  LayoutDashboard,
  PlayCircle,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavLink = { href: string; label: string; icon: LucideIcon };

const links: NavLink[] = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/home", label: "الصفحة الرئيسية", icon: Home },
  { href: "/admin/about", label: "عن الشيخ والاقتباس", icon: Info },
  { href: "/admin/gallery", label: "ألبوم الصور", icon: Images },
  { href: "/admin/biography", label: "السيرة الذاتية", icon: UserRound },
  { href: "/admin/books", label: "الكتب", icon: BookOpen },
  { href: "/admin/lessons", label: "المقاطع والدروس", icon: PlayCircle },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-e bg-card lg:flex">
        <div className="border-b px-5 py-5">
          <p className="text-lg font-bold">لوحة التحكم</p>
          <p className="text-sm text-muted-foreground">تراث الشيخ</p>
        </div>

        <Authenticated>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive(pathname, href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </Authenticated>

        <div className="flex items-center justify-between gap-3 border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            عرض الموقع
          </Link>
          <Authenticated>
            <UserButton />
          </Authenticated>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b bg-card lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="font-bold">لوحة التحكم</p>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                عرض الموقع
              </Link>
              <Authenticated>
                <UserButton />
              </Authenticated>
            </div>
          </div>
          <Authenticated>
            <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive(pathname, href)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-foreground/80 hover:bg-accent",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </Authenticated>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
          <AuthLoading>
            <p className="py-20 text-center text-muted-foreground">
              جارٍ التحقق من الدخول...
            </p>
          </AuthLoading>

          <Unauthenticated>
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <h1 className="text-xl font-bold">هذه الصفحة للمشرفين فقط</h1>
              <Button asChild>
                <Link href="/admin/sign-in">تسجيل الدخول</Link>
              </Button>
            </div>
          </Unauthenticated>

          <Authenticated>{children}</Authenticated>
        </main>
      </div>
    </div>
  );
}
