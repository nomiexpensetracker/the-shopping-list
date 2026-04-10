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

  const rows = await sql`
    SELECT 
      sessions.id, 
      sessions.title, 
      sessions.created_at, 
      sessions.last_active,
      json_agg(
        json_build_object(
          'id', session_participants.id,
          'name', session_participants.name,
          'role', session_participants.role,
          'color', session_participants.color
        )
      ) FILTER (WHERE session_participants.id IS NOT NULL) as participants
    FROM sessions
    LEFT JOIN session_participants ON sessions.id = session_participants.session_id
    WHERE sessions.id = ${token}
    GROUP BY sessions.id, sessions.title, sessions.created_at, sessions.last_active
  `;

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

  await sql`
    UPDATE sessions SET title = ${(title as string).trim()} WHERE id = ${token}
  `;

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

  const templateId = generateTemplateId();
  const sql = getClient();

  try {
    await sql.transaction([
      // 1. Insert template (name derived from session title)
      sql`
        INSERT INTO templates (id, name, expires_at)
        SELECT ${templateId}, title, NOW() + INTERVAL '30 days'
        FROM sessions
        WHERE id = ${token}
      `,
      // 2. Insert template_items from non-deleted session items
      sql`
        INSERT INTO template_items (template_id, name, quantity)
        SELECT ${templateId}, name, quantity
        FROM items
        WHERE session_id = ${token}
          AND state != 'deleted'
      `,
      // 3. Delete session items
      sql`
        DELETE FROM items WHERE session_id = ${token}
      `,
      // 4. Delete session
      sql`
        DELETE FROM sessions WHERE id = ${token}
      `,
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
