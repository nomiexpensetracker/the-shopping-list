"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import ItemCard from "@/components/ItemCard";
import EditItemModal from "@/components/EditItemModal";
import { AddIcon } from "@/components/icons";
import { CommonResponse, GetListResponse, PostSessionResponse } from "@/types/dto";
import type { Item, ListItem } from "@/types/dao";
import {
  addToListsRegistry,
  isListInRegistry,
  updateListInRegistry,
} from "@/lib/lists";

// Adapt a ListItem to the Item shape expected by ItemCard
function toItem(li: ListItem): Item {
  return {
    id: li.id,
    session_id: "",
    name: li.name,
    description: null,
    quantity: li.quantity,
    state: "active",
    price: 0,
    created_by: "",
    updated_by: "",
    collected_by: "",
    created_at: li.created_at,
    updated_at: li.updated_at,
    collected_at: "",
    deleted_at: "",
  };
}

export default function ListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [list, setList] = useState<GetListResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Add item modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Start Shopping modal
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopperName, setShopperName] = useState("");
  const [startingSession, setStartingSession] = useState(false);
  const [shopError, setShopError] = useState("");

  // "Add to My Lists" banner — shown on devices that don't have this list in localStorage
  const [showSaveBanner, setShowSaveBanner] = useState(false);

  // ── Load list ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/lists/${token}`);
        const data = await res.json() as CommonResponse<GetListResponse>;
        if (!res.ok || !data.success) {
          setErrorMsg(data.error ?? "List not found.");
          setStatus("error");
          return;
        }
        setList(data.data);
        setStatus("ready");

        // Show "Add to My Lists" banner if not in registry
        if (!isListInRegistry(token)) {
          setShowSaveBanner(true);
        }
      } catch {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      }
    }
    load();
  }, [token]);

  // ── Add item (from EditItemModal) ─────────────────────────────────────────
  const handleAddItem = async (name: string, quantity: number, description: string | null) => {
    const res = await fetch(`/api/lists/${token}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, description }),
    });
    const data = await res.json() as CommonResponse<ListItem>;
    if (res.ok && data.success) {
      setList((prev) =>
        prev ? { ...prev, items: [...prev.items, data.data] } : prev
      );
      updateListInRegistry(token, { last_active: new Date().toISOString() });
    }
    setShowAddModal(false);
  };

  // ── Edit quantity (from ItemCard +/- buttons) ────────────────────────────
  const handleEditQuantity = async (item: Item) => {
    await fetch(`/api/lists/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: item.quantity }),
    });
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id ? { ...i, quantity: item.quantity } : i
            ),
          }
        : prev
    );
  };

  // ── Delete item ───────────────────────────────────────────────────────────
  const handleDeleteItem = async (item: Item) => {
    await fetch(`/api/lists/${token}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "deleted" }),
    });
    setList((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : prev
    );
  };

  // ── Start Shopping ────────────────────────────────────────────────────────
  const handleStartShopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopperName.trim()) {
      setShopError("Name is required.");
      return;
    }
    setStartingSession(true);
    setShopError("");
    try {
      const res = await fetch(`/api/lists/${token}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: shopperName.trim() }),
      });
      const data = await res.json() as CommonResponse<PostSessionResponse>;
      if (!res.ok || !data.success) {
        setShopError(data.error ?? "Failed to start session. Please try again.");
        setStartingSession(false);
        return;
      }
      const { id: sessionId, participant } = data.data;
      localStorage.setItem(`participant_${sessionId}_id`, participant.id);
      localStorage.setItem(`participant_${sessionId}_name`, participant.name);
      localStorage.setItem(`participant_${sessionId}_color`, participant.color);
      router.push(`/app/session/${sessionId}`);
    } catch {
      setShopError("Something went wrong. Please try again.");
      setStartingSession(false);
    }
  };

  // ── Add to My Lists ───────────────────────────────────────────────────────
  const saveToMyLists = () => {
    if (!list) return;
    addToListsRegistry({ id: token, name: list.name, last_active: list.last_active });
    setShowSaveBanner(false);
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <MobileGate>
        <main
          className="min-h-dvh flex items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          <span
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
            aria-hidden="true"
          />
        </main>
      </MobileGate>
    );
  }

  if (status === "error") {
    return (
      <MobileGate>
        <main
          className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4"
          style={{ background: "var(--background)" }}
        >
          <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            List not found
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {errorMsg}
          </p>
          <button
            onClick={() => router.push("/app")}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: "var(--brand)" }}
          >
            Go home
          </button>
        </main>
      </MobileGate>
    );
  }

  const activeItems = list?.items.filter((i) => i.state !== "deleted") ?? [];

  return (
    <MobileGate>
      <meta name="robots" content="noindex,nofollow" />

      {/* Header */}
      <header
        className="sticky top-0 z-10 h-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--main-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/app" className="max-w-[60%] flex flex-col">
          <h1
            className="text-xl font-extrabold truncate"
            style={{ color: "var(--brand)" }}
          >
            {list?.name}
          </h1>
          <span
            className="text-[10px] uppercase font-semibold tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            My List
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* "Add to My Lists" banner */}
      {showSaveBanner && (
        <div
          className="flex items-center justify-between px-4 py-3 gap-3"
          style={{ background: "var(--brand-light)", borderBottom: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
            Save this list to your device?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={saveToMyLists}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "var(--brand)" }}
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveBanner(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ color: "var(--muted)" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main
        className="min-h-dvh flex flex-col relative px-4 py-6 gap-6 pb-24"
        style={{ background: "var(--background)" }}
      >
        {/* Empty state */}
        {list && activeItems.length === 0 && (
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
                Add items to your list! Tap the + button to get started.
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        {activeItems.length > 0 && (
          <div className="flex flex-col flex-1 gap-4 overflow-y-auto">
            <ItemCard
              title="Items"
              items={activeItems.map(toItem)}
              participants={[]}
              onEdit={handleEditQuantity}
              onDelete={handleDeleteItem}
            />
          </div>
        )}
      </main>

      {/* FAB — Add item */}
      <button
        aria-label="Add item"
        className="fixed bottom-6 right-6 size-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "var(--brand)" }}
        onClick={() => setShowAddModal(true)}
      >
        <AddIcon />
      </button>

      {/* Start Shopping FAB */}
      {activeItems.length > 0 && (
        <button
          className="fixed bottom-6 left-6 px-5 py-4 rounded-full font-bold text-sm shadow-lg"
          style={{ background: "var(--brand-light)", color: "var(--brand-dark)" }}
          onClick={() => setShowShopModal(true)}
        >
          Start Shopping
        </button>
      )}

      {/* Add item modal */}
      {showAddModal && (
        <EditItemModal
          item={null}
          onDone={handleAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Start Shopping modal */}
      {showShopModal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowShopModal(false);
              setShopperName("");
              setShopError("");
            }
          }}
        >
          <div
            className="w-full rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-4"
            style={{ background: "var(--card)" }}
          >
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--foreground)" }}
            >
              What&apos;s your name?
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This helps your teammates know who picked up each item.
            </p>
            <form onSubmit={handleStartShopping} className="flex flex-col gap-3">
              <input
                type="text"
                value={shopperName}
                onChange={(e) => setShopperName(e.target.value)}
                placeholder="e.g. Maya, Mom, John"
                maxLength={26}
                autoFocus
                className="w-full px-4 py-4 rounded-xl text-base focus:outline-none"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Your name"
              />
              {shopError && (
                <p role="alert" className="text-red-500 text-sm">
                  {shopError}
                </p>
              )}
              <button
                type="submit"
                disabled={startingSession}
                className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
                style={{ background: "var(--brand)" }}
              >
                {startingSession ? "Starting session…" : "Let's go!"}
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileGate>
  );
}
