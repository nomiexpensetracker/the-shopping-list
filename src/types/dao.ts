export type ItemState = "active" | "deleted" | "restored" | "collected" ;
export type SyncDataType = "idle" | "syncing" | "error"
export type ActivityType = "created" | "updated" | "deleted" | "restored" | "collected";
export type ParticipantRole = "host" | "participant";

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
  role: ParticipantRole;
  color: string;
  status: 'pending' | 'approved';
  joined_at: string;
  updated_at: string;
  session_id: string;
  items_count: number;
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

export interface Receipt {
  session_id: string
  session_name: string
  session_date: string
  session_time: string
  list_id: string | null
  participants: Participant[]
  items: Item[]
  uncollected_items: { id: string; name: string; quantity: number }[] | null
  total_price: string
}

export type ListItemState = "active" | "deleted";

export interface ListItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  state: ListItemState;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  name: string;
  created_at: string;
  last_active: string;
  items: ListItem[];
}

// ============================================================
// Quick Lists
// ============================================================

export interface QuickList {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  locale: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuickListItem {
  id: string;
  quick_list_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  is_optional: boolean;
  category: string | null;
  tags: string[];
  default_price: number | null;
  position: number;
  created_at: string;
}

/** Valid next states from a given current state. */
export const VALID_TRANSITIONS: Record<ItemState, ItemState[]> = {
  active: ["collected", "deleted", "restored"],
  collected: ["active", "deleted", "restored"],
  deleted: [], // terminal
  restored: ["active", "collected", "deleted"],
};
