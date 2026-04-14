import { NextRequest, NextResponse } from "next/server";
import {
  getCurrencyForCountry,
  getCurrencyForLocale,
  getDisplayLocaleForCurrency,
} from "@/lib/currency";

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

  // ── Locale + currency detection (all routes) ───────────────────
  // Priority: IP country (x-vercel-ip-country) > Accept-Language > USD
  //
  // x-vercel-ip-country is injected free by Vercel's edge for every request.
  // This ensures an Indonesian user whose browser is set to English still sees
  // IDR rather than USD.
  const ipCountry = req.headers.get("x-vercel-ip-country") ?? "";
  const acceptLanguage = req.headers.get("accept-language") ?? "";

  let currency: string;
  let locale: string;

  if (ipCountry) {
    currency = getCurrencyForCountry(ipCountry);
    locale = getDisplayLocaleForCurrency(currency);
  } else {
    // Fallback: derive from the first language tag in Accept-Language
    const primaryLocale = acceptLanguage.split(",")[0]?.trim().split(";")[0] ?? "en-US";
    currency = getCurrencyForLocale(primaryLocale);
    locale = getDisplayLocaleForCurrency(currency);
  }

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
  res.headers.set("x-currency", currency);
  return res;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon|icons).*)",
  ],
};
