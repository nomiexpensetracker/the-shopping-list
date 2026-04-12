"use client";

interface EndSessionModalProps {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

export default function EndSessionModal({ onConfirm, onClose, loading }: EndSessionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="End shopping session"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />

      {/* Sheet */}
      <div
        className="relative w-full rounded-t-3xl px-6 pt-4 pb-10 flex flex-col gap-6"
        style={{ background: "var(--card)" }}
      >
        {/* Drag handle */}
        <div
          className="mx-auto w-10 h-1 rounded-full mb-2"
          style={{ background: "var(--border)" }}
        />

        <div className="flex flex-col gap-2">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            End Shopping Session?
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            This will permanently end the session for all participants. Collected items will be marked as found on your list.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 rounded-xl font-semibold text-base disabled:opacity-50"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
            style={{ background: "#ef4444" }}
          >
            {loading ? "Ending…" : "End Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
