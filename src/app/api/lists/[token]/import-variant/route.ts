import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken } from "@/lib/validate";
import { generateListItemId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/lists/[token]/import-variant — bulk import items from a starter pack variant
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

  const { variant_id } = body;

  if (!variant_id || typeof variant_id !== "string") {
    return NextResponse.json({ error: "variant_id is required" }, { status: 400 });
  }

  const [list] = await sql`SELECT id FROM lists WHERE id = ${token}`;
  if (!list) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  const items = await sql`
    SELECT name, quantity
    FROM starter_pack_variant_items
    WHERE variant_id = ${variant_id}
    ORDER BY position
  `;

  if (items.length === 0) {
    return NextResponse.json({ success: true, imported: 0 });
  }

  const db = getClient();
  const inserts = items.map((item) => {
    const id = generateListItemId();
    return db`INSERT INTO list_items (id, list_id, name, quantity) VALUES (${id}, ${token}, ${item.name as string}, ${item.quantity as number})`;
  });

  await db.transaction([
    ...inserts,
    db`UPDATE lists SET last_active = NOW() WHERE id = ${token}`,
  ]);

  return NextResponse.json({ success: true, imported: items.length });
}
