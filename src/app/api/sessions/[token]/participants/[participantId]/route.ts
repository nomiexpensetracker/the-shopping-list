import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token]/participants/[participantId]
// Returns the current status of a specific participant.
// Used by the waiting room to poll for approval.
// Returns 404 when the record does not exist (covers the rejected/deleted case).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string; participantId: string }> }
) {
  const { token, participantId } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  if (!participantId || typeof participantId !== "string") {
    return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, name, status
    FROM session_participants
    WHERE id = ${participantId} AND session_id = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Participant not found", success: false },
      { status: 404 }
    );
  }

  const row = rows[0];
  return NextResponse.json({
    data: { id: row.id, name: row.name, status: row.status },
    success: true,
    status: 200,
  });
}

// PATCH /api/sessions/[token]/participants/[participantId]
// Approve a pending participant. Caller must provide their own host participant ID.
// Body: { host_id: string }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string; participantId: string }> }
) {
  const { token, participantId } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  let body: { host_id?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const hostId = body.host_id;
  if (!hostId || typeof hostId !== "string") {
    return NextResponse.json({ error: "Missing host_id" }, { status: 400 });
  }

  // Verify caller is the host of this session
  const hostRows = await sql`
    SELECT id FROM session_participants
    WHERE id = ${hostId} AND session_id = ${token} AND role = 'host'
    LIMIT 1
  `;

  if (hostRows.length === 0) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const result = await sql`
    UPDATE session_participants
    SET status = 'approved'
    WHERE id = ${participantId} AND session_id = ${token} AND status = 'pending'
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Participant not found or already approved" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, status: 200 });
}

// DELETE /api/sessions/[token]/participants/[participantId]
// Reject a pending participant — deletes the record so the name slot is freed for retry.
// Caller must provide their own host participant ID.
// Body: { host_id: string }
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ token: string; participantId: string }> }
) {
  const { token, participantId } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  let body: { host_id?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const hostId = body.host_id;
  if (!hostId || typeof hostId !== "string") {
    return NextResponse.json({ error: "Missing host_id" }, { status: 400 });
  }

  // Verify caller is the host of this session
  const hostRows = await sql`
    SELECT id FROM session_participants
    WHERE id = ${hostId} AND session_id = ${token} AND role = 'host'
    LIMIT 1
  `;

  if (hostRows.length === 0) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  await sql`
    DELETE FROM session_participants
    WHERE id = ${participantId} AND session_id = ${token} AND status = 'pending'
  `;

  return NextResponse.json({ success: true, status: 200 });
}
