"use client";

import Link from "next/link";
import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import { AddIcon } from "@/components/icons";

import NewListModal from "./components/NewListModal";
import MyListsSection from "./components/MyListsSection";
import QuickShopSection from "./components/QuickShopSection";

import { useHomeModule } from "./hooks";

export default function HomeModule() {
  const {
    myLists,
    navigateToList,
    deleteConfirmId,
    openDeleteConfirm,
    closeDeleteConfirm,
    deletingList,
    deleteListError,
    handleDeleteList,
    showNewListModal,
    newListName,
    setNewListName,
    creatingList,
    newListError,
    openNewListModal,
    closeNewListModal,
    handleCreateList,
    quickShopName,
    setQuickShopName,
    quickShopTitle,
    setQuickShopTitle,
    quickShopLoading,
    quickShopError,
    handleQuickShopSubmit,
  } = useHomeModule();

  return (
    <MobileGate>
      <main className="relative min-h-dvh flex flex-col">
        <div
          className="flex-1 flex flex-col px-6 pt-14 pb-28 gap-8"
          style={{ background: "var(--background)" }}
        >
          {/* Top bar */}
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

          <QuickShopSection
            name={quickShopName}
            setName={setQuickShopName}
            title={quickShopTitle}
            setTitle={setQuickShopTitle}
            loading={quickShopLoading}
            error={quickShopError}
            onSubmit={handleQuickShopSubmit}
          />

          {/* Starter Packs entry point */}
          <Link
            href="/app/starter-packs"
            className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition active:opacity-70"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl">🛍️</span>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                  Browse Starter Packs
                </p>
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  Ready-made lists for any occasion
                </p>
              </div>
            </div>
            <svg
              className="shrink-0"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M9 18L15 12L9 6" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span
              className="text-xs uppercase font-semibold tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              or
            </span>
            <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <MyListsSection
            myLists={myLists}
            onNavigateToList={navigateToList}
            onDeleteList={handleDeleteList}
            deleteConfirmId={deleteConfirmId}
            onOpenDeleteConfirm={openDeleteConfirm}
            onCloseDeleteConfirm={closeDeleteConfirm}
            deletingList={deletingList}
            deleteListError={deleteListError}
          />
        </div>

        {/* FAB — Add item */}
        <button
          aria-label="Add item"
          className="fixed bottom-6 right-6 size-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "var(--brand)" }}
          onClick={openNewListModal}
        >
          <AddIcon />
        </button>
      </main>

      {showNewListModal && (
        <NewListModal
          listName={newListName}
          setListName={setNewListName}
          creating={creatingList}
          error={newListError}
          onSubmit={handleCreateList}
          onClose={closeNewListModal}
        />
      )}
    </MobileGate>
  );
}
