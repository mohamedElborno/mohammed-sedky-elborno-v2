import type { Metadata } from "next";
import { thmanyah } from "@/app/fonts/thmanyah";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import "../globals.css";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable} suppressHydrationWarning>
      <body>
        {clerkConfigured ? (
          <ClerkProvider
            signInUrl="/admin/sign-in"
            signInFallbackRedirectUrl="/admin"
            afterSignOutUrl="/admin/sign-in"
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        ) : (
          <MissingClerkSetup />
        )}
      </body>
    </html>
  );
}

function MissingClerkSetup() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">لوحة التحكم غير مهيّأة</h1>
      <p className="text-muted-foreground">
        لتشغيل لوحة التحكم أضف مفاتيح Clerk إلى ملف <code>.env.local</code> ثم
        أعد تشغيل الخادم:
      </p>
      <pre className="overflow-x-auto rounded-md border p-4 text-left text-sm" dir="ltr">
        {`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://<your-app>.clerk.accounts.dev`}
      </pre>
      <p className="text-muted-foreground text-sm">
        وعلى نشر Convex اضبط <code>CLERK_JWT_ISSUER_DOMAIN</code> و{" "}
        <code>ADMIN_EMAILS</code> (قائمة البُرد المسموح لها بالإدارة مفصولة
        بفواصل).
      </p>
    </div>
  );
}
