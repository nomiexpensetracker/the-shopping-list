"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WaitingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  // Read participant ID from localStorage (set during the join step).
  const participantId = useMemo(
    () => localStorage.getItem(`participant_${token}_id`),
    [token]
  );

  // No participant record — send back to the join page.
  useEffect(() => {
    if (!participantId) {
      router.replace(`/app/session/${token}/join`);
    }
  }, [participantId, token, router]);

  const { data, error } = useSWR(
    participantId
      ? `/api/sessions/${token}/participants/${participantId}`
      : null,
    fetcher,
    {
      refreshInterval: 120_000, // Poll every 2 minutes in case the host takes a while to respond.
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Approved — forward to session.
  useEffect(() => {
    if (data?.data?.status === "approved") {
      router.replace(`/app/session/${token}`);
    }
  }, [data, token, router]);

  // Rejected — 404 means the record was deleted.
  const isRejected =
    error?.status === 404 ||
    (data && !data.success && data.error === "Participant not found") ||
    (data?.status === 404);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {!participantId && (
        <p className="text-base" style={{ color: "var(--muted)" }}>
          Connecting…
        </p>
      )}

      {participantId && !isRejected && (
        <>
          {/* Animated waiting indicator */}
          <div className="mb-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-3 h-3 rounded-full"
                style={{
                  background: "var(--brand)",
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Waiting for the host
          </h1>
          <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>
            The session host will grant you access shortly. This page will
            automatically redirect you once you&apos;re approved.
          </p>

          <style>{`
            @keyframes pulse {
              0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>
      )}

      {participantId && isRejected && (
        <>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "var(--card)" }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--muted)" }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Your request was rejected
          </h1>
          <p className="text-sm max-w-xs mb-8" style={{ color: "var(--muted)" }}>
            The host declined your request to join this session.
          </p>
          <button
            onClick={() => router.push(`/app/session/${token}/join`)}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: "var(--brand)" }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
