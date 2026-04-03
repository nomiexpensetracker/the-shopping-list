/** Shared domain types used across client and server. */

export type ItemState = "active" | "collected" | "deleted" | "restored";
export type ActivityType = "created" | "updated" | "deleted" | "restored" | "collected";

export interface Item {
  id: string;
  session_id: string;
  name: string;
  quantity: number;
  state: ItemState;
  price: number | null;
  description: string | null;
  deleted_at: string | null;
  updated_at: string;
  updated_by: string | null;
  collected_at: string | null;
  collected_by: string | null;
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  last_active: string;
}

/** Valid next states from a given current state. */
export const VALID_TRANSITIONS: Record<ItemState, ItemState[]> = {
  active: ["collected", "deleted", "restored"],
  collected: ["active", "deleted", "restored"],
  deleted: [], // terminal
  restored: ["active", "collected", "deleted"],
};
