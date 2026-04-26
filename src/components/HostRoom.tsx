"use client";

import { useState } from "react";
import { Participant } from "@/types/dao";

interface Props {
  token: string;
  pendingParticipants: Pick<Participant, "id" | "name" | "color">[];
  hostId: string;
  onUpdate: () => void;
}

type ActionState = "idle" | "approving" | "rejecting";

export default function HostRoom({ token, pendingParticipants, hostId, onUpdate }: Props) {
  // Track in-flight state per participant to disable their buttons during the request.
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});

  const approve = async (participantId: string) => {
    setActionState((prev) => ({ ...prev, [participantId]: "approving" }));
    try {
      await fetch(`/api/sessions/${token}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: hostId }),
      });
    } finally {
      setActionState((prev) => ({ ...prev, [participantId]: "idle" }));
      onUpdate();
    }
  };

  const reject = async (participantId: string) => {
    setActionState((prev) => ({ ...prev, [participantId]: "rejecting" }));
    try {
      await fetch(`/api/sessions/${token}/participants/${participantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: hostId }),
      });
    } finally {
      setActionState((prev) => ({ ...prev, [participantId]: "idle" }));
      onUpdate();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Host room — approve waiting participants"
    >
      {/* Non-dismissible overlay — host must act on pending participants */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom sheet */}
      <div
        className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-4"
        style={{ background: "var(--card)" }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto w-10 h-1 rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />

        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Waiting to Join
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Approve or reject each person below before they can enter the session.
          </p>
        </div>

        <ul className="flex flex-col gap-3" aria-label="Pending participants">
          {pendingParticipants.map((p) => {
            const state = actionState[p.id] ?? "idle";
            const busy = state !== "idle";
            return (
              <li
                key={p.id}
                className="flex items-center gap-3"
              >
                {/* Color avatar */}
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: p.color }}
                  aria-hidden="true"
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <span
                  className="flex-1 text-base font-semibold truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {p.name}
                </span>

                <div className="flex gap-1">
                  {/* Reject */}
                  <button
                    onClick={() => reject(p.id)}
                    disabled={busy}
                    aria-label={`Reject ${p.name}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-40"
                    style={{ background: "var(--background)" }}
                  >
                    {state === "rejecting" ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: "var(--muted)" }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </button>

                  {/* Approve */}
                  <button
                    onClick={() => approve(p.id)}
                    disabled={busy}
                    aria-label={`Approve ${p.name}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-40"
                    style={{ background: "var(--brand)" }}
                  >
                    {state === "approving" ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
