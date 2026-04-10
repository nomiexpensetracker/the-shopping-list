import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidToken, isValidParticipantName } from "@/lib/validate";
import { generateSessionId, generateSessionParticipantId } from "@/lib/session";
import { getRandomHexColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST /api/lists/[token]/sessions — spawn a shopping session from a list
// Copies all active list items into the new session.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid list token" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const participantName =
    body && typeof body === "object" && "participantName" in body
      ? (body as Record<string, unknown>).participantName
      : "";

  if (!isValidParticipantName(participantName)) {
    return NextResponse.json({ error: "Invalid participant name" }, { status: 400 });
  }

  const [list] = await sql`
    SELECT id, name FROM lists WHERE id = ${token}
  `;

  if (!list) {
    return NextResponse.json({ error: "List not found", success: false }, { status: 404 });
  }

  const activeItems = await sql`
    SELECT id, name, quantity FROM list_items
    WHERE list_id = ${token} AND state = 'active'
    ORDER BY created_at
  `;

  const sessionId = generateSessionId();
  const participantId = generateSessionParticipantId();
  const participantColor = getRandomHexColor();
  const name = (participantName as string).trim();
  const db = getClient();

  try {
    await db.transaction([
      // 1. Create session linked to this list
      db`
        INSERT INTO sessions (id, title, list_id)
        VALUES (${sessionId}, ${list.name as string}, ${token})
      `,
      // 2. Create host participant
      db`
        INSERT INTO session_participants (id, name, color, session_id, role)
        VALUES (${participantId}, ${name}, ${participantColor}, ${sessionId}, 'host')
      `,
    ]);

    // 3. Copy active list items into session items (outside transaction to avoid
    //    large dynamic statements — each insert is idempotent on fresh session)
    if (activeItems.length > 0) {
      const itemInserts = activeItems.map((item) =>
        db`
          INSERT INTO items (id, session_id, name, quantity, state, created_by, updated_by)
          VALUES (
            ${generateSessionParticipantId()},
            ${sessionId},
            ${item.name as string},
            ${item.quantity as number},
            'active',
            ${participantId},
            ${participantId}
          )
        `
      );
      await Promise.all(itemInserts);
    }

    return NextResponse.json(
      {
        data: {
          id: sessionId,
          title: list.name,
          participant: {
            id: participantId,
            name,
            color: participantColor,
          },
        },
        success: true,
        status: 201,
        message: "Session created from list",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/lists/:token/sessions] failed:", err);
    return NextResponse.json(
      { error: "Failed to create session", success: false },
      { status: 500 }
    );
  }
}
