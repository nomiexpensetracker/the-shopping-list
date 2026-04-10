import { Participant } from "./dao";

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
