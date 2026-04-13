"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ThemeToggle = dynamic(() => import("./ThemeToggle"), { ssr: false });

export default function StarterPacksTopBar() {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 h-20"
      style={{ background: "var(--main-bg)", borderBottom: "1px solid var(--border)" }}
    >
      <Link href="/app" className="flex leading-none gap-1">
        <span className="text-xl font-black" style={{ color: "var(--foreground)" }}>
          The Shopping
        </span>
        <span className="text-xl font-black" style={{ color: "var(--brand)" }}>
          List.
        </span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
