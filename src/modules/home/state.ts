import { useState } from "react";
import type { ListRegistryEntry } from "@/types/dto";

export function useMyListsState() {
  const [myLists, setMyLists] = useState<ListRegistryEntry[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingList, setDeletingList] = useState(false);
  const [deleteListError, setDeleteListError] = useState("");
  return { myLists, setMyLists, deleteConfirmId, setDeleteConfirmId, deletingList, setDeletingList, deleteListError, setDeleteListError };
}

export function useNewListModalState() {
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [newListError, setNewListError] = useState("");
  return {
    showNewListModal, setShowNewListModal,
    newListName, setNewListName,
    creatingList, setCreatingList,
    newListError, setNewListError,
  };
}

export function useEditListModalState() {
  const [editListId, setEditListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [updatingList, setUpdatingList] = useState(false);
  const [editListError, setEditListError] = useState("");
  return { editListId, setEditListId, editListName, setEditListName, updatingList, setUpdatingList, editListError, setEditListError };
}

export function useQuickShopState() {
  const [showQuickShop, setShowQuickShop] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return {
    showQuickShop, setShowQuickShop,
    name, setName,
    title, setTitle,
    loading, setLoading,
    error, setError,
  };
}
