"use client";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";

import { useHomeModule } from "./hooks";
import MyListsSection from "./components/MyListsSection";
import QuickShopSection from "./components/QuickShopSection";
import NewListModal from "./components/NewListModal";

export default function HomeModule() {
  const {
    myLists,
    navigateToList,
    showNewListModal,
    newListName,
    setNewListName,
    creatingList,
    newListError,
    openNewListModal,
    closeNewListModal,
    handleCreateList,
    showQuickShop,
    toggleQuickShop,
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
          className="flex-1 flex flex-col px-6 pt-14 pb-10 gap-8"
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

          <MyListsSection
            myLists={myLists}
            onNavigateToList={navigateToList}
            onOpenNewListModal={openNewListModal}
          />

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

          <QuickShopSection
            showQuickShop={showQuickShop}
            onToggle={toggleQuickShop}
            name={quickShopName}
            setName={setQuickShopName}
            title={quickShopTitle}
            setTitle={setQuickShopTitle}
            loading={quickShopLoading}
            error={quickShopError}
            onSubmit={handleQuickShopSubmit}
          />
        </div>
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
