import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

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

// DELETE /api/sessions/[token] — delete a session
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token", success: false, status: 400 });
  }

  await sql`
    DELETE FROM sessions WHERE id = ${token}
  `;

  return NextResponse.json({ success: true, status: 200 });
}
