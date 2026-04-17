import { headers } from "next/headers";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { SWRConfig } from "swr";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "en-US";
  const currency = headersList.get("x-currency") ?? "USD";

  return (
    <CurrencyProvider initialLocale={locale} initialCurrency={currency}>
      <SWRConfig value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      }}>
        {children}
      </SWRConfig>
    </CurrencyProvider>
  );
}
