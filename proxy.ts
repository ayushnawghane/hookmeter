import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, safeEqual, sessionValue } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await sessionValue())) return NextResponse.next();
  const login = new URL("/login", request.url);
  if (request.nextUrl.pathname !== "/") login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  // Everything except the login page, the cron route, Next's assets and the PWA files.
  matcher: ["/((?!login|api/cron|_next/static|_next/image|manifest.webmanifest|sw.js|icons/|favicon.ico).*)"],
};
