import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken, isValidSessionTitle } from "@/lib/validate";
import { generateTemplateId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token] — get session details, including participants
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  let rows;
  try {
    rows = await sql`
      SELECT 
        sessions.id, 
        sessions.title, 
        sessions.created_at, 
        sessions.last_active,
        sessions.list_id,
        COALESCE(
          json_agg(
            json_build_object(
              'id', session_participants.id,
              'name', session_participants.name,
              'role', session_participants.role,
              'color', session_participants.color
            )
          ) FILTER (WHERE session_participants.id IS NOT NULL),
          '[]'::json
        ) as participants
      FROM sessions
      LEFT JOIN session_participants ON sessions.id = session_participants.session_id
      WHERE sessions.id = ${token}
      GROUP BY sessions.id, sessions.title, sessions.created_at, sessions.last_active, sessions.list_id
    `;
  } catch (err) {
    console.error("[GET /api/sessions/:token] db error:", err);
    return NextResponse.json({ error: "Failed to fetch session", success: false }, { status: 500 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Session not found", success: false, status: 404 });
  }

  return NextResponse.json({ data: rows[0], success: true, status: 200 });
}

// PATCH /api/sessions/[token] — update session title
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title } = body;

  if (!isValidSessionTitle(title)) {
    return NextResponse.json({ error: "Invalid session title" }, { status: 400 });
  }

  try {
    await sql`
      UPDATE sessions SET title = ${(title as string).trim()} WHERE id = ${token}
    `;
  } catch (err) {
    console.error("[PATCH /api/sessions/:token] db error:", err);
    return NextResponse.json({ error: "Failed to update session", success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/sessions/[token] — archive session as template then delete
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token", success: false, status: 400 });
  }

  // Check whether this session was spawned from a list
  let sessionRow: { list_id: string | null } | undefined;
  try {
    const rows = await sql`SELECT list_id FROM sessions WHERE id = ${token}`;
    sessionRow = rows[0] as { list_id: string | null } | undefined;
  } catch (err) {
    console.error("[DELETE /api/sessions/:token] db error:", err);
    return NextResponse.json({ error: "Failed to delete session", success: false }, { status: 500 });
  }
  if (!sessionRow) {
    return NextResponse.json({ error: "Session not found", success: false }, { status: 404 });
  }

  const listId = sessionRow.list_id as string | null;
  const db = getClient();

  if (listId) {
    // List-linked session: skip template creation — the list already preserves all items.
    // Soft-delete collected items from the list (they were found in-store this trip).
    try {
      await db.transaction([
        db`
          UPDATE list_items
          SET state = 'deleted'
          WHERE list_id = ${listId}
            AND state = 'active'
            AND name IN (
              SELECT name FROM items
              WHERE session_id = ${token}
                AND state = 'collected'
            )
        `,
        db`DELETE FROM items WHERE session_id = ${token}`,
        db`DELETE FROM sessions WHERE id = ${token}`,
      ]);
      return NextResponse.json({ data: { listId }, success: true, status: 200 });
    } catch (err) {
      console.error("[DELETE /api/sessions/:token] list-linked delete failed:", err);
      return NextResponse.json(
        { error: "Failed to delete session", success: false },
        { status: 500 }
      );
    }
  }

  // Quick Shop session (no list): create a template blueprint for the next trip QR code.
  const templateId = generateTemplateId();

  try {
    await db.transaction([
      // 1. Insert template (name derived from session title)
      db`
        INSERT INTO templates (id, name, expires_at)
        SELECT ${templateId}, title, NOW() + INTERVAL '30 days'
        FROM sessions
        WHERE id = ${token}
      `,
      // 2. Insert template_items from non-deleted session items
      db`
        INSERT INTO template_items (template_id, name, quantity)
        SELECT ${templateId}, name, quantity
        FROM items
        WHERE session_id = ${token}
          AND state != 'deleted'
      `,
      // 3. Delete session items
      db`DELETE FROM items WHERE session_id = ${token}`,
      // 4. Delete session
      db`DELETE FROM sessions WHERE id = ${token}`,
    ]);

    return NextResponse.json({ data: { templateId }, success: true, status: 200 });
  } catch (err) {
    console.error("[DELETE /api/sessions/:token] transaction failed:", err);
    return NextResponse.json(
      { error: "Failed to delete session", success: false },
      { status: 500 }
    );
  }
}
