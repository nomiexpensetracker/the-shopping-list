"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import MobileGate from "@/components/MobileGate";
import Image from "next/image";

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    fetch("/api/sessions/" + token + "/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to join session");
        return res.json();
      })
      .then((res) => {
        // Store the participant name in localStorage for later retrieval
        localStorage.setItem(`participant_${token}_id`, res.id);
        localStorage.setItem(`participant_${token}_name`, name.trim());
        router.push("/session/" + token);
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
  }

  return (
    <MobileGate>
      <main
        className="min-h-dvh flex flex-col justify-center px-6 py-10"
        style={{ background: "var(--background)" }}
      >
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-black mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Join
          </h1>
          <h1
            className="text-4xl font-black italic mb-4"
            style={{ color: "var(--brand)" }}
          >
            Shopping Session
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            You&apos;ve been invited to join a real-time shopping session. Enter
            your name below to start collaborating.
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--muted)" }}>
              Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              aria-label="Nickname (optional)"
              placeholder="John Doe, Mom, Dad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-4 rounded-xl text-base focus:outline-none"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition disabled:opacity-50"
            style={{ background: "var(--brand)" }}
          >
            <span className="flex gap-2">Join Shopping <Image src="/icons/arrow.svg" alt="Arrow" width={16} height={16} /></span>
          </button>
        </form>

        <p className="text-xs text-center mt-8" style={{ color: "var(--muted)" }}>
          Session ID: {token.toUpperCase()}
        </p>
      </main>
    </MobileGate>
  );
}
