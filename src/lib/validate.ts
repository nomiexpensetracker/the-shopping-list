import type { ItemState } from "@/types/dao";
import { VALID_TRANSITIONS as TRANSITIONS } from "@/types/dao";

/** Validate a session token format (CUID2: 24 lowercase alphanumeric chars). */
export function isValidToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-z0-9]{24,32}$/.test(token);
}

/** Validate an item name: non-empty string, max 200 chars. */
export function isValidItemName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 200;
}

/** Validate item quantity: positive integer 1–999. */
export function isValidQuantity(qty: unknown): qty is number {
  return typeof qty === "number" && Number.isInteger(qty) && qty >= 1 && qty <= 999;
}

/** Validate optional price: null or non-negative number with at most 2 decimal places. */
export function isValidPrice(price: unknown): price is number | null {
  if (price === null || price === undefined) return true;
  if (typeof price !== "number") return false;
  if (!isFinite(price) || price < 0) return false;
  // Max 2 decimal places, max $9,999,999.99
  return price <= 9999999 && Math.round(price * 100) === price * 100;
}

/** Validate a contributor label: optional string, max 50 chars. */
export function isValidContributorLabel(label: unknown): label is string | null {
  if (label === null || label === undefined) return true;
  return typeof label === "string" && label.trim().length > 0 && label.length <= 50;
}

/** Validate that a state transition is permitted. */
export function isValidTransition(from: ItemState, to: ItemState): boolean {
  return (TRANSITIONS[from] as ItemState[]).includes(to);
}

/** Session title string, max 26 chars. */
export function isValidSessionTitle(title: unknown): title is string {
  if (title === null || title === undefined || title === "") return true;
  return typeof title === "string" && title.length <= 26;
}

/** Participant name string, max 26 chars. */
export function isValidParticipantName(name: unknown): name is string {
  if (name === null || name === undefined || name === "") return true;
  return typeof name === "string" && name.length <= 26;
}

/** Validate a collected_by referenced to session participants(id). */
export function isValidCollectedBy(collected_by: unknown): collected_by is string | null {
  if (collected_by === null || collected_by === undefined) return true;
  return typeof collected_by === "string" && /^[a-z0-9]{24,32}$/.test(collected_by);
}

/** Validate a description: optional string, max 500 chars. */
export function isValidDescription(description: unknown): description is string | null {
  if (description === null || description === undefined) return true;
  return typeof description === "string" && description.length <= 500;
}

/** List name: required, non-empty string, max 60 chars. */
export function isValidListName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 60;
}

/** Validate an activity action based on valid action ('created', 'updated', 'deleted', 'restored', 'collected'). */
export function isValidActivityAction(action: unknown): action is string {
  const validActions = ["created", "updated", "deleted", "restored", "collected"];
  return typeof action === "string" && validActions.includes(action);
}

/** Validate a starter pack slug: lowercase letters, digits, and hyphens only. */
export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}