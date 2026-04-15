import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateItemId } from "@/lib/session";
import { isValidToken, isValidItemName, isValidQuantity } from "@/lib/validate";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ token: string }>;
}

/** GET /api/sessions/[token]/items — list all items */
export async function GET(_req: Request, { params }: RouteContext) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  let sessions;
  try {
    sessions = await sql`SELECT id FROM sessions WHERE id = ${token}`;
  } catch (err) {
    console.error("[GET /api/sessions/:token/items] db error:", err);
    return NextResponse.json({ error: "Failed to fetch items", success: false }, { status: 500 });
  }
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let items;
  try {
    items = await sql`
      SELECT id, session_id, name, quantity, description, state, price, created_at, created_by, updated_at, updated_by, collected_at, collected_by
      FROM items
      WHERE session_id = ${token}
      ORDER BY created_at ASC;
    `;
  } catch (err) {
    console.error("[GET /api/sessions/:token/items] db error:", err);
    return NextResponse.json({ error: "Failed to fetch items", success: false }, { status: 500 });
  }

  return NextResponse.json({
    data: items,
    status: 200,
    success: true,
  });
}

/** POST /api/sessions/[token]/items — add a new item */
export async function POST(req: Request, { params }: RouteContext) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  let postSessions;
  try {
    postSessions = await sql`SELECT id FROM sessions WHERE id = ${token}`;
  } catch (err) {
    console.error("[POST /api/sessions/:token/items] db error:", err);
    return NextResponse.json({ error: "Failed to add item", success: false }, { status: 500 });
  }
  if (postSessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, quantity = 1, created_by, description = null } = body;

  if (!isValidItemName(name)) {
    return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
  }
  if (!isValidQuantity(quantity)) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const id = generateItemId();

  let item;
  try {
    [item] = await sql`
      INSERT INTO items (id, session_id, name, quantity, created_by, description)
      VALUES (${id}, ${token}, ${(name as string).trim()}, ${quantity as number}, ${created_by as string}, ${description as string | null})
      RETURNING id, session_id, name, quantity, state, price, description, created_at, created_by, updated_at, updated_by, collected_at, collected_by
    `;
    // bump session last_active
    await sql`UPDATE sessions SET last_active = NOW() WHERE id = ${token}`;
  } catch (err) {
    console.error("[POST /api/sessions/:token/items] db error:", err);
    return NextResponse.json({ error: "Failed to add item", success: false }, { status: 500 });
  }

  return NextResponse.json({
    data: item,
    status: 201,
    success: true,
  });
}
