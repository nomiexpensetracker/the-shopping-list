"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { QuickList } from "@/types/dao";

interface Props {
  lists: QuickList[];
}

export default function QuickListsBrowser({ lists }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "cuisine" | "event">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lists.filter((l) => {
      const matchCat =
        category === "all" ||
        (l.category?.toLowerCase() ?? "") === category;
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.description?.toLowerCase() ?? "").includes(q);
      return matchCat && matchSearch;
    });
  }, [lists, search, category]);

  const featured = filtered.filter((l) => l.is_featured);
  const rest = filtered.filter((l) => !l.is_featured);

  return (
    <>
      {/* Search + filter bar */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 shrink-0"
            style={{ color: "var(--muted)" }}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quick lists…"
            aria-label="Search quick lists"
            className="w-full pl-9 pr-4 py-3 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="relative shrink-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            aria-label="Filter by category"
            className="appearance-none h-full px-4 py-3 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="all">All</option>
            <option value="cuisine">Cuisine</option>
            <option value="event">Event</option>
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 shrink-0"
            style={{ color: "var(--muted)" }}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>
          No lists match your search.
        </p>
      )}

      {featured.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Featured
          </p>
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {featured.map((ql, idx) => (
              <QuickListCard key={ql.id} ql={ql} featured isLast={idx === featured.length - 1} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            {category === "event" ? "Events" : category === "cuisine" ? "Cuisines" : "All Lists"}
          </p>
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {rest.map((ql, idx) => (
              <QuickListCard key={ql.id} ql={ql} isLast={idx === rest.length - 1} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function QuickListCard({ ql, featured = false, isLast = false }: { ql: QuickList; featured?: boolean; isLast?: boolean }) {
  return (
    <Link
      href={`/app/quick-lists/${ql.slug}`}
      className="w-full flex items-center justify-between px-4 py-4 text-left transition active:opacity-70"
      style={{
        background: "var(--card)",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
      }}
    >
      <div className="flex flex-col min-w-0 gap-0.5 mr-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base truncate" style={{ color: "var(--foreground)" }}>
            {ql.title}
          </span>
          {featured && (
            <span
              className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--brand)", color: "#ffffff" }}
            >
              Popular
            </span>
          )}
        </div>
        {ql.description && (
          <span className="text-sm truncate" style={{ color: "var(--muted)" }}>
            {ql.description}
          </span>
        )}
      </div>
      <svg
        className="shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M9 18L15 12L9 6" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
