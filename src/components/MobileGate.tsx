"use client";

import { useEffect, useState } from "react";

export default function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    // SSR / hydration — render nothing to avoid flash
    return null;
  }

  if (!isMobile) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-8 text-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-5xl mb-6">📱</div>
        <h1
          className="text-2xl font-black mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Mobile only app
        </h1>
        <p className="text-base max-w-xs" style={{ color: "var(--muted)" }}>
          The Shopping List is designed for mobile. Open this page on your phone
          to start or join a shopping session.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
