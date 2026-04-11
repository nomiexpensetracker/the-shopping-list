import { useState } from "react";
import type { ListRegistryEntry } from "@/types/dto";

export function useMyListsState() {
  const [myLists, setMyLists] = useState<ListRegistryEntry[]>([]);
  return { myLists, setMyLists };
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
