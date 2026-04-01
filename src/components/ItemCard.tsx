"use client";

import type { Item } from "@/lib/types";

interface Props {
  item: Item;
  onCollect: (item: Item) => void;
  onUncollect: (item: Item) => void;
  onDelete: (item: Item) => void;
  onEdit: (item: Item) => void;
}

export default function ItemCard({ item, onCollect, onUncollect, onDelete, onEdit }: Props) {
  const isCollected = item.state === "collected";

  return (
    <div
      className="flex items-center gap-3 py-3 px-1"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Checkbox / state toggle */}
      <button
        onClick={() => isCollected ? onUncollect(item) : onCollect(item)}
        aria-label={isCollected ? "Mark as not collected" : "Mark as collected"}
        className="shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition"
        style={{
          borderColor: isCollected ? "var(--brand)" : "var(--muted)",
          background: isCollected ? "var(--brand)" : "transparent",
        }}
      >
        {isCollected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Name + note */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: "var(--foreground)",
            textDecoration: isCollected ? "line-through" : "none",
            opacity: isCollected ? 0.6 : 1,
          }}
        >
          {item.name}
        </p>
        {isCollected && item.price != null && (
          <p className="text-xs" style={{ color: "var(--brand)" }}>
            ${item.price}
          </p>
        )}
        {isCollected && item.contributor_label && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {item.contributor_label}
          </p>
        )}
      </div>

      {/* Quantity */}
      <span className="text-sm font-semibold w-6 text-center" style={{ color: "var(--foreground)" }}>
        {item.quantity}
      </span>

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition"
          style={{ color: "var(--muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition"
          style={{ color: "var(--muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
