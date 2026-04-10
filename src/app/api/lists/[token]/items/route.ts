import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken, isValidItemName, isValidQuantity } from "@/lib/validate";
import { generateListItemId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/lists/[token]/items — add an item to a list
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid list token" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, quantity = 1 } = body;

  if (!isValidItemName(name)) {
    return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
  }

  if (!isValidQuantity(quantity)) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const [list] = await sql`SELECT id FROM lists WHERE id = ${token}`;
  if (!list) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  const itemId = generateListItemId();
  const itemName = (name as string).trim();
  const itemQty = quantity as number;
  const db = getClient();

  try {
    await db.transaction([
      db`INSERT INTO list_items (id, list_id, name, quantity) VALUES (${itemId}, ${token}, ${itemName}, ${itemQty})`,
      db`UPDATE lists SET last_active = NOW() WHERE id = ${token}`,
    ]);

    return NextResponse.json(
      {
        data: {
          id: itemId,
          list_id: token,
          name: itemName,
          quantity: itemQty,
          state: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        success: true,
        status: 201,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/lists/:token/items] failed:", err);
    return NextResponse.json(
      { error: "Failed to add item", success: false },
      { status: 500 }
    );
  }
}
