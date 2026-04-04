"use client";

import { Participant } from "@/types/dao";
import { getUserColor } from "@/lib/utils";

interface ParticipantAvatarsProps {
  participants: Participant[];
}

function getTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#111111" : "#ffffff";
}

const MAX_SHOWN = 3;

export default function ParticipantAvatars({ participants }: ParticipantAvatarsProps) {
  const sorted = [...participants].sort(
    (a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  );

  const overflow = Math.max(0, participants.length - MAX_SHOWN);
  const shown = sorted.slice(-MAX_SHOWN);

  if (participants.length === 0) return null;

  return (
    <div className="flex items-center" aria-label={`${participants.length} participant${participants.length !== 1 ? "s" : ""}`}>
      {shown.map((p, i) => {
        const bg = getUserColor(p.id, participants);
        const color = getTextColor(bg);
        return (
          <div
            key={p.id}
            title={p.name}
            aria-label={p.name}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
            style={{
              background: bg,
              color,
              borderColor: "var(--main-bg)",
              marginLeft: i === 0 ? 0 : -8,
              zIndex: i + 1,
              position: "relative",
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        );
      })}

      {overflow > 0 && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
          style={{
            background: "var(--card)",
            color: "var(--muted)",
            borderColor: "var(--main-bg)",
            marginLeft: -8,
            zIndex: MAX_SHOWN + 1,
            position: "relative",
          }}
          aria-label={`${overflow} more participant${overflow !== 1 ? "s" : ""}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
