import React from 'react'
import Link from "next/link";

const StarterPackSection = () => {
  return (
    <section className="flex flex-col gap-3">
      <p
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--muted)" }}
      >
        Quick List
      </p>
      <Link
        href="/app/starter-packs"
        className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition active:opacity-70"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">🛍️</span>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
              Browse Starter Packs
            </p>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
              Ready-made lists for any occasion
            </p>
          </div>
        </div>
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M9 18L15 12L9 6" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </section>
  )
}

export default StarterPackSection