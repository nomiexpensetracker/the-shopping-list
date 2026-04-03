"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/types";

interface Props {
  item: Item;
  onDone: (qty: number, price: number | null) => void;
  onClose: () => void;
}

export default function CollectModal({ item, onDone, onClose }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const [priceStr, setPriceStr] = useState(item.price != null ? String(item.price) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleDone() {
    const price = priceStr === "" ? null : parseFloat(priceStr);
    if (priceStr !== "" && (isNaN(price!) || price! < 0)) return;
    onDone(qty, price ?? null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Log collection details"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-6"
        style={{ background: "var(--card)" }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto w-10 h-1 rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />

        <div>
          <h2
            className="text-xl font-bold text-center"
            style={{ color: "var(--foreground)" }}
          >
            {item.name}
          </h2>
          <p className="text-sm text-center mt-1" style={{ color: "var(--muted)" }}>
            Log collection details
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-widest mb-3 block"
            style={{ color: "var(--muted)" }}
          >
            Collected Qty
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              &minus;
            </button>
            <span
              className="flex-1 text-center text-3xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(999, q + 1))}
              aria-label="Increase quantity"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              +
            </button>
          </div>
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="item-price"
            className="text-xs font-semibold uppercase tracking-widest mb-3 block"
            style={{ color: "var(--muted)" }}
          >
            Item Price (Optional)
          </label>
          <div
            className="flex items-center rounded-xl px-4 h-14"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-lg font-semibold mr-2" style={{ color: "var(--muted)" }}>
              $
            </span>
            <input
              ref={inputRef}
              id="item-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              className="flex-1 bg-transparent text-lg focus:outline-none"
              style={{ color: "var(--foreground)" }}
              aria-label="Item price"
            />
          </div>
        </div>

        <button
          onClick={handleDone}
          className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition"
          style={{ background: "var(--brand)" }}
        >
          Done ✓
        </button>
      </div>
    </div>
  );
}
