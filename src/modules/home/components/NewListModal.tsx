import { CloseIcon } from "@/components/icons";

interface NewListModalProps {
  listName: string;
  setListName: (v: string) => void;
  creating: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function NewListModal({
  listName,
  setListName,
  creating,
  error,
  onSubmit,
  onClose,
}: NewListModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-4"
        style={{ background: "var(--card)" }}
      >
        <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>
          New List
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="e.g. Weekly Groceries, IKEA run"
            maxLength={60}
            autoFocus
            className="w-full px-4 py-4 rounded-xl text-base focus:outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="List name"
          />
          {error && (
            <p role="alert" className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="size-14 rounded-xl font-semibold text-base transition flex items-center justify-center"
              style={{ background: "var(--background)", color: "var(--foreground)" }}
            >
              <CloseIcon fill="var(--foreground)" />
            </button>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
              style={{ background: "var(--brand)" }}
            >
              {creating ? "Creating…" : "Create List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
