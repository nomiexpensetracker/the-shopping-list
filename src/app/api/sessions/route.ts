import { NextResponse } from "next/server";

import { getClient } from "@/lib/db";
import { isValidParticipantName, isValidSessionTitle } from "@/lib/validate";
import { generateSessionId, generateSessionParticipantId } from "@/lib/session";
import { getRandomHexColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST /api/sessions — create new shopping list session with transaction
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const sessionTitle =
    body && typeof body === "object" && "title" in body
      ? (body as Record<string, unknown>).title
      : "";

  const participantName =
    body && typeof body === "object" && "name" in body
      ? (body as Record<string, unknown>).name
      : "";

  if (!isValidSessionTitle(sessionTitle)) {
    return NextResponse.json({ error: "Invalid session title" }, { status: 400 });
  }

  if (!isValidParticipantName(participantName)) {
    return NextResponse.json({ error: "Invalid participant name" }, { status: 400 });
  }

  const title = typeof sessionTitle === "string" ? sessionTitle.trim() : "";
  const name = typeof participantName === "string" ? participantName.trim() : "";

  const sessionId = generateSessionId();
  const participantId = generateSessionParticipantId();
  const participantColor = getRandomHexColor();

  const sql = getClient();

  try {
    await sql.transaction([
      sql`
        INSERT INTO sessions (id, title)
        VALUES (${sessionId}, ${title})
      `,
      sql`
        INSERT INTO session_participants (id, name, color, session_id, role)
        VALUES (${participantId}, ${name}, ${participantColor}, ${sessionId}, 'host')
      `,
    ]);

    return NextResponse.json({
      data: {
        id: sessionId,
        title: title,
        participant: {
          id: participantId,
          name: name,
          color: participantColor,
        }
      },
      status: 201,
      success: true,
      message: "Session created successfully",
    });
  } catch (err) {
    console.error("Transaction failed:", err);

    return NextResponse.json({
      data: null,
      error: "Failed to create session",
      status: 500,
      success: false,
    }, { status: 500 });
  }
};
