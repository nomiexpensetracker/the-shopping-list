import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken, isValidItemName, isValidQuantity } from "@/lib/validate";

export const dynamic = "force-dynamic";

// PATCH /api/lists/[token]/items/[itemId] — edit name/quantity or soft-delete a list item
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;

  if (!isValidToken(token) || !isValidToken(itemId)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, quantity, state } = body;

  if (name !== undefined && !isValidItemName(name)) {
    return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
  }

  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  if (state !== undefined && !["active", "deleted"].includes(state as string)) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const [existing] = await sql`
    SELECT id FROM list_items WHERE id = ${itemId} AND list_id = ${token}
  `;

  if (!existing) {
    return NextResponse.json({ error: "Item not found", success: false }, { status: 404 });
  }

  const db = getClient();

  try {
    await db.transaction([
      db`
        UPDATE list_items
        SET
          name     = COALESCE(${name !== undefined ? (name as string).trim() : null}, name),
          quantity = COALESCE(${quantity !== undefined ? (quantity as number) : null}::integer, quantity),
          state    = COALESCE(${state !== undefined ? (state as string) : null}, state)
        WHERE id = ${itemId} AND list_id = ${token}
      `,
      db`UPDATE lists SET last_active = NOW() WHERE id = ${token}`,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/lists/:token/items/:itemId] failed:", err);
    return NextResponse.json(
      { error: "Failed to update item", success: false },
      { status: 500 }
    );
  }
}
