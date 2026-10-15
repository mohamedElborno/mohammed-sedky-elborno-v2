import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSignInRoute = createRouteMatcher(["/admin/sign-in(.*)"]);

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// The public site is locale-prefixed; /admin is a single-language, Clerk-gated
// area that must never receive a locale prefix.
export default clerkConfigured
  ? clerkMiddleware(async (auth, request) => {
      if (isAdminRoute(request)) {
        if (!isSignInRoute(request)) {
          await auth.protect({
            unauthenticatedUrl: new URL("/admin/sign-in", request.url).href,
          });
        }
        return NextResponse.next();
      }
      return intlMiddleware(request);
    })
  : (request: NextRequest) =>
      isAdminRoute(request) ? NextResponse.next() : intlMiddleware(request);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
