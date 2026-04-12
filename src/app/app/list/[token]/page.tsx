"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavbar from "@/components/BottomNavbar";
import ListSettingsModal from "@/components/ListSettingsModal";
import { AddIcon } from "@/components/icons";
import { CommonResponse, GetListResponse, PostSessionResponse } from "@/types/dto";
import type { ListItem } from "@/types/dao";
import {
  addToListsRegistry,
  isListInRegistry,
  updateListInRegistry,
} from "@/lib/lists";

export default function ListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [list, setList] = useState<GetListResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Add item
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  // Edit item inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState(1);

  // Start Shopping modal
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopperName, setShopperName] = useState("");
  const [startingSession, setStartingSession] = useState(false);
  const [shopError, setShopError] = useState("");

  // Copy link
  const [copied, setCopied] = useState(false);

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

  // ── Rename list ──────────────────────────────────────────────────────────
  const handleSaveName = async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === list?.name) {
      setShowSettingsModal(false);
      return;
    }
    await fetch(`/api/lists/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setList((prev) => prev ? { ...prev, name: trimmed } : prev);
    updateListInRegistry(token, { name: trimmed, last_active: new Date().toISOString() });
    setShowSettingsModal(false);
  };

  // ── Add item ─────────────────────────────────────────────────────────────
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/lists/${token}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName.trim(), quantity: newItemQty }),
      });
      const data = await res.json() as CommonResponse<ListItem>;
      if (res.ok && data.success) {
        setList((prev) =>
          prev ? { ...prev, items: [...prev.items, data.data] } : prev
        );
        setNewItemName("");
        setNewItemQty(1);
        updateListInRegistry(token, { last_active: new Date().toISOString() });
      }
    } finally {
      setAddingItem(false);
    }
  };

  // ── Edit item ─────────────────────────────────────────────────────────────
  const startEditItem = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemQty(item.quantity);
  };

  const saveEditItem = async (itemId: string) => {
    const trimmed = editItemName.trim();
    if (!trimmed) return;
    await fetch(`/api/lists/${token}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, quantity: editItemQty }),
    });
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === itemId ? { ...i, name: trimmed, quantity: editItemQty } : i
            ),
          }
        : prev
    );
    setEditingItemId(null);
  };

  // ── Delete item ───────────────────────────────────────────────────────────
  const deleteItem = async (itemId: string) => {
    await fetch(`/api/lists/${token}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "deleted" }),
    });
    setList((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
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

  // ── Copy list link ────────────────────────────────────────────────────────
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const items = list?.items ?? [];

  return (
    <MobileGate>
      <div
        className="min-h-dvh flex flex-col"
        style={{ background: "var(--background)" }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 h-16"
          style={{ background: "var(--main-bg)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex flex-col min-w-0 flex-1 pr-3">
            <span
              className="text-lg font-extrabold truncate"
              style={{ color: "var(--brand)" }}
            >
              {list?.name}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: "var(--muted)" }}>
              My List
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: copied ? "var(--collected-bg)" : "var(--card)",
                color: copied ? "var(--collected-text)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
              aria-label="Copy list link"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* ── "Add to My Lists" banner ────────────────────────────────── */}
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

        <main className="flex-1 flex flex-col px-4 py-6 gap-6 pb-28">
          {/* ── Items list ──────────────────────────────────────────── */}
          {items.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16"
            >
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Nothing here yet.
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Add items below and hit Start Shopping when you&apos;re ready.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom:
                      idx < items.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {editingItemId === item.id ? (
                    <>
                      <input
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditItem(item.id);
                          if (e.key === "Escape") setEditingItemId(null);
                        }}
                        autoFocus
                        maxLength={200}
                        className="flex-1 bg-transparent border-b outline-none text-sm font-semibold"
                        style={{
                          color: "var(--foreground)",
                          borderColor: "var(--brand)",
                        }}
                        aria-label="Edit item name"
                      />
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={editItemQty}
                        onChange={(e) =>
                          setEditItemQty(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-12 text-center bg-transparent border-b outline-none text-sm font-semibold"
                        style={{
                          color: "var(--foreground)",
                          borderColor: "var(--brand)",
                        }}
                        aria-label="Edit item quantity"
                      />
                      <button
                        onClick={() => saveEditItem(item.id)}
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ color: "var(--brand)" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: "var(--muted)" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                        style={{
                          background: "var(--quantity-bg)",
                          color: "var(--foreground)",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <span
                        className="flex-1 text-sm font-semibold truncate"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.name}
                      </span>
                      <button
                        onClick={() => startEditItem(item)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: "var(--muted)" }}
                        aria-label={`Edit ${item.name}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: "#ef4444" }}
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Add item form ────────────────────────────────────────── */}
          <form onSubmit={addItem} className="flex flex-col gap-3">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Add Item
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name…"
                maxLength={200}
                className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="New item name"
              />
              <input
                type="number"
                value={newItemQty}
                min={1}
                max={999}
                onChange={(e) =>
                  setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 px-2 py-3 rounded-xl text-sm text-center focus:outline-none"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                aria-label="Item quantity"
              />
              <button
                type="submit"
                disabled={addingItem || !newItemName.trim()}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: "var(--brand)" }}
                aria-label="Add item"
              >
                <AddIcon />
              </button>
            </div>
          </form>
        </main>

        <BottomNavbar
          variant="list"
          onCart={() => setShowShopModal(true)}
          onSettings={() => setShowSettingsModal(true)}
        />
      </div>

      {/* ── List Settings modal ──────────────────────────────────────── */}
      {showSettingsModal && list && (
        <ListSettingsModal
          listName={list.name}
          onSave={handleSaveName}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* ── Start Shopping modal ─────────────────────────────────────── */}
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
