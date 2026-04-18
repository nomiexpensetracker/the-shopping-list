"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon } from "@/components/icons";

// Detect mobile UA on the client.
// This is for UX branching only — the mobile gate is enforced server-side.
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|Android.*Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

interface Props {
  quickListId: string;
  packSlug: string;
  packTitle: string;
}

type Step = "idle" | "modal" | "qr-desktop" | "loading";

export default function StartShoppingButton({ quickListId: _quickListId, packSlug, packTitle }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "modal") {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [step]);

  async function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }
    if (trimmed.length > 26) {
      setError("Name must be 26 characters or less");
      return;
    }

    setError("");
    setStep("loading");

    try {
      const res = await fetch(
        `/api/quick-lists/${packSlug}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantName: trimmed, list_id: _quickListId }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to create session. Please try again.");
        setStep("modal");
        return;
      }

      const { data } = json;
      const token: string = data.session_token;
      const participant = data.participant;

      // Persist participant info so the session page can restore it
      localStorage.setItem(`participant_${token}_id`, participant.id);
      localStorage.setItem(`participant_${token}_name`, participant.name);
      localStorage.setItem(`participant_${token}_color`, participant.color);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://the-shopping-list-eight.vercel.app';
      const completeUrl = `${baseUrl}/app/session/${token}`;

      if (isMobileDevice()) {
        router.push(`/app/session/${token}`);
      } else {
        setSessionUrl(completeUrl);
        setStep("qr-desktop");
      }
    } catch {
      setError("Something went wrong. Check your internet connection.");
      setStep("modal");
    }
  }

  if (step === "qr-desktop") {
    return <DesktopQRView url={sessionUrl} packTitle={packTitle} onClose={() => setStep("idle")} />;
  }

  return (
    <>
      <button
        onClick={() => setStep("modal")}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Start Shopping
      </button>

      {/* Modal */}
      {(step === "modal" || step === "loading") && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget && step !== "loading") setStep("idle"); }}
        >
          <div
            className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-5"
            style={{ background: "var(--card)" }}
          >
            <div
              className="mx-auto w-10 h-1 rounded-full mb-2"
              style={{ background: "var(--border)" }}
            />

            <h2 id="start-modal-title" className="text-2xl text-left font-bold" style={{ color: "var(--foreground)" }}>
              Start Shopping
            </h2>

            {/* Name input */}
            <div>
              <label
                htmlFor="participant-name"
                className="text-xs text-left font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--muted)" }}
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="participant-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
                maxLength={26}
                placeholder="e.g. Alex"
                disabled={step === "loading"}
                className="w-full px-4 py-3 rounded-xl text-base focus:outline-none disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                aria-describedby={error ? "name-error" : undefined}
              />
              {error && (
                <p id="name-error" className="mt-1.5 text-xs text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("idle")}
                disabled={step === "loading"}
                aria-label="Close"
                className="size-14 rounded-xl font-semibold text-base transition flex items-center justify-center disabled:opacity-50"
                style={{ background: "var(--background)", color: "var(--foreground)" }}
              >
                <CloseIcon fill="var(--foreground)" />
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={step === "loading"}
                className="w-full h-14 flex items-center justify-center rounded-xl text-white font-semibold text-lg transition disabled:opacity-50 gap-2"
                style={{ background: "var(--brand)" }}
              >
                {step === "loading" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating session…
                  </>
                ) : (
                  "Start"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -----------------------------------------------------------------
// Desktop QR hand-off view
// -----------------------------------------------------------------
function DesktopQRView({
  url,
  packTitle,
  onClose,
}: {
  url: string;
  packTitle: string;
  onClose: () => void;
}) {
  const [QRCodeComponent, setQRCodeComponent] = useState<React.ComponentType<{ value: string; size?: number }> | null>(null);

  useEffect(() => {
    // Dynamically import the QRCode component (client-only)
    import("@/components/QRCode").then((mod) => {
      setQRCodeComponent(() => mod.default);
    });
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR code to start shopping on mobile"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Scan with your phone
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Your <span className="font-medium text-gray-700">{packTitle}</span> session is ready.
          Scan the QR code below to continue on your phone.
        </p>

        <div className="flex justify-center mb-6">
          {QRCodeComponent ? (
            <QRCodeComponent value={url} size={200} />
          ) : (
            <div className="size-50 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-xs text-gray-400">Loading QR…</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 break-all mb-5">{url}</p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-300 text-base font-medium hover:bg-gray-50 transition-colors text-white"
          style={{ background: 'var(--brand)'}}
        >
          Close
        </button>
      </div>
    </div>
  );
}
