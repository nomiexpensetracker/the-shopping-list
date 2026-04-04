"use client";

import { useEffect, useState } from "react";
import type { Participant } from "@/types/dao";

interface Props {
  participants: Participant[];
}

const TYPING_SPEED_MS = 60;
const DELETING_SPEED_MS = 30;
const HOLD_DURATION_MS = 5000;

const ParticipantToast = ({ participants }: Props) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (!participants.length) return;

    const fullText = `${participants[index].name}'s Join Session`;
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(
          () => setDisplayText(fullText.slice(0, displayText.length + 1)),
          TYPING_SPEED_MS
        );
      } else {
        timeout = setTimeout(() => setPhase("deleting"), HOLD_DURATION_MS);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          DELETING_SPEED_MS
        );
      } else {
        timeout = setTimeout(() => {
          setIndex((i) => (i + 1) % participants.length);
          setPhase("typing");
        }, 0);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase, index, participants]);

  if (!participants.length) return null;

  return (
    <div
      className="h-14 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "#79747E" }}
      role="status"
      aria-live="polite"
      aria-label={displayText}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Person-plus icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>

        <span className="text-sm font-semibold text-white truncate">
          {displayText}
          {/* blinking cursor */}
          <span
            className="inline-block w-px h-3.5 bg-white ml-px align-middle animate-pulse"
            aria-hidden="true"
          />
        </span>
      </div>

      {/* LIVE badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">LIVE</span>
      </div>
    </div>
  );
}

export default ParticipantToast;