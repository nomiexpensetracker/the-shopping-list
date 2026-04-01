"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import MobileGate from "@/components/MobileGate";

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    sessionStorage.setItem("contributor_" + token, name.trim());
    router.push("/session/" + token);
  }

  return (
    <MobileGate>
      <main
        className="min-h-dvh flex flex-col justify-center px-6 py-10"
        style={{ background: "var(--background)" }}
      >
        <div className="mb-10">
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
            <label
              htmlFor="user-name"
              className="text-xs font-semibold uppercase tracking-widest mb-2 block"
              style={{ color: "var(--muted)" }}
            >
              Your Identity
            </label>
            <input
              id="user-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-4 rounded-xl text-base focus:outline-none"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              aria-label="Your display name"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition disabled:opacity-50"
            style={{ background: "var(--brand)" }}
          >
            Join Session &rarr;
          </button>
        </form>

        <p className="text-xs text-center mt-8" style={{ color: "var(--muted)" }}>
          Session ID: {token.slice(0, 12).toUpperCase()}
        </p>
      </main>
    </MobileGate>
  );
}
