import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidActivityAction, isValidToken } from "@/lib/validate";
import { generateSessionParticipantId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token]/activities — get session activities
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  const activities = await sql`
    SELECT
      item_activities.id,
      item_activities.item_id,
      item_activities.participant_id,
      item_activities.action,
      item_activities.created_at,
      session_participants.name as participant_name,
      session_participants.color as participant_color
    FROM item_activities
    JOIN session_participants ON item_activities.participant_id = session_participants.id
    WHERE session_participants.session_id = ${token}
    ORDER BY item_activities.created_at DESC
  `;

  return NextResponse.json({ data: activities });
}

// POST /api/sessions/[token]/activities — add an activity to a session
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { item_id, participant_id, action } = await _req.json();

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  if (!action || typeof action !== "string" || action.trim() === "" || !isValidActivityAction(action)) {
    return NextResponse.json({ error: "Invalid activity action" }, { status: 400 });
  }

  const activityId = generateSessionParticipantId();

  await sql`
    INSERT INTO item_activities (id, item_id, participant_id, action)
    VALUES (${activityId}, ${item_id}, ${participant_id}, ${action})
  `;

  return NextResponse.json({ data: { message: "Activity added", activity_id: activityId } }, { status: 201 });
};
