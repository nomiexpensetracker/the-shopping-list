import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken } from "@/lib/validate";
import { generateListItemId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/lists/[token]/import-quick-list — bulk import items from a quick list
// Body: { quick_list_id: string }
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

  const { quick_list_id } = body;

  if (!quick_list_id || typeof quick_list_id !== "string") {
    return NextResponse.json({ error: "quick_list_id is required" }, { status: 400 });
  }

  const [list] = await sql`SELECT id FROM lists WHERE id = ${token}`;
  if (!list) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  const items = await sql`
    SELECT name, quantity, unit
    FROM quick_list_items
    WHERE quick_list_id = ${quick_list_id}
    ORDER BY position
  `;

  if (items.length === 0) {
    return NextResponse.json({ success: true, imported: 0 });
  }

  const db = getClient();
  const inserts = items.map((item) => {
    const id = generateListItemId();
    const qty = item.quantity as number;
    const unit = item.unit as string | null;
    const name = item.name as string;
    // Build a unit description string (e.g. "500 gr", "2 packs") stored separately from the name
    const unitDescription =
      qty > 1 || unit
        ? `${qty}${unit ? ` ${unit}` : ""}`.trim()
        : null;

    return db`INSERT INTO list_items (id, list_id, name, quantity, unit) VALUES (${id}, ${token}, ${name}, ${1}, ${unitDescription})`;
  });

  await db.transaction([
    ...inserts,
    db`UPDATE lists SET last_active = NOW() WHERE id = ${token}`,
  ]);

  return NextResponse.json({ success: true, imported: items.length });
}
