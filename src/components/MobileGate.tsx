"use client";

import { useSyncExternalStore } from "react";

function getIsMobileViewport() {
  return window.innerWidth < 768;
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export default function MobileGate({ children }: { children: React.ReactNode }) {
  // Server snapshot = true: middleware already redirects desktop UA users,
  // so the server can safely assume mobile and render content into the initial HTML.
  // Client: live viewport-width check with resize subscription.
  const isMobile = useSyncExternalStore(
    subscribeToResize,
    getIsMobileViewport,
    () => true,
  );

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
