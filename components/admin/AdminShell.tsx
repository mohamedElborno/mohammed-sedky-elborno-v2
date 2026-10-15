"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/home", label: "الصفحة الرئيسية" },
  { href: "/admin/biography", label: "السيرة الذاتية" },
  { href: "/admin/books", label: "الكتب" },
  { href: "/admin/lessons", label: "المقاطع والدروس" },
  { href: "/admin/gallery", label: "ألبوم الصور" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">لوحة تحكم الموقع</span>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-xs underline"
            >
              عرض الموقع
            </Link>
          </div>
          <Authenticated>
            <UserButton />
          </Authenticated>
        </div>

        <Authenticated>
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 md:px-6">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </Authenticated>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <AuthLoading>
          <p className="text-muted-foreground py-20 text-center">
            جارٍ التحقق من الدخول...
          </p>
        </AuthLoading>

        <Unauthenticated>
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="text-xl font-semibold">
              هذه الصفحة للمشرفين فقط
            </h1>
            <Button asChild>
              <Link href="/admin/sign-in">تسجيل الدخول</Link>
            </Button>
          </div>
        </Unauthenticated>

        <Authenticated>{children}</Authenticated>
      </main>
    </div>
  );
}
