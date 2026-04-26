import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";
import { generateSessionParticipantId } from "@/lib/session";
import { getRandomHexColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST /api/sessions/[token]/participants — add a participant to a session
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { name } = await _req.json();

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({
      error: "Invalid participant name",
      status: 400,
      success: false,
    });
  }

  const participantId = generateSessionParticipantId();
  const participantColor = getRandomHexColor();

  try {
    await sql`
      INSERT INTO session_participants (id, name, color, session_id, status)
      VALUES (${participantId}, ${name.trim()}, ${participantColor}, ${token}, 'pending')
    `;
  
    return NextResponse.json({
      data: {
        id: participantId,
        name: name.trim(),
        color: participantColor,
        status: 'pending' as const,
      },
      status: 201,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({
      data: null,
      error: `Failed to join session: ${err}`,
      status: 500,
      success: false,
    });
  }

}

// PATCH /api/sessions/[token]/participants — update a participant in a session
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { participant_id, name, color } = await _req.json();

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  if (!participant_id || typeof participant_id !== "string") {
    return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 });
  }

  if (name && (typeof name !== "string" || name.trim() === "")) {
    return NextResponse.json({ error: "Invalid participant name" }, { status: 400 });
  }

  if (color && (typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color))) {
    return NextResponse.json({ error: "Invalid participant color" }, { status: 400 });
  }

  await sql`
    UPDATE session_participants
    SET 
      name = COALESCE(${name ? name.trim() : null}, name),
      color = COALESCE(${color}, color)
    WHERE id = ${participant_id} AND session_id = ${token}
  `;

  return NextResponse.json({ message: "Participant updated" });
}

// DELETE /api/sessions/[token]/participants — remove a participant from a session
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { participant_id } = await _req.json();

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  if (!participant_id || typeof participant_id !== "string") {
    return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 });
  }

  await sql`
    DELETE FROM session_participants
    WHERE id = ${participant_id} AND session_id = ${token}
  `;

  return NextResponse.json({ message: "Participant removed" });
}
