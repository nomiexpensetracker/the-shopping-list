import type { ListRegistryEntry } from "@/types/dto";

const REGISTRY_KEY = "lists_registry";

export function getListsRegistry(): ListRegistryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ListRegistryEntry[];
  } catch {
    return [];
  }
}

export function addToListsRegistry(entry: ListRegistryEntry): void {
  if (typeof window === "undefined") return;
  const existing = getListsRegistry().filter((e) => e.id !== entry.id);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify([entry, ...existing]));
}

export function updateListInRegistry(id: string, updates: Partial<ListRegistryEntry>): void {
  if (typeof window === "undefined") return;
  const registry = getListsRegistry().map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

export function removeFromListsRegistry(id: string): void {
  if (typeof window === "undefined") return;
  const updated = getListsRegistry().filter((e) => e.id !== id);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated));
}

export function isListInRegistry(id: string): boolean {
  return getListsRegistry().some((e) => e.id === id);
}
