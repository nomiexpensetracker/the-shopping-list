"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";

const subscribe = () => () => {};

export default function CookieBanner() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!isClient || dismissed || localStorage.getItem("cookie_consent") !== null) return null;

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    window.dispatchEvent(new StorageEvent("storage", { key: "cookie_consent", newValue: "accepted" }));
    setDismissed(true);
  }

  function handleDecline() {
    localStorage.setItem("cookie_consent", "declined");
    setDismissed(true);
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        className="max-w-lg mx-auto rounded-2xl px-5 py-4 shadow-lg"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-sm font-bold mb-1"
          style={{ color: "var(--foreground)" }}
        >
          We use cookies
        </p>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          We use Google Analytics to understand how the app is used. Analytics cookies are only set
          if you accept.{" "}
          <Link
            href="/app/cookies"
            className="underline underline-offset-2"
            style={{ color: "var(--brand)" }}
          >
            Learn more
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-xl py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: "var(--brand)" }}
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 rounded-xl py-2 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
