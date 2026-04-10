"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import { CommonResponse, PostSessionResponse, PostListResponse, ListRegistryEntry } from "@/types/dto";
import { addToListsRegistry, getListsRegistry } from "@/lib/lists";

export default function HomePage() {
  const router = useRouter();

  // ── My Lists state ────────────────────────────────────────────────────────
  const [myLists, setMyLists] = useState<ListRegistryEntry[]>([]);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [newListError, setNewListError] = useState("");

  // ── Quick Shop state ──────────────────────────────────────────────────────
  const [showQuickShop, setShowQuickShop] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Trim inputs and validate on client-side before sending to server
      if (!title.trim()) {
        setError("Session title is required");
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      const payload = JSON.stringify({
        name: name.trim(),
        title: title.trim(),
      });

      const res = await fetch("/api/sessions", {
        body: payload,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json() as CommonResponse<PostSessionResponse>;
      if (data.success) {
        const sessionData = data.data;
        // store data in localStorage for later use in session page
        localStorage.setItem(`participant_${sessionData.id}_name`, name.trim());
        localStorage.setItem(`participant_${sessionData.id}_id`, sessionData.participant.id);
        localStorage.setItem(`participant_${sessionData.id}_color`, sessionData.participant.color);

        // navigate to session page
        router.push("/session/" + sessionData.id);
      } else {
        setError("Oops something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // check if there's an active session for this user and redirect to it
  // ── Load My Lists from localStorage ──────────────────────────────────────
  useEffect(() => {
    setMyLists(getListsRegistry());
  }, []);

  // ── Auto-resume in-progress session ──────────────────────────────────────
  useEffect(() => {
    const keys = Object.keys(localStorage);
    const sessionKey = keys.find((key) => key.startsWith("participant_") && key.endsWith("_id"));
    if (sessionKey) {
      const sessionId = sessionKey.split("_")[1];
      router.push("/session/" + sessionId);
    }
  }, [router]);

  // ── Create new list ───────────────────────────────────────────────────────
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setNewListError("List name is required.");
      return;
    }
    setCreatingList(true);
    setNewListError("");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      const data = await res.json() as CommonResponse<PostListResponse>;
      if (!res.ok || !data.success) {
        setNewListError(data.error ?? "Failed to create list. Please try again.");
        setCreatingList(false);
        return;
      }
      const { id, name: listName, created_at } = data.data;
      addToListsRegistry({ id, name: listName, last_active: created_at });
      router.push(`/list/${id}`);
    } catch {
      setNewListError("Something went wrong. Please try again.");
      setCreatingList(false);
    }
  };

  return (
    <MobileGate>
      <main className="relative min-h-dvh flex flex-col">
        <div
          className="flex-1 flex flex-col px-6 pt-14 pb-10 gap-8"
          style={{ background: "var(--background)" }}
        >
          {/* ── Top bar ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-4xl font-black leading-tight tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                The Shopping
              </h1>
              <h1
                className="text-4xl font-black leading-tight tracking-tight"
                style={{ color: "var(--brand)" }}
              >
                List.
              </h1>
            </div>
            <ThemeToggle />
          </div>

          {/* ── My Lists section ─────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                My Lists
              </p>
              <button
                onClick={() => {
                  setShowNewListModal(true);
                  setNewListName("");
                  setNewListError("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                + New List
              </button>
            </div>

            {myLists.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-8 text-center flex flex-col items-center gap-2"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  No lists yet.
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Create a list to plan your shopping trips and reuse it every time.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {myLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => router.push(`/list/${list.id}`)}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <span className="font-semibold text-base truncate" style={{ color: "var(--foreground)" }}>
                      {list.name}
                    </span>
                    <span className="text-lg shrink-0 ml-2" style={{ color: "var(--brand)" }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs uppercase font-semibold tracking-widest" style={{ color: "var(--muted)" }}>or</span>
            <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* ── Quick Shop section ───────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <button
              onClick={() => setShowQuickShop((v) => !v)}
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
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-widest block" style={{ color: "var(--muted)" }}>
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
                    <label className="text-xs font-semibold uppercase tracking-widest block" style={{ color: "var(--muted)" }}>
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
                    {loading
                      ? "Creating your session…"
                      : <span className="flex gap-2">Shop List Now <Image src="/icons/arrow.svg" alt="Arrow" width={16} height={16} /></span>
                    }
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── New List modal ────────────────────────────────────────────── */}
      {showNewListModal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewListModal(false);
            }
          }}
        >
          <div
            className="w-full rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-4"
            style={{ background: "var(--card)" }}
          >
            <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>
              New List
            </h2>
            <form onSubmit={handleCreateList} className="flex flex-col gap-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
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
              {newListError && (
                <p role="alert" className="text-red-500 text-sm">{newListError}</p>
              )}
              <button
                type="submit"
                disabled={creatingList}
                className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
                style={{ background: "var(--brand)" }}
              >
                {creatingList ? "Creating…" : "Create List"}
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileGate>
  );
}
