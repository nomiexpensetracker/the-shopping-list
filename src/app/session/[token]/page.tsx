"use client";

import Image from "next/image";
import useSWR from "swr";
import { use, useState } from "react";
import { useRouter } from "next/navigation";

import type { Item, Session, Summary } from "@/types/dao";

import ItemCard from "@/components/ItemCard";
import MobileGate from "@/components/MobileGate";
import InviteModal from "@/components/InviteModal";
import CollectModal from "@/components/CollectModal";
import EditItemModal from "@/components/EditItemModal";
import { CommonResponse, PostItemRequest } from "@/types/dto";
import { formatRupiah } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [collectTarget, setCollectTarget] = useState<Item | null>(null);
  const [editTarget, setEditTarget] = useState<Item | null | "new">(null);
  const [showInvite, setShowInvite] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");

  const { data: session, error: sessError } = useSWR<Session>(
    `/api/sessions/${token}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: summary, mutate: mutateSummary } = useSWR<CommonResponse<Summary>>(
    `/api/sessions/${token}/summary`,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000, // auto-refresh every 30 mins
      onSuccess: () => setSyncStatus("idle"),
      onError: () => setSyncStatus("error"),
      onLoadingSlow: () => setSyncStatus("syncing"),
    }
  );

  const { data: items, mutate: mutateItems } = useSWR<CommonResponse<Item[]>>(
    `/api/sessions/${token}/items`,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000, // auto-refresh every 30 mins
      onSuccess: () => setSyncStatus("idle"),
      onError: () => setSyncStatus("error"),
      onLoadingSlow: () => setSyncStatus("syncing"),
    }
  );

  const refetchAll = () => {
    setSyncStatus("syncing");
    mutateItems();
    mutateSummary();
  }

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

  const activeItems = items?.data.filter((i) => i.state !== "deleted") ?? [];
  const addedItems = activeItems.filter((i) => i.state === "active");
  const collectedItems = activeItems.filter((i) => i.state === "collected");

  const predictedTotal = collectedItems.reduce(
    (sum, i) => sum + (i.price ?? 0),
    0
  );

  const addItem = async (name: string, quantity: number, description: string | null) => {
    setSyncStatus("syncing");
    const participantId = localStorage.getItem(`participant_${token}_id`) ?? '';
    const payload: PostItemRequest = { name, quantity, description, created_by: participantId };

    const res = await fetch(`/api/sessions/${token}/items`, {
      body: JSON.stringify(payload),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      await refetchAll();
    }
    setSyncStatus("idle");
  }

  const collectItem = async (item: Item, qty: number, price: number | null) => {
    setSyncStatus("syncing");
    const participantId = localStorage.getItem(`participant_${token}_id`) ?? '';
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: "collected",
        quantity: qty,
        price,
        collected_by: participantId,
      }),
    });
    await refetchAll();
    setSyncStatus("idle");
  }

  const uncollectItem = async (item: Item) => {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "created", updated_at: item.updated_at }),
    });
    await refetchAll();
    setSyncStatus("idle");
  }

  const deleteItem = async (item: Item) => {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, { method: "DELETE" });
    await refetchAll();
    setSyncStatus("idle");
  }

  const saveEdit = async (name: string, quantity: number, description: string | null) => {
    if (!editTarget || editTarget === "new") return;
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, description, updated_at: editTarget.updated_at }),
    });
    setEditTarget(null);
    await refetchAll();
    setSyncStatus("idle");
  }

  return (
    <MobileGate>
      {/* noindex for private session */}
      <meta name="robots" content="noindex,nofollow" />

      {/* Header */}
      <header
        className="sticky top-0 z-10 h-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--main-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1
          className="text-xl font-extrabold truncate max-w-[60%]"
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
            <Image src="/icons/share.svg" alt="Invite" width={24} height={24} />
          </button>

          {/* Receipt */}
          <button
            onClick={() => router.push(`/session/${token}/receipt`)}
            aria-label="View receipt"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: "var(--brand)" }}
          >
            <Image src="/icons/log-out.svg" alt="end-session" width={24} height={24} />
          </button>
        </div>
      </header>

      <main
        className="min-h-dvh flex flex-col relative px-4 py-6"
        style={{ background: "var(--background)" }}
      >
        {/* Stats bar */}
        {activeItems.length > 0 && (
          <div className="w-full grid grid-cols-[30%_67%] justify-between" style={{ background: "var(--main-bg)" }}>
            <div
              className="flex-1 rounded-2xl p-4 flex flex-col items-start justify-center"
              style={{ background: "var(--card)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Total Items Listed
              </p>
              <p className="text-4xl uppercase font-extrabold tracking-widest" style={{ color: "var(--collected-text)" }}>
                {summary?.data?.total_items_count ?? activeItems.length}
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl p-4 flex flex-col items-start justify-center"
              style={{ background: "var(--collected-bg)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Colected - <span style={{ color: "var(--collected-text)" }}>{summary?.data?.collected_items_count ?? collectedItems.length}</span>
              </p>
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Total Price
              </p>
              <p className="text-2xl uppercase font-extrabold tracking-widest" style={{ color: "var(--collected-text)" }}>
                {formatRupiah(parseInt(summary?.data?.collected_items_total_price ?? String(predictedTotal)))}
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
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
                No items yet.
              </p>
              <p className="text-base" style={{ color: "var(--muted)" }}>
                Start adding items together! Your session is active and ready for collaborative curation.
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {activeItems.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-32" style={{ background: "var(--main-bg)" }}>
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
        <button
          id="fab-floating-action-button"
          onClick={() => setEditTarget("new")}
          aria-label="Add item with details"
          className="fixed bottom-6 right-6 size-14 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow"
          style={{ background: "var(--brand)" }}
        >
          <Image src="/icons/add-plus.svg" alt="Add item" width={24} height={24} />
        </button>
      </main>

      {/* Modals */}
      {collectTarget && (
        <CollectModal
          item={collectTarget}
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
          onDone={(name, qty, description) => {
            if (editTarget === "new") {
              addItem(name, qty, description);
            } else {
              saveEdit(name, qty, description);
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
