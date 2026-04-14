import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidToken, isValidListName } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/lists/[token] — fetch list with its active items
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid list token" }, { status: 400 });
  }

  const rows = await sql`
    SELECT
      l.id,
      l.name,
      l.created_at,
      l.last_active,
      COALESCE(
        json_agg(
          json_build_object(
            'id',         li.id,
            'list_id',    li.list_id,
            'name',       li.name,
            'quantity',   li.quantity,
            'state',      li.state,
            'created_at', li.created_at,
            'updated_at', li.updated_at
          )
          ORDER BY li.created_at
        ) FILTER (WHERE li.id IS NOT NULL AND li.state = 'active'),
        '[]'
      ) AS items
    FROM lists l
    LEFT JOIN list_items li ON l.id = li.list_id
    WHERE l.id = ${token}
    GROUP BY l.id, l.name, l.created_at, l.last_active
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  return NextResponse.json({ data: rows[0], success: true, status: 200 });
}

// PATCH /api/lists/[token] — rename list
export async function PATCH(
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

  const { name } = body;

  if (!isValidListName(name)) {
    return NextResponse.json({ error: "Invalid list name" }, { status: 400 });
  }

  const result = await sql`
    UPDATE lists
    SET name = ${(name as string).trim()}, last_active = NOW()
    WHERE id = ${token}
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/lists/[token] — permanently delete list and its items
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid list token" }, { status: 400 });
  }

  const result = await sql`
    DELETE FROM lists
    WHERE id = ${token}
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
