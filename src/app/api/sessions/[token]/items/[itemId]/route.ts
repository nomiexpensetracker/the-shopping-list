import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  isValidToken,
  isValidItemName,
  isValidQuantity,
  isValidPrice,
  isValidContributorLabel,
  isValidTransition,
} from "@/lib/validate";
import type { ItemState } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ token: string; itemId: string }>;
}

/** PATCH /api/sessions/[token]/items/[itemId] — edit item (LWW conflict resolution) */
export async function PATCH(req: Request, { params }: RouteContext) {
  const { token, itemId } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const [existing] = await sql`
    SELECT id, session_id, state, edit_at FROM items
    WHERE id = ${itemId} AND session_id = ${token}
  `;

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Last-write-wins: only apply if the request's client_edit_at >= stored edit_at
  // Client sends its local timestamp when it read the item. If it's older than what
  // the DB already has, the DB already processed a later write — reject.
  const clientEditAt = body.client_edit_at;
  if (clientEditAt !== undefined && clientEditAt !== null) {
    const clientTime = new Date(clientEditAt as string).getTime();
    const serverTime = new Date(existing.edit_at as string).getTime();
    if (clientTime < serverTime) {
      // Conflict: return the current authoritative state
      const [current] = await sql`
        SELECT id, session_id, name, quantity, state, price, contributor_label, edit_at
        FROM items WHERE id = ${itemId}
      `;
      return NextResponse.json({ conflict: true, item: current }, { status: 409 });
    }
  }

  // Validate and apply each permitted field
  const updates: string[] = [];
  const updateValues: Record<string, unknown> = {};

  if ("name" in body) {
    if (!isValidItemName(body.name)) {
      return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
    }
    updateValues.name = (body.name as string).trim();
  }

  if ("quantity" in body) {
    if (!isValidQuantity(body.quantity)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    updateValues.quantity = body.quantity;
  }

  if ("price" in body) {
    if (!isValidPrice(body.price)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    updateValues.price = body.price ?? null;
  }

  if ("contributor_label" in body) {
    if (!isValidContributorLabel(body.contributor_label)) {
      return NextResponse.json({ error: "Invalid contributor label" }, { status: 400 });
    }
    updateValues.contributor_label = body.contributor_label ?? null;
  }

  if ("state" in body) {
    const newState = body.state as ItemState;
    const currentState = existing.state as ItemState;
    if (!isValidTransition(currentState, newState)) {
      return NextResponse.json(
        { error: `Invalid transition: ${currentState} → ${newState}` },
        { status: 400 }
      );
    }
    updateValues.state = newState;
    // Clear price when uncollecting
    if (newState === "added") {
      updateValues.price = null;
    }
  }

  // Build parameterised update using tagged template
  // We update edit_at on every write (server-side clock wins for ordering)
  const [item] = await sql`
    UPDATE items SET
      name              = COALESCE(${updateValues.name as string | undefined ?? null}, name),
      quantity          = COALESCE(${updateValues.quantity as number | undefined ?? null}, quantity),
      state             = COALESCE(${updateValues.state as string | undefined ?? null}, state),
      price             = CASE
                            WHEN ${"price" in updateValues} THEN ${updateValues.price as number | null}
                            ELSE price
                          END,
      contributor_label = CASE
                            WHEN ${"contributor_label" in updateValues} THEN ${updateValues.contributor_label as string | null}
                            ELSE contributor_label
                          END,
      edit_at           = NOW()
    WHERE id = ${itemId} AND session_id = ${token}
    RETURNING id, session_id, name, quantity, state, price, contributor_label, edit_at
  `;

  await sql`UPDATE sessions SET last_active = NOW() WHERE id = ${token}`;

  return NextResponse.json(item);
}

/** DELETE /api/sessions/[token]/items/[itemId] — soft delete */
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { token, itemId } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const [item] = await sql`
    UPDATE items SET state = 'deleted', edit_at = NOW()
    WHERE id = ${itemId} AND session_id = ${token} AND state != 'deleted'
    RETURNING id
  `;

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await sql`UPDATE sessions SET last_active = NOW() WHERE id = ${token}`;

  return NextResponse.json({ ok: true });
}
