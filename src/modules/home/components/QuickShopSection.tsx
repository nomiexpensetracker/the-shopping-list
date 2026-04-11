import Image from "next/image";

interface QuickShopSectionProps {
  showQuickShop: boolean;
  onToggle: () => void;
  name: string;
  setName: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function QuickShopSection({
  showQuickShop,
  onToggle,
  name,
  setName,
  title,
  setTitle,
  loading,
  error,
  onSubmit,
}: QuickShopSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full"
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Quick Shop
        </p>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {showQuickShop ? "▲ hide" : "▼ show"}
        </span>
      </button>

      {showQuickShop && (
        <div
          className="rounded-2xl px-5 py-5 flex flex-col gap-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Start a one-off shopping session without saving a list.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold uppercase tracking-widest block"
                style={{ color: "var(--muted)" }}
              >
                Shopping Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                aria-label="Shopping title (required)"
                placeholder="Weekly Groceries, Party Supplies"
                onChange={(e) => setTitle(e.target.value)}
                maxLength={26}
                className="w-full px-4 py-4 rounded-xl text-base focus:outline-none transition text-center"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold uppercase tracking-widest block"
                style={{ color: "var(--muted)" }}
              >
                Nickname <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                aria-label="Nickname (required)"
                placeholder="John Doe, Mom, Dad"
                onChange={(e) => setName(e.target.value)}
                maxLength={26}
                className="w-full px-4 py-4 rounded-xl text-base focus:outline-none transition text-center"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            {error && (
              <p role="alert" className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--brand)" }}
            >
              {loading ? (
                "Creating your session…"
              ) : (
                <span className="flex gap-2">
                  Shop List Now{" "}
                  <Image src="/icons/arrow.svg" alt="Arrow" width={16} height={16} />
                </span>
              )}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
