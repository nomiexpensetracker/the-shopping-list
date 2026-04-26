"use client";

import { useState } from "react";
import type { QuickListItem } from "@/types/dao";
import { AddIcon, RemoveIcon } from "@/components/icons";
import StartShoppingButton from "@/components/StartShoppingButton";
import AddToMyListsButton from "@/components/AddToMyListsButton";

interface Props {
  items: QuickListItem[];
  quickListId: string;
  packSlug: string;
  packTitle: string;
}

export default function QuickListServings({ items, quickListId, packSlug, packTitle }: Props) {
  const [servings, setServings] = useState(1);

  const decrease = () => setServings((s) => Math.max(1, s - 1));
  const increase = () => setServings((s) => s + 1);

  return (
    <section>
      {/* Servings counter */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-foreground">Items</h2>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Servings
          </span>
          <div
            className="w-24 h-10 py-1 px-2 rounded-lg flex items-center justify-between"
            style={{ background: "var(--card)" }}
          >
            <button
              aria-label="Decrease servings"
              onClick={decrease}
              className="size-6 flex items-center justify-center"
              disabled={servings === 1}
              style={{ opacity: servings === 1 ? 0.3 : 1 }}
            >
              <RemoveIcon fill="#636262" />
            </button>
            <span
              className="flex-1 text-center text-base font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {servings}
            </span>
            <button
              aria-label="Increase servings"
              onClick={increase}
              className="size-6 flex items-center justify-center"
            >
              <AddIcon fill="#065f46" />
            </button>
          </div>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No items yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const scaledQty = item.quantity * servings;
            return (
              <li key={item.id} className="flex items-center justify-between py-3 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--brand)" }} />
                  <span className="text-sm font-medium truncate text-foreground">
                    {item.name}
                  </span>
                  {item.is_optional && (
                    <span className="shrink-0 text-xs italic" style={{ color: "var(--muted)" }}>
                      (optional)
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-sm tabular-nums" style={{ color: "var(--muted)" }}>
                  {scaledQty}
                  {item.unit ? ` ${item.unit}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* CTA */}
      <div
        className="mt-10 rounded-2xl p-6 text-center"
        style={{
          background: "var(--brand-light)",
          border: "1px solid var(--brand)",
        }}
      >
        <h2 className="text-lg font-bold mb-2 text-foreground">Ready to shop?</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Create a shopping session from this list and invite friends or family.
        </p>
        <div className="flex flex-col gap-2">
          <StartShoppingButton
            quickListId={quickListId}
            packSlug={packSlug}
            packTitle={packTitle}
            servings={servings}
          />
          <AddToMyListsButton
            quickListId={quickListId}
            packTitle={packTitle}
            servings={servings}
          />
        </div>
      </div>
    </section>
  );
}
