import Script from "next/script";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Shopping List — Collaborative Group Shopping",
  description:
    "Create or join a group shopping session in seconds. Collaborate on a shared list, track your budget, and finish with a digital receipt.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "The Shopping List — Collaborative Group Shopping",
    description:
      "Create or join a group shopping session in seconds. Collaborate on a shared list, track your budget, and finish with a digital receipt.",
    url: "https://the-shopping-list-eight.vercel.app",
    siteName: "The Shopping List",
    images: [
      {
        url: "https://the-shopping-list-eight.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Shopping List App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EG3HB87D9P"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EG3HB87D9P');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
