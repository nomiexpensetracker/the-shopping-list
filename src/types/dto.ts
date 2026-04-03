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
