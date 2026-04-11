import type { QuickShopForm, NewListForm } from "./types";

/** Returns an error message string, or null if valid. */
export function validateQuickShopForm(form: QuickShopForm): string | null {
  if (!form.title.trim()) return "Session title is required";
  if (!form.name.trim()) return "Name is required";
  return null;
}

/** Returns an error message string, or null if valid. */
export function validateListName(form: NewListForm): string | null {
  if (!form.name.trim()) return "List name is required.";
  return null;
}

/**
 * Scans localStorage for an in-progress participant session key.
 * Returns the session ID if found, otherwise null.
 */
export function findActiveSessionId(): string | null {
  const keys = Object.keys(localStorage);
  const sessionKey = keys.find(
    (key) => key.startsWith("participant_") && key.endsWith("_id")
  );
  if (!sessionKey) return null;
  return sessionKey.split("_")[1];
}

/** Stores participant data in localStorage after a session is created. */
export function storeParticipantLocally(
  sessionId: string,
  name: string,
  participantId: string,
  color: string
): void {
  localStorage.setItem(`participant_${sessionId}_name`, name);
  localStorage.setItem(`participant_${sessionId}_id`, participantId);
  localStorage.setItem(`participant_${sessionId}_color`, color);
}
