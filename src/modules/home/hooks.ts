"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getListsRegistry, addToListsRegistry } from "@/lib/lists";
import { useMyListsState, useNewListModalState, useQuickShopState } from "./state";
import { validateQuickShopForm, validateListName, findActiveSessionId, storeParticipantLocally } from "./logic";
import { apiCreateSession, apiCreateList } from "./api";

export function useHomeModule() {
  const router = useRouter();

  const myListsState = useMyListsState();
  const newListModal = useNewListModalState();
  const quickShop = useQuickShopState();

  // Load lists from localStorage on mount
  useEffect(() => {
    myListsState.setMyLists(getListsRegistry());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resume any in-progress session
  useEffect(() => {
    const sessionId = findActiveSessionId();
    if (sessionId) router.push("/session/" + sessionId);
  }, [router]);

  async function handleQuickShopSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateQuickShopForm({ name: quickShop.name, title: quickShop.title });
    if (validationError) {
      quickShop.setError(validationError);
      return;
    }

    quickShop.setLoading(true);
    quickShop.setError("");

    try {
      const sessionData = await apiCreateSession(quickShop.name.trim(), quickShop.title.trim());
      storeParticipantLocally(
        sessionData.id,
        quickShop.name.trim(),
        sessionData.participant.id,
        sessionData.participant.color
      );
      router.push("/session/" + sessionData.id);
    } catch (err) {
      quickShop.setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      quickShop.setLoading(false);
    }
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateListName({ name: newListModal.newListName });
    if (validationError) {
      newListModal.setNewListError(validationError);
      return;
    }

    newListModal.setCreatingList(true);
    newListModal.setNewListError("");

    try {
      const { id, name, created_at } = await apiCreateList(newListModal.newListName.trim());
      addToListsRegistry({ id, name, last_active: created_at });
      router.push(`/list/${id}`);
    } catch (err) {
      newListModal.setNewListError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      newListModal.setCreatingList(false);
    }
  }

  function openNewListModal() {
    newListModal.setShowNewListModal(true);
    newListModal.setNewListName("");
    newListModal.setNewListError("");
  }

  return {
    // My Lists
    myLists: myListsState.myLists,
    navigateToList: (id: string) => router.push(`/list/${id}`),

    // New List Modal
    showNewListModal: newListModal.showNewListModal,
    newListName: newListModal.newListName,
    setNewListName: newListModal.setNewListName,
    creatingList: newListModal.creatingList,
    newListError: newListModal.newListError,
    openNewListModal,
    closeNewListModal: () => newListModal.setShowNewListModal(false),
    handleCreateList,

    // Quick Shop
    showQuickShop: quickShop.showQuickShop,
    toggleQuickShop: () => quickShop.setShowQuickShop((v) => !v),
    quickShopName: quickShop.name,
    setQuickShopName: quickShop.setName,
    quickShopTitle: quickShop.title,
    setQuickShopTitle: quickShop.setTitle,
    quickShopLoading: quickShop.loading,
    quickShopError: quickShop.error,
    handleQuickShopSubmit,
  };
}
