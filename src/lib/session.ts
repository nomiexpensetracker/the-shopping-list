import { createId } from "@paralleldrive/cuid2";

/** Generate a new URL-safe, unguessable session token. */
export function generateSessionId(): string {
  return createId();
}

/** Generate a new item id. */
export function generateItemId(): string {
  return createId();
}

/** Generate a new session participant id. */
export function generateSessionParticipantId(): string {
  return createId();
}

/** Generate a new template id. */
export function generateTemplateId(): string {
  return createId();
}

/** Generate a new list id. */
export function generateListId(): string {
  return createId();
}

/** Generate a new list item id. */
export function generateListItemId(): string {
  return createId();
}
