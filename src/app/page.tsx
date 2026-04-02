"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import MobileGate from "@/components/MobileGate";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json() as { id: string };
      router.push("/session/" + data.id);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <MobileGate>
    <main
      className="relative min-h-dvh flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Gradient blob top-right */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pt-20 pb-10">
        <h1
          className="text-5xl font-black leading-tight tracking-tight mb-2 text-center"
          style={{ color: "var(--foreground)" }}
        >
          The Shopping
        </h1>
        <h1
          className="text-5xl font-black leading-tight tracking-tight mb-6 text-center"
          style={{ color: "var(--brand)" }}
        >
          List.
        </h1>

        <p
          className="text-lg font-normal leading-relaxed mb-10 text-center"
          style={{ color: "var(--muted)" }}
        >
          High-speed utility meets editorial elegance. Create and shop together
          in seconds.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Shopping Session Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={26}
            className="w-full px-4 py-4 rounded-xl text-base focus:outline-none transition text-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="Shopping session title (optional)"
          />

          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!title || loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition active:scale-95 disabled:variable(--brand-dark) disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--brand)" }}
          >
            {loading ? "Creating\u2026" : <span className="flex gap-2">Shop List Now <Image src="/icons/arrow.svg" alt="Arrow" width={16} height={16} /></span>}
          </button>
        </form>
      </div>
    </main>
    </MobileGate>
  );
}
