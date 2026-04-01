import { createId } from "@paralleldrive/cuid2";

/** Generate a new URL-safe, unguessable session token. */
export function generateSessionId(): string {
  return createId();
}

/** Generate a new item id. */
export function generateItemId(): string {
  return createId();
}
