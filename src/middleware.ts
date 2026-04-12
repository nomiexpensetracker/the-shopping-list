import { NextRequest, NextResponse } from "next/server";

// Mobile UA patterns — covers iOS Safari-class and Android Chromium-class browsers.
const MOBILE_UA_PATTERNS = [
  /iPhone/i,
  /Android.*Mobile/i,
  /iPod/i,
  /BlackBerry/i,
  /IEMobile/i,
  /Opera Mini/i,
];

function isMobileUA(ua: string): boolean {
  return MOBILE_UA_PATTERNS.some((p) => p.test(ua));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";

  // ── Locale detection (all routes) ──────────────────────────────
  // Detect preferred locale from Accept-Language and forward it as a
  // response header so server components and API handlers can read it.
  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const locale = acceptLanguage.includes("id") ? "id-ID" : "en-US";

  // ── Mobile gate (session routes only) ──────────────────────────
  // Only gate the in-session app routes. API routes, public pages,
  // and starter-pack pages are explicitly excluded.
  // The MobileGate component provides additional client-side enforcement.
  if (pathname.startsWith("/app/session/")) {
    const isDesktopUA =
      /Windows NT|Macintosh|Linux x86_64/.test(ua) && !isMobileUA(ua);

    if (isDesktopUA) {
      const url = req.nextUrl.clone();
      url.pathname = "/mobile-only";
      return NextResponse.redirect(url, { status: 302 });
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon|icons).*)",
  ],
};
