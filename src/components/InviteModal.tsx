"use client";

import { useState } from "react";
import QRCode from "@/components/QRCode";
import Image from "next/image";

interface Props {
  sessionId: string;
  onClose: () => void;
}

export default function InviteModal({ sessionId, onClose }: Props) {
  const joinUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/session/" + sessionId + "/join"
      : "/session/" + sessionId + "/join";

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
          <Image src="/icons/close.svg" alt="Close" width={16} height={16} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Invite Collaborators
          </h2>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Share this unique session link to shop together in real-time. Changes sync instantly across all devices.
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
              <Image src="/icons/clipboard.svg" alt="Copy link" width={24} height={24} />
              Copy Link
            </>
          )}
        </button>

        <p className="text-xs flex items-center italic gap-1" style={{ color: "var(--muted)" }}>
          Link expires after 24 hours of inactivity
        </p>
      </div>
    </div>
  );
}
