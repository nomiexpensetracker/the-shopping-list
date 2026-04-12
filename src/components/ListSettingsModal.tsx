"use client";

import { useState } from "react";

interface ListSettingsModalProps {
  listName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function ListSettingsModal({ listName, onSave, onClose }: ListSettingsModalProps) {
  const [nameInput, setNameInput] = useState(listName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-4"
        style={{ background: "var(--card)" }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto w-10 h-1 rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />

        <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>
          Rename List
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Weekly Groceries"
            maxLength={60}
            autoFocus
            className="w-full px-4 py-4 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="List name"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-semibold text-base"
              style={{ background: "var(--background)", color: "var(--muted)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="flex-1 py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
              style={{ background: "var(--brand)" }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
