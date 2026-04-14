"use client";

import { useState, useRef, useEffect } from "react";
import type { ListRegistryEntry } from "@/types/dto";
import { TrashIcon } from "@/components/icons";

interface MyListsSectionProps {
  myLists: ListRegistryEntry[];
  onNavigateToList: (id: string) => void;
  onDeleteList: (id: string) => void;
  deleteConfirmId: string | null;
  onOpenDeleteConfirm: (id: string) => void;
  onCloseDeleteConfirm: () => void;
  deletingList: boolean;
  deleteListError: string;
}

function DotsMenuIcon({ fill = "currentColor" }: { fill?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" fill={fill} />
      <circle cx="12" cy="12" r="1.5" fill={fill} />
      <circle cx="12" cy="19" r="1.5" fill={fill} />
    </svg>
  );
}

function ListRowMenu({
  listId,
  onDelete,
}: {
  listId: string;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex items-center">
      <button
        aria-label="List options"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center justify-center size-8 rounded-full transition active:opacity-60"
        style={{ color: "var(--muted)" }}
      >
        <DotsMenuIcon fill="var(--muted)" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 min-w-35 rounded-xl py-1 shadow-lg"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(listId);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-left transition active:opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            <TrashIcon fill="var(--foreground)" />
            Delete list
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyListsSection({
  myLists,
  onNavigateToList,
  onDeleteList,
  deleteConfirmId,
  onOpenDeleteConfirm,
  onCloseDeleteConfirm,
  deletingList,
  deleteListError,
}: MyListsSectionProps) {
  const confirmName = myLists.find((l) => l.id === deleteConfirmId)?.name ?? "this list";

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            My Lists
          </p>
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
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {myLists.map((list, idx) => (
              <div
                key={list.id}
                className="w-full flex items-center justify-between px-4 py-4"
                style={{
                  background: "var(--card)",
                  borderBottom: idx < myLists.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <button
                  onClick={() => onNavigateToList(list.id)}
                  className="flex-1 text-left min-w-0 mr-2"
                >
                  <span
                    className="font-semibold text-base truncate block"
                    style={{ color: "var(--foreground)" }}
                  >
                    {list.name}
                  </span>
                </button>
                <ListRowMenu listId={list.id} onDelete={onOpenDeleteConfirm} />
              </div>
            ))}
          </div>
        )}
      </section>

      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Delete list"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={deletingList ? undefined : onCloseDeleteConfirm} />

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
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Delete List?
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{confirmName}&rdquo;</span> will be permanently deleted. This cannot be undone.
              </p>
              {deleteListError && (
                <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                  {deleteListError}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCloseDeleteConfirm}
                disabled={deletingList}
                className="flex-1 py-4 rounded-xl font-semibold text-base disabled:opacity-50"
                style={{ background: "var(--background)", color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onDeleteList(deleteConfirmId)}
                disabled={deletingList}
                className="flex-1 py-4 rounded-xl text-white font-bold text-base disabled:opacity-50"
                style={{ background: "#ef4444" }}
              >
                {deletingList ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
