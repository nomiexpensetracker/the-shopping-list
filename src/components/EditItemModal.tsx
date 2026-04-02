"use client";

import { useState, useRef, useEffect } from "react";
import type { Item } from "@/lib/types";
import Image from "next/image";

interface Props {
  item: Item | null;  // null = adding new item
  onDone: (name: string, quantity: number) => void;
  onClose: () => void;
}

export default function EditItemModal({ item, onDone, onClose }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [qty, setQty] = useState(item?.quantity ?? 1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleDone() {
    if (!name.trim()) return;
    onDone(name.trim(), qty);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={item ? "Edit item" : "Add item"}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-5"
        style={{ background: "var(--card)" }}
      >
        <div
          className="mx-auto w-10 h-1 rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />

        <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          {item ? "Edit Item" : "Add Item"}
        </h2>

        <div>
          <label
            htmlFor="item-name"
            className="text-xs font-semibold uppercase tracking-widest mb-2 block"
            style={{ color: "var(--muted)" }}
          >
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            ref={inputRef}
            id="item-name"
            type="text"
            placeholder="e.g. Organic Avocados"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="item-name-description"
            className="text-xs font-semibold uppercase tracking-widest mb-2 block"
            style={{ color: "var(--muted)" }}
          >
            Description (optional)
          </label>
          <input
            ref={inputRef}
            id="item-name-description"
            type="text"
            placeholder="e.g. Brand, size, or any details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>
            Quantity
          </label>
          <div className="flex items-center gap-4 p-2" style={{ background: "var(--quantity-bg)" }}>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-14 h-14 rounded-2xl text-2xl font-bold flex items-center justify-center"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              <Image src="/icons/remove-minus.svg" alt="Decrease quantity" width={24} height={24} />
            </button>
            <span className="flex-1 text-center text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(999, q + 1))}
              aria-label="Increase quantity"
              className="w-14 h-14 rounded-2xl text-2xl font-bold flex items-center justify-center"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              <Image src="/icons/add-plus.svg" alt="Increase quantity" width={24} height={24} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl font-semibold text-base transition flex items-center justify-center"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            <Image src="/icons/close.svg" alt="Cancel" width={24} height={24} />
          </button>
          <button
            onClick={handleDone}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl text-white font-semibold text-base transition disabled:opacity-50"
            style={{ background: "var(--brand)" }}
          >
            {item ? "Save Changes" : "Add to List"}
          </button>
        </div>
      </div>
    </div>
  );
}
