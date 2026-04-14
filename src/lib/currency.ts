/**
 * Locale-aware currency utilities.
 *
 * Detection priority (highest to lowest):
 *  1. x-vercel-ip-country header (IP geolocation — free on Vercel edge)
 *  2. Accept-Language header (browser/device preference)
 *  3. USD fallback
 *
 * Prices are stored as plain NUMERIC(10,2) in the DB; formatting is display-only.
 */

/** ISO 3166-1 alpha-2 country code → ISO 4217 currency code */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Southeast Asia
  ID: "IDR", // Indonesia
  MY: "MYR", // Malaysia
  SG: "SGD", // Singapore
  TH: "THB", // Thailand
  PH: "PHP", // Philippines
  VN: "VND", // Vietnam
  MM: "MMK", // Myanmar
  KH: "KHR", // Cambodia
  LA: "LAK", // Laos
  BN: "BND", // Brunei
  // East Asia
  JP: "JPY", // Japan
  KR: "KRW", // South Korea
  CN: "CNY", // China
  HK: "HKD", // Hong Kong
  TW: "TWD", // Taiwan
  // South Asia
  IN: "INR", // India
  PK: "PKR", // Pakistan
  BD: "BDT", // Bangladesh
  LK: "LKR", // Sri Lanka
  // Middle East
  AE: "AED", // UAE
  SA: "SAR", // Saudi Arabia
  // Europe
  GB: "GBP", // United Kingdom
  DE: "EUR", // Germany
  FR: "EUR", // France
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  NL: "EUR", // Netherlands
  // Americas
  US: "USD", // United States
  CA: "CAD", // Canada
  BR: "BRL", // Brazil
  MX: "MXN", // Mexico
  // Oceania
  AU: "AUD", // Australia
  NZ: "NZD", // New Zealand
};

/** BCP 47 primary language subtag → ISO 4217 currency code (used as Accept-Language fallback) */
export const LOCALE_CURRENCY_MAP: Record<string, string> = {
  id: "IDR", // Indonesian
  ms: "MYR", // Malay
  th: "THB", // Thai
  vi: "VND", // Vietnamese
  ja: "JPY", // Japanese
  ko: "KRW", // Korean
  zh: "CNY", // Chinese
  hi: "INR", // Hindi
  ar: "AED", // Arabic
  pt: "BRL", // Portuguese (default to BRL)
  fr: "EUR", // French (default to EUR)
  de: "EUR", // German
  es: "EUR", // Spanish (EU default; MXN also valid)
  en: "USD", // English (default to USD)
};

/** Returns the ISO 4217 currency code for a given country code. Falls back to USD. */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? "USD";
}

/**
 * Returns the ISO 4217 currency code for a given BCP 47 locale string.
 * Matches by primary language subtag. Falls back to USD.
 */
export function getCurrencyForLocale(locale: string): string {
  const primaryTag = locale.split(/[-_]/)[0].toLowerCase();
  return LOCALE_CURRENCY_MAP[primaryTag] ?? "USD";
}

/**
 * Derives the best BCP 47 display locale for a given currency.
 * Used to format numbers in a style natural to that currency's home region.
 */
const CURRENCY_DISPLAY_LOCALE: Record<string, string> = {
  IDR: "id-ID",
  MYR: "ms-MY",
  SGD: "en-SG",
  THB: "th-TH",
  PHP: "fil-PH",
  VND: "vi-VN",
  JPY: "ja-JP",
  KRW: "ko-KR",
  CNY: "zh-CN",
  HKD: "zh-HK",
  TWD: "zh-TW",
  INR: "en-IN",
  AED: "ar-AE",
  GBP: "en-GB",
  EUR: "de-DE",
  USD: "en-US",
  CAD: "en-CA",
  AUD: "en-AU",
  BRL: "pt-BR",
};

/** Returns the display locale for a currency, defaulting to en-US. */
export function getDisplayLocaleForCurrency(currency: string): string {
  return CURRENCY_DISPLAY_LOCALE[currency] ?? "en-US";
}

/**
 * Extracts the narrow currency symbol (e.g. "£", "¥", "Rp") for a given
 * locale and currency using Intl.NumberFormat.formatToParts.
 */
export function getCurrencySymbol(locale: string, currency: string): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

/**
 * Formats a numeric amount as a localized currency string.
 * Uses narrowSymbol display and omits trailing zeros for whole-number currencies (e.g. JPY, IDR).
 */
export function formatAmount(amount: number, locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return String(amount);
  }
}
