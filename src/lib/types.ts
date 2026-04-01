/** Shared domain types used across client and server. */

export type ItemState = "added" | "collected" | "deleted";

export interface Item {
  id: string;
  session_id: string;
  name: string;
  quantity: number;
  state: ItemState;
  price: number | null;
  contributor_label: string | null;
  edit_at: string; // ISO timestamp
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  last_active: string;
}

/** Valid next states from a given current state. */
export const VALID_TRANSITIONS: Record<ItemState, ItemState[]> = {
  added: ["collected", "deleted"],
  collected: ["added", "deleted"],
  deleted: [], // terminal
};
