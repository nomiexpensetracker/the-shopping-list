"use client";

import MobileGate from "@/components/MobileGate";
import ThemeToggle from "@/components/ThemeToggle";
import { AddIcon } from "@/components/icons";

import NewListModal from "./components/NewListModal";
import MyListsSection from "./components/MyListsSection";
import QuickShopSection from "./components/QuickShopSection";

import { useHomeModule } from "./hooks";
import Divider from "./components/Divider";
import StarterPackSection from "./components/StarterPackSection";
import CommonFooter from "@/components/CommonFooter";

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
    editListId,
    editListName,
    setEditListName,
    updatingList,
    editListError,
    openEditModal,
    closeEditModal,
    handleUpdateList,
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
          className="flex-1 flex flex-col px-6 pt-14 pb-28 gap-4"
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

          {/* Divider */}
          <Divider />

          {/* Starter Packs entry point */}
          <StarterPackSection />

          {/* Divider */}
          <Divider />

          <MyListsSection
            myLists={myLists}
            onNavigateToList={navigateToList}
            onDeleteList={handleDeleteList}
            deleteConfirmId={deleteConfirmId}
            onOpenDeleteConfirm={openDeleteConfirm}
            onCloseDeleteConfirm={closeDeleteConfirm}
            deletingList={deletingList}
            deleteListError={deleteListError}
            onEditList={openEditModal}
          />
        </div>

        {/* FAB — Add item */}
        <button
          aria-label="Add item"
          className="fixed bottom-6 right-6 z-40 size-14 rounded-full flex items-center justify-center shadow-lg"
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

      {editListId && (
        <NewListModal
          listName={editListName}
          setListName={setEditListName}
          creating={updatingList}
          error={editListError}
          onSubmit={handleUpdateList}
          onClose={closeEditModal}
          modalTitle="Edit List"
          submitLabel="Update List"
          savingLabel="Saving…"
        />
      )}
      <CommonFooter />
    </MobileGate>
  );
}
