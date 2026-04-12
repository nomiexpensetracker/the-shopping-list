"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StarterPackVariantWithItems } from "@/types/dto";

// Detect mobile UA on the client.
// This is for UX branching only — the mobile gate is enforced server-side.
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|Android.*Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

interface Props {
  variants: StarterPackVariantWithItems[];
  packSlug: string;
  packTitle: string;
}

type Step = "idle" | "modal" | "qr-desktop" | "loading";

export default function StartShoppingButton({ variants, packSlug, packTitle }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? ""
  );
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
      setError("Masukkan nama kamu terlebih dahulu");
      return;
    }
    if (trimmed.length > 26) {
      setError("Nama maksimal 26 karakter");
      return;
    }

    setError("");
    setStep("loading");

    try {
      const res = await fetch(
        `/api/starter-packs/${packSlug}/variants/${selectedVariantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantName: trimmed }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Gagal membuat sesi. Coba lagi.");
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

      const url = `${window.location.origin}/app/session/${token}`;

      if (isMobileDevice()) {
        router.push(`/app/session/${token}`);
      } else {
        setSessionUrl(url);
        setStep("qr-desktop");
      }
    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internet kamu.");
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
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <span>🛒</span>
        Mulai Belanja
      </button>

      {/* Modal */}
      {(step === "modal" || step === "loading") && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { if (step !== "loading") setStep("idle"); }}
          />

          <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <h2 id="start-modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Mulai Belanja
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Masukkan namamu untuk memulai sesi belanja dari pack ini.
            </p>

            {/* Variant selector — only show if more than one */}
            {variants.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Pilih Varian
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={step === "loading"}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.items.length} item)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name input */}
            <div className="mb-4">
              <label
                htmlFor="participant-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Nama kamu
              </label>
              <input
                id="participant-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
                maxLength={26}
                placeholder="mis. Budi"
                disabled={step === "loading"}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                aria-describedby={error ? "name-error" : undefined}
              />
              {error && (
                <p id="name-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("idle")}
                disabled={step === "loading"}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={step === "loading"}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {step === "loading" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Membuat sesi…
                  </>
                ) : (
                  "Mulai"
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
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Scan dengan ponselmu
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sesi <span className="font-medium text-gray-700 dark:text-gray-300">{packTitle}</span> sudah dibuat.
          Scan QR di bawah untuk melanjutkan di ponsel.
        </p>

        <div className="flex justify-center mb-6">
          {QRCodeComponent ? (
            <QRCodeComponent value={url} size={200} />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-xs text-gray-400">Loading QR…</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 break-all mb-5">{url}</p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
