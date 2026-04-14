"use client";

import { createContext, useContext, useMemo } from "react";

import {
  getCurrencySymbol,
  formatAmount as formatAmountUtil,
  getDisplayLocaleForCurrency,
} from "@/lib/currency";

interface CurrencyContextValue {
  locale: string;
  currency: string;
  currencySymbol: string;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  locale: "en-US",
  currency: "USD",
  currencySymbol: "$",
  formatAmount: (amount) => `$${amount}`,
});

interface Props {
  initialLocale: string;
  initialCurrency: string;
  children: React.ReactNode;
}

export function CurrencyProvider({ initialLocale, initialCurrency, children }: Props) {
  const value = useMemo<CurrencyContextValue>(() => {
    const locale = initialLocale || "en-US";
    const currency = initialCurrency || "USD";
    // Derive display locale from currency to ensure number formatting is
    // appropriate for that currency (e.g. Rp 50.000 for IDR, not Rp 50,000)
    const displayLocale = getDisplayLocaleForCurrency(currency);
    const symbol = getCurrencySymbol(locale, currency);

    return {
      locale: displayLocale,
      currency,
      currencySymbol: symbol,
      formatAmount: (amount: number) => formatAmountUtil(amount, displayLocale, currency),
    };
  }, [initialLocale, initialCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
