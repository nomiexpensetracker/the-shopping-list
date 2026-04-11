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

  // Auto-resume any in-progress session — validate it still exists first
  useEffect(() => {
    const sessionId = findActiveSessionId();
    if (!sessionId) return;

    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          router.push("/app/session/" + sessionId);
        } else {
          // Session no longer exists — clean up stale localStorage keys
          Object.keys(localStorage)
            .filter((k) => k.startsWith(`participant_${sessionId}_`))
            .forEach((k) => localStorage.removeItem(k));
        }
      })
      .catch(() => {
        // Network error — don't redirect, let the user act manually
      });
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
      router.push("/app/session/" + sessionData.id);
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
      router.push(`/app/list/${id}`);
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
    navigateToList: (id: string) => router.push(`/app/list/${id}`),

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
