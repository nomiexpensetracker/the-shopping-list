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

  // Only gate the in-session routes (not API routes, not public pages).
  // The MobileGate component provides additional client-side enforcement.
  if (!pathname.startsWith("/app/session/")) {
    return NextResponse.next();
  }

  const ua = req.headers.get("user-agent") ?? "";

  // Let API routes and Next.js internals through always.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // If UA is clearly non-mobile, redirect to mobile-only page.
  // We check specifically for desktop indicators to avoid false-positives on unknown UAs.
  const isDesktopUA = /Windows NT|Macintosh|Linux x86_64/.test(ua) && !isMobileUA(ua);

  if (isDesktopUA) {
    const url = req.nextUrl.clone();
    url.pathname = "/mobile-only";
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/session/:path*"],
};
