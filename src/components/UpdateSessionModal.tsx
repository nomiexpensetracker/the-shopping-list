"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  token: string;
  initialTitle: string;
  initialName: string;
  onDone: () => void;
  onClose: () => void;
}

export default function UpdateSessionModal({ token, initialTitle, initialName, onDone, onClose }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("Session name is required.");
      return;
    }
    if (!name.trim()) {
      setError("Nickname is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const participantId = localStorage.getItem(`participant_${token}_id`) ?? "";

      const [titleRes, nameRes] = await Promise.all([
        fetch(`/api/sessions/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        }),
        fetch(`/api/sessions/${token}/participants`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant_id: participantId, name: name.trim() }),
        }),
      ]);

      if (!titleRes.ok || !nameRes.ok) {
        setError("Failed to update. Please try again.");
        setLoading(false);
        return;
      }

      // Update localStorage nickname
      localStorage.setItem(`participant_${token}_name`, name.trim());

      onDone();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Update session details"
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
            Set up your list
          </h2>
          <p className="text-sm text-center mt-1" style={{ color: "var(--muted)" }}>
            Rename the session and choose your nickname before you start shopping.
          </p>
        </div>

        {/* Session Name */}
        <div>
          <label
            htmlFor="session-name"
            className="text-xs font-semibold uppercase tracking-widest mb-3 block"
            style={{ color: "var(--muted)" }}
          >
            Session Name
          </label>
          <input
            ref={titleRef}
            id="session-name"
            type="text"
            maxLength={26}
            placeholder="e.g. Weekly Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 h-14 text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="Session name"
          />
        </div>

        {/* Nickname */}
        <div>
          <label
            htmlFor="nickname"
            className="text-xs font-semibold uppercase tracking-widest mb-3 block"
            style={{ color: "var(--muted)" }}
          >
            Your Nickname
          </label>
          <input
            id="nickname"
            type="text"
            maxLength={26}
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-4 h-14 text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="Your nickname"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-500 text-sm -mt-3">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="size-14 rounded-xl font-semibold text-base transition flex items-center justify-center disabled:opacity-60"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            <Image src="/icons/close.svg" alt="Close" width={24} height={24} />
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            {loading ? "Updating…" : "Update Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
