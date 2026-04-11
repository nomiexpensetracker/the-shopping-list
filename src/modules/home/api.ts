import type { CommonResponse, PostSessionResponse, PostListResponse } from "@/types/dto";

export async function apiCreateSession(
  name: string,
  title: string
): Promise<PostSessionResponse> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, title }),
  });

  if (!res.ok) throw new Error("Failed to create session");

  const data = (await res.json()) as CommonResponse<PostSessionResponse>;
  if (!data.success) throw new Error("Oops something went wrong. Please try again.");

  return data.data;
}

export async function apiCreateList(
  name: string
): Promise<PostListResponse> {
  const res = await fetch("/api/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const data = (await res.json()) as CommonResponse<PostListResponse>;
  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Failed to create list. Please try again.");
  }

  return data.data;
}
