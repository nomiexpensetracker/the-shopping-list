"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import MobileGate from "@/components/MobileGate";
import ItemCard from "@/components/ItemCard";
import CollectModal from "@/components/CollectModal";
import EditItemModal from "@/components/EditItemModal";
import InviteModal from "@/components/InviteModal";
import type { Item, Session } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [contributor, setContributor] = useState<string>("");
  const [addInput, setAddInput] = useState("");
  const [collectTarget, setCollectTarget] = useState<Item | null>(null);
  const [editTarget, setEditTarget] = useState<Item | null | "new">(null);
  const [showInvite, setShowInvite] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");

  const { data: session, error: sessError } = useSWR<Session>(
    `/api/sessions/${token}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: items, mutate } = useSWR<Item[]>(
    `/api/sessions/${token}/items`,
    fetcher,
    {
      refreshInterval: 30000,
      onSuccess: () => setSyncStatus("idle"),
      onError: () => setSyncStatus("error"),
      onLoadingSlow: () => setSyncStatus("syncing"),
    }
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("contributor_" + token);
    if (stored) {
      setContributor(stored);
    } else {
      // First visit without going through join page — set a default
      const fallback = "Shopper";
      sessionStorage.setItem("contributor_" + token, fallback);
      setContributor(fallback);
    }
  }, [token]);

  if (sessError?.status === 404 || (sessError && !session)) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "var(--background)" }}
      >
        <p className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Session not found
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          This session link is invalid or has expired.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ background: "var(--brand)" }}
        >
          Start new session
        </button>
      </div>
    );
  }

  const activeItems = items?.filter((i) => i.state !== "deleted") ?? [];
  const collectedItems = activeItems.filter((i) => i.state === "collected");
  const addedItems = activeItems.filter((i) => i.state === "added");

  const predictedTotal = collectedItems.reduce(
    (sum, i) => sum + (i.price ?? 0),
    0
  );

  async function addItem(name: string, quantity: number) {
    setSyncStatus("syncing");
    const res = await fetch(`/api/sessions/${token}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, contributor_label: contributor }),
    });
    if (res.ok) {
      await mutate();
    }
    setSyncStatus("idle");
  }

  async function collectItem(item: Item, qty: number, price: number | null) {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: "collected",
        quantity: qty,
        price,
        contributor_label: contributor,
        client_edit_at: item.edit_at,
      }),
    });
    await mutate();
    setSyncStatus("idle");
  }

  async function uncollectItem(item: Item) {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "added", client_edit_at: item.edit_at }),
    });
    await mutate();
    setSyncStatus("idle");
  }

  async function deleteItem(item: Item) {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, { method: "DELETE" });
    await mutate();
    setSyncStatus("idle");
  }

  async function saveEdit(name: string, quantity: number) {
    if (!editTarget || editTarget === "new") return;
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, client_edit_at: editTarget.edit_at }),
    });
    setEditTarget(null);
    await mutate();
    setSyncStatus("idle");
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = addInput.trim();
    if (!name) return;
    setAddInput("");
    await addItem(name, 1);
  }

  return (
    <MobileGate>
      {/* noindex for private session */}
      <meta name="robots" content="noindex,nofollow" />

      <main
        className="min-h-dvh flex flex-col"
        style={{ background: "var(--background)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
          style={{
            background: "var(--background)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1
            className="text-base font-bold truncate max-w-[60%]"
            style={{ color: "var(--brand)" }}
          >
            {session?.title || "Shopping List"}
          </h1>

          <div className="flex items-center gap-2">
            {/* Sync status */}
            <span
              className="text-xs"
              role="status"
              aria-live="polite"
              style={{ color: syncStatus === "error" ? "#ef4444" : "var(--muted)" }}
            >
              {syncStatus === "syncing"
                ? "Syncing…"
                : syncStatus === "error"
                ? "Sync error"
                : ""}
            </span>

            {/* Invite */}
            <button
              onClick={() => setShowInvite(true)}
              aria-label="Invite collaborators"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: "var(--brand)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>

            {/* Receipt */}
            <button
              onClick={() => router.push(`/session/${token}/receipt`)}
              aria-label="View receipt"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: "var(--foreground)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14l6-6" />
                <polyline points="15 9 15 15 9 15" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </button>
          </div>
        </header>

        {/* Stats bar */}
        {activeItems.length > 0 && (
          <div className="flex gap-3 px-4 py-3">
            <div
              className="flex-1 rounded-2xl p-3"
              style={{ background: "var(--card)" }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Total Items Listed
              </p>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--foreground)" }}>
                {activeItems.length}
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl p-3"
              style={{ background: "var(--collected-bg)" }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--collected-text)" }}>
                Collected
              </p>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--collected-text)" }}>
                {collectedItems.length}
              </p>
              <p className="text-xs uppercase tracking-widest mt-2" style={{ color: "var(--collected-text)" }}>
                Total Price
              </p>
              <p className="text-base font-bold" style={{ color: "var(--collected-text)" }}>
                ${predictedTotal}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!items && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
          </div>
        )}

        {items && activeItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--card)" }}
            >
              <div
                className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: "var(--border)" }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--border)" }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
                No items yet.
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Start adding items together! Your session is active and ready for collaborative curation.
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {activeItems.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-32">
            {addedItems.length > 0 && (
              <section className="mb-4">
                <h2
                  className="text-sm font-semibold py-3 flex items-center justify-between"
                  style={{ color: "var(--brand)" }}
                >
                  <span>To Collect</span>
                  <span
                    className="text-xs rounded-full px-2 py-0.5"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                  >
                    {addedItems.length}
                  </span>
                </h2>
                {addedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onCollect={(i) => setCollectTarget(i)}
                    onUncollect={uncollectItem}
                    onDelete={deleteItem}
                    onEdit={(i) => setEditTarget(i)}
                  />
                ))}
              </section>
            )}

            {collectedItems.length > 0 && (
              <section className="mb-4">
                <h2
                  className="text-sm font-semibold py-3 flex items-center justify-between"
                  style={{ color: "var(--collected-text)" }}
                >
                  <span>Collected</span>
                  <span
                    className="text-xs rounded-full px-2 py-0.5"
                    style={{ background: "var(--collected-bg)", color: "var(--collected-text)" }}
                  >
                    {collectedItems.length}
                  </span>
                </h2>
                {collectedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onCollect={(i) => setCollectTarget(i)}
                    onUncollect={uncollectItem}
                    onDelete={deleteItem}
                    onEdit={(i) => setCollectTarget(i)}
                  />
                ))}
              </section>
            )}
          </div>
        )}

        {/* Bottom input bar */}
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-4"
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <form onSubmit={handleQuickAdd} className="flex-1 flex items-center gap-3">
            <input
              type="text"
              placeholder="Add new item to list..."
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              maxLength={200}
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: "var(--foreground)" }}
              aria-label="Quick add item"
            />
          </form>
          <button
            onClick={() => setEditTarget("new")}
            aria-label="Add item with details"
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow"
            style={{ background: "var(--brand)" }}
          >
            +
          </button>
        </div>
      </main>

      {/* Modals */}
      {collectTarget && (
        <CollectModal
          item={collectTarget}
          contributorLabel={contributor}
          onDone={(qty, price) => {
            collectItem(collectTarget, qty, price);
            setCollectTarget(null);
          }}
          onClose={() => setCollectTarget(null)}
        />
      )}

      {editTarget && (
        <EditItemModal
          item={editTarget === "new" ? null : editTarget}
          onDone={(name, qty) => {
            if (editTarget === "new") {
              addItem(name, qty);
            } else {
              saveEdit(name, qty);
            }
            setEditTarget(null);
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {showInvite && (
        <InviteModal sessionId={token} onClose={() => setShowInvite(false)} />
      )}
    </MobileGate>
  );
}
