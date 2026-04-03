"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import { CommonResponse, PostSessionResponse } from "@/types/dto";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Trim inputs and validate on client-side before sending to server
      if (!title.trim()) {
        setError("Session title is required");
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      const payload = JSON.stringify({
        name: name.trim(),
        title: title.trim(),
      });

      const res = await fetch("/api/sessions", {
        body: payload,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json() as CommonResponse<PostSessionResponse>;
      if (data.success) {
        const sessionData = data.data;
        // store data in localStorage for later use in session page
        localStorage.setItem(`participant_${sessionData.id}_name`, name.trim());
        localStorage.setItem(`participant_${sessionData.id}_id`, sessionData.participant.id);
        localStorage.setItem(`participant_${sessionData.id}_color`, sessionData.participant.color);

        // navigate to session page
        router.push("/session/" + sessionData.id);
      } else {
        setError("Oops something went wrong. Please try again.");
        setLoading(false);
      }
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>
              Shopping Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              aria-label="Shopping title (required)"
              placeholder="Weekly Groceries, Party Supplies"
              onChange={(e) => setTitle(e.target.value)}
              maxLength={26}
              className="w-full px-4 py-4 rounded-xl text-base focus:outline-none transition text-center"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />

            <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>
              Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              aria-label="Nickname (optional)"
              placeholder="John Doe, Mom, Dad"
              onChange={(e) => setName(e.target.value)}
              maxLength={26}
              className="w-full px-4 py-4 rounded-xl text-base focus:outline-none transition text-center"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />

            {error && (
              <p role="alert" className="text-red-500 text-sm">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition active:scale-95 disabled:variable(--brand-dark) disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--brand)" }}
          >
            {loading ? "Creating your session\u2026" : <span className="flex gap-2">Shop List Now <Image src="/icons/arrow.svg" alt="Arrow" width={16} height={16} /></span>}
          </button>
        </form>
      </div>
    </main>
    </MobileGate>
  );
}
