"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import useSWR from "swr";
import { use, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import type { Item, Summary, SyncDataType } from "@/types/dao";

import Header from "@/components/Header";
import ItemCard from "@/components/ItemCard";
import MobileGate from "@/components/MobileGate";
import InviteModal from "@/components/InviteModal";
import CollectModal from "@/components/CollectModal";
import EditItemModal from "@/components/EditItemModal";
import UpdateSessionModal from "@/components/UpdateSessionModal";
import ParticipantToast from "@/components/ParticipantToast";
import BottomNavbar from "@/components/BottomNavbar";
import EndSessionModal from "@/components/EndSessionModal";
import { CartIcon } from "@/components/icons";

import { formatRupiah } from "@/lib/utils";
import { CommonResponse, GetSessionDetailResponse, PostItemRequest } from "@/types/dto";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showUpdateModal = searchParams.get("with-template") === "true";

  const [collectTarget, setCollectTarget] = useState<Item | null>(null);
  const [editTarget, setEditTarget] = useState<Item | null | "new">(null);
  const [showInvite, setShowInvite] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncDataType>("idle");
  const [showEndModal, setShowEndModal] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  // fetch session details, including participants 
  const { data: session, error: sessError } = useSWR<CommonResponse<GetSessionDetailResponse>>(
    `/api/sessions/${token}`,
    fetcher,
    {
      refreshInterval: 30 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // fetch session summary with items total count, item collected count, item collected total price, and participants count
  const { data: summary, mutate: mutateSummary } = useSWR<CommonResponse<Summary>>(
    `/api/sessions/${token}/summary`,
    fetcher,
    {
      refreshInterval: 30 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: () => setSyncStatus("idle"),
      onError: () => setSyncStatus("error"),
      onLoadingSlow: () => setSyncStatus("syncing"),
    }
  );

  // fetch list all items
  const { data: items, mutate: mutateItems } = useSWR<CommonResponse<Item[]>>(
    `/api/sessions/${token}/items`,
    fetcher,
    {
      refreshInterval: 30 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: () => setSyncStatus("idle"),
      onError: () => setSyncStatus("error"),
      onLoadingSlow: () => setSyncStatus("syncing"),
    }
  );

  // filter current user out of the participants list to avoid showing their own join toast
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem(`participant_${token}_id`) : null
  const filteredParticipants = useMemo(() => {
    return session?.data.participants.filter(p => p.id !== currentUserId) ?? [];
  }, [session, currentUserId]);

  // define user role
  const isUserHost = useMemo(() => {
    if (!session || !currentUserId) return false;

    const currentUser = session.data.participants.find((participant) => participant.id === currentUserId)
    if (currentUser && currentUser.role === 'host') return true;
    return false;
  }, [session, currentUserId]);

  const refetchAll = () => {
    setSyncStatus("syncing");
    mutateItems();
    mutateSummary();
  }

  // handle start new session — only remove participant keys, not the lists registry
  const handleStartNewSession = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("participant_"))
      .forEach((k) => localStorage.removeItem(k));
    router.push("/app")
  }

  if (sessError || (session && !session.success)) {
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
          onClick={handleStartNewSession}
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
  const deletedItems = items?.data.filter((i) => i.state === "deleted") ?? [];
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
      refetchAll();
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
    refetchAll();
    setSyncStatus("idle");
  }

  const deleteItem = async (item: Item) => {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, { method: "DELETE" });
    refetchAll();
    setSyncStatus("idle");
  }

  const updateItem = async (item: Item) => {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: item.quantity, updated_at: item.updated_at, updated_by: currentUserId ?? '' }),
    });
    refetchAll();
    setSyncStatus("idle");
  }

  const restoreItem = async (item: Item) => {
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "active", updated_at: item.updated_at, updated_by: currentUserId ?? '' }),
    });
    refetchAll();
    setSyncStatus("idle");
  }

  const saveEdit = async (name: string, quantity: number, description: string | null) => {
    if (!editTarget || editTarget === "new") return;
    setSyncStatus("syncing");
    await fetch(`/api/sessions/${token}/items/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, description, updated_at: editTarget.updated_at, updated_by: currentUserId ?? '' }),
    });
    setEditTarget(null);
    refetchAll();
    setSyncStatus("idle");
  }

  const handleToggleInvitation = () => setShowInvite((prev) => !prev);

  const handleEndSession = async () => {
    setEndingSession(true);
    try {
      await fetch(`/api/sessions/${token}`, { method: "DELETE" });
    } finally {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("participant_"))
        .forEach((k) => localStorage.removeItem(k));
      router.push("/app");
    }
  };

  return (
    <MobileGate>
      {/* noindex for private session */}
      <meta name="robots" content="noindex,nofollow" />

      {/* Header */}
      {session && session.data && (
        <Header
          session={session.data}
          syncStatus={syncStatus}
        />
      )}

      <main
        className="min-h-dvh flex flex-col relative px-4 py-6 gap-6 pb-28"
        style={{
          background: "var(--background)",
        }}
      >
        {/* Stats bar */}
        {activeItems.length > 0 && (
          <div className="w-full grid grid-cols-[30%_67%] justify-between">
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
              className="flex-1 rounded-2xl p-4 flex flex-col gap-2 items-start justify-center"
              style={{ background: "var(--collected-bg)" }}
            >
              <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                Colected - <span style={{ color: "var(--collected-text)" }}>{summary?.data?.collected_items_count ?? collectedItems.length}</span>
              </p>
              <div className="flex flex-col items-start justify-center">
                <p className="text-sm uppercase font-bold tracking-widest" style={{ color: "var(--muted)" }}>
                  Total Price
                </p>
                <p className="text-2xl uppercase font-extrabold tracking-widest" style={{ color: "var(--collected-text)" }}>
                  {formatRupiah(parseInt(summary?.data?.collected_items_total_price ?? String(predictedTotal)))}
                </p>
              </div>
            </div>
          </div>
        )}

        {items && activeItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--card)" }}
            >
              <Image src="/empty-shopping-cart.png" alt="No items" width={225} height={225} />
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

        {/* Participant Toast */}
        {session?.data && filteredParticipants.length > 0 && (
          <div className="w-full">
            <ParticipantToast participants={filteredParticipants} />
          </div>
        )}

        {/* List */}
        {activeItems.length > 0 && (
          <div className="flex flex-col flex-1 gap-4 overflow-y-auto">
            {addedItems.length > 0 && (
              <ItemCard
                title="To Collect"
                items={addedItems}
                participants={session?.data.participants || []}
                onEdit={updateItem}
                onDelete={deleteItem}
                onCollect={(i) => setCollectTarget(i)}
              />
            )}

            {collectedItems.length > 0 && (
              <ItemCard
                title="Collected"
                items={collectedItems}
                participants={session?.data.participants || []}
              />
            )}

            {deletedItems.length > 0 && (
              <ItemCard
                title="Deleted"
                items={deletedItems}
                defaultExpanded={false}
                participants={session?.data.participants || []}
                onRestore={restoreItem}
              />
            )}
          </div>
        )}

        {/* Floating Action Button — receipt */}
        {isUserHost && collectedItems.length > 0 && (
          <button
            id="fab-cart-action-button"
            aria-label="Add item with details"
            className="fixed bottom-24 right-6 size-14 rounded-full flex items-center justify-center text-2xl font-bold shadow"
            style={{ background: "var(--brand-light)" }}
            onClick={() => router.push(`/app/session/${token}/receipt`)}
          >
            <CartIcon fill="var(--brand-dark)" />
          </button>
        )}
      </main>

      <BottomNavbar
        variant="session"
        onShare={() => setShowInvite(true)}
        onAdd={() => setEditTarget("new")}
        onEnd={() => setShowEndModal(true)}
      />

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
        <InviteModal sessionId={token} onClose={handleToggleInvitation} />
      )}

      {showUpdateModal && session?.data && (
        <UpdateSessionModal
          token={token}
          initialTitle={session.data.title}
          initialName={localStorage.getItem(`participant_${token}_name`) ?? "Shopper"}
          onDone={() => {
            router.replace(pathname, { scroll: false });
            mutateItems();
            mutateSummary();
          }}
          onClose={() => router.replace(pathname, { scroll: false })}
        />
      )}

      {showEndModal && (
        <EndSessionModal
          onConfirm={handleEndSession}
          onClose={() => setShowEndModal(false)}
          loading={endingSession}
        />
      )}
    </MobileGate>
  );
}
