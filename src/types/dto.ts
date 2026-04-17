import { Item, Participant, Summary } from "./dao";

export type CommonResponse<T> = {
  data: T;
  error?: string;
  status: number;
  success: boolean;
  message?: string;
}

export interface PostSessionResponse {
  id: string;
  title: string;
  participant: Participant  
}

export interface PostItemRequest {
  name: string;
  quantity: number;
  created_by: string;
  description?: string | null;
}

export interface GetSessionDetailResponse {
  id: string
  title: string
  created_at: string
  last_active: string
  list_id: string | null
  participants: Participant[]
}

/** Shape returned by GET /api/sessions/[token]/sync */
export interface GetSessionSyncResponse {
  session: GetSessionDetailResponse
  items: Item[]
  summary: Summary
}

export interface PostListResponse {
  id: string;
  name: string;
  created_at: string;
}

export interface GetListResponse {
  id: string;
  name: string;
  created_at: string;
  last_active: string;
  items: import('./dao').ListItem[];
}

export interface ListRegistryEntry {
  id: string;
  name: string;
  last_active: string;
}

// ============================================================
// Starter Packs
// ============================================================

export interface StarterPackSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  cuisine: string | null;
  difficulty: string | null;
  is_featured: boolean;
}

export interface StarterPackVariantWithItems {
  id: string;
  name: string;
  locale: string;
  description: string | null;
  items: import('./dao').StarterPackVariantItem[];
}

export interface StarterPackDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  cuisine: string | null;
  difficulty: string | null;
  locale: string;
  is_featured: boolean;
  updated_at: string;
  variants: StarterPackVariantWithItems[];
}

export interface GetStarterPacksResponse {
  packs: StarterPackSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface PostStarterPackStartResponse {
  session_token: string;
  participant: import('./dao').Participant;
}
