export type ItemState = "active" | "deleted" | "restored" | "collected" ;
export type ActivityType = "created" | "updated" | "deleted" | "restored" | "collected";
export type ParticipantRole = "host" | "member";

export interface Item {
  id: string;
  session_id: string;
  name: string;
  description: string | null;
  quantity: number;
  state: ItemState;
  price: number;
  created_by: string;
  updated_by: string;
  collected_by: string;
  created_at: string;
  updated_at: string;
  collected_at: string;
  deleted_at: string;
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  last_active: string;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole
  color: string;
  joined_at: string;
  updated_at: string;
  session_id: string;
}

export interface Activity {
  id: string;
  item_id: string | null;
  participant_id: string | null;
  session_id: string;
  type: ActivityType;
  description: string | null;
  created_at: string;
}

export interface Summary {
  session_id: string;
  session_name: string;
  session_date: string;
  session_time: string;
  total_items_count: string;
  collected_items_count: string;
  collected_items_total_price: string;
  participants_count: string;
}

/** Valid next states from a given current state. */
export const VALID_TRANSITIONS: Record<ItemState, ItemState[]> = {
  active: ["collected", "deleted", "restored"],
  collected: ["active", "deleted", "restored"],
  deleted: [], // terminal
  restored: ["active", "collected", "deleted"],
};
