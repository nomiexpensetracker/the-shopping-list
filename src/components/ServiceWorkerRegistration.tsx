"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) once on mount.
 * Silently skips on browsers that don't support Service Workers.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  return null;
}
