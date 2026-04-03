import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import type { ItemState } from "@/lib/types";
import {
  isValidToken,
  isValidPrice,
  isValidItemName,
  isValidQuantity,
  isValidTransition,
  isValidDescription,
  isValidCollectedBy,
} from "@/lib/validate";

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
    SELECT id, session_id, state, updated_at FROM items
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

  // Last-write-wins: only apply if the request's client_edit_at >= stored updated_at
  // Client sends its local timestamp when it read the item. If it's older than what
  // the DB already has, the DB already processed a later write — reject.
  const clientEditAt = body.client_edit_at;
  if (clientEditAt !== undefined && clientEditAt !== null) {
    const clientTime = new Date(clientEditAt as string).getTime();
    const serverTime = new Date(existing.updated_at as string).getTime();
    if (clientTime < serverTime) {
      // Conflict: return the current authoritative state
      const [current] = await sql`
        SELECT id, session_id, name, quantity, state, price, updated_at
        FROM items WHERE id = ${itemId}
      `;
      return NextResponse.json({ conflict: true, item: current }, { status: 409 });
    }
  }

  // Validate and apply each permitted field
  const updateValues: Record<string, unknown> = {};

  if ("name" in body) {
    if (!isValidItemName(body.name)) {
      return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
    }
    updateValues.name = (body.name as string).trim();
  }

  if ("description" in body) {
    if (!isValidDescription(body.description)) {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
    updateValues.description = body.description ?? null;
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

  if ("updated_by" in body) {
    if (!isValidCollectedBy(body.updated_by)) {
      return NextResponse.json({ error: "Invalid updated_by" }, { status: 400 });
    }
    updateValues.updated_by = body.updated_by ?? null;
  }

  if ("collected_by" in body) {
    if (!isValidCollectedBy(body.collected_by)) {
      return NextResponse.json({ error: "Invalid collected_by" }, { status: 400 });
    }
    updateValues.collected_by = body.collected_by ?? null;
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
  }

  // Build parameterised update using tagged template
  // We update updated_at on every write (server-side clock wins for ordering)
  const [item] = await sql`
    UPDATE items SET
      name              = COALESCE(${updateValues.name as string | undefined ?? null}, name),
      description       = COALESCE(${updateValues.description as string | undefined ?? null}, description),
      quantity          = COALESCE(${updateValues.quantity as number | undefined ?? null}, quantity),
      state             = COALESCE(${updateValues.state as string | undefined ?? null}, state),
      price             = COALESCE(${updateValues.price as number | undefined ?? null}, price),
      updated_at        = NOW(),
      updated_by        = COALESCE(${updateValues.updated_by as string | undefined ?? null}, updated_by),
      collected_at      = NOW(),
      collected_by      = COALESCE(${updateValues.collected_by as string | undefined ?? null}, collected_by)
    WHERE id = ${itemId} AND session_id = ${token}
    RETURNING id, session_id, name, quantity, state, price, updated_at
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
    UPDATE items SET state = 'deleted', updated_at = NOW()
    WHERE id = ${itemId} AND session_id = ${token} AND state != 'deleted'
    RETURNING id
  `;

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await sql`UPDATE sessions SET last_active = NOW() WHERE id = ${token}`;

  return NextResponse.json({ success: true });
}
