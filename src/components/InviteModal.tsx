"use client";

import { useState } from "react";
import QRCode from "@/components/QRCode";

interface Props {
  sessionId: string;
  onClose: () => void;
}

export default function InviteModal({ sessionId, onClose }: Props) {
  const joinUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/session/" + sessionId
      : "/session/" + sessionId;

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Invite collaborators"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center gap-6"
        style={{ background: "var(--card)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close invite modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ color: "var(--muted)" }}
        >
          &#10005;
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Invite Collaborators
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Share this unique session link to shop together. Changes sync every 30 seconds.
          </p>
        </div>

        <div
          className="p-4 rounded-2xl"
          style={{ background: "var(--brand-light)" }}
        >
          <QRCode value={joinUrl} size={180} />
        </div>

        <button
          onClick={copyLink}
          className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition"
          style={{ background: "var(--brand)" }}
        >
          {copied ? "Copied!" : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Link expires after 24 hours of inactivity
        </p>
      </div>
    </div>
  );
}
