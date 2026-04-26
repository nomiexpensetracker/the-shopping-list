import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidSlug, isValidParticipantName } from "@/lib/validate";
import { generateSessionId, generateSessionParticipantId, generateItemId } from "@/lib/session";
import { getRandomHexColor } from "@/lib/utils";
import type { PostQuickListStartResponse } from "@/types/dto";

export const dynamic = "force-dynamic";

// POST /api/quick-lists/[slug]/start
// Body: { participantName: string }
// Creates a Quick Shop session from a quick list and returns the session token.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug", success: false, status: 400 },
      { status: 400 }
    );
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

  if (!isValidParticipantName(participantName) || (participantName as string).trim() === "") {
    return NextResponse.json(
      { error: "Participant name is required (max 26 chars)", success: false, status: 400 },
      { status: 400 }
    );
  }

  const [ql] = await sql`
    SELECT id, title
    FROM quick_lists
    WHERE slug = ${slug} AND is_published = true
  `;

  if (!ql) {
    return NextResponse.json(
      { error: "Quick list not found", success: false, status: 404 },
      { status: 404 }
    );
  }

  const listTitle = (ql.title as string).trim();
  const name = (participantName as string).trim();

  const qlItems = await sql`
    SELECT name, quantity, unit
    FROM quick_list_items
    WHERE quick_list_id = ${ql.id as string}
    ORDER BY position
  `;

  const sessionId = generateSessionId();
  const participantId = generateSessionParticipantId();
  const participantColor = getRandomHexColor();
  const db = getClient();

  try {
    await db.transaction([
      // 1. Create Quick Shop session (list_id = NULL)
      db`
        INSERT INTO sessions (id, title)
        VALUES (${sessionId}, ${listTitle})
      `,
      // 2. Create host participant
      db`
        INSERT INTO session_participants (id, name, color, session_id, role)
        VALUES (${participantId}, ${name}, ${participantColor}, ${sessionId}, 'host')
      `,
    ]);

    // 3. Copy quick list items into session items
    //    Unit/quantity stored as description; session quantity = 1
    if (qlItems.length > 0) {
      const itemInserts = qlItems.map((item) => {
        const qty = item.quantity as number;
        const unit = item.unit as string | null;
        const name = item.name as string;
        const unitDescription =
          qty > 1 || unit
            ? `${qty}${unit ? ` ${unit}` : ""}`.trim()
            : null;

        return db`
          INSERT INTO items (id, session_id, name, quantity, state, description, created_by, updated_by)
          VALUES (
            ${generateItemId()},
            ${sessionId},
            ${name},
            ${1},
            'active',
            ${unitDescription},
            ${participantId},
            ${participantId}
          )
        `;
      });
      await Promise.all(itemInserts);
    }

    const responseBody: PostQuickListStartResponse = {
      session_token: sessionId,
      participant: {
        id: participantId,
        name,
        color: participantColor,
        role: "host",
        status: "approved" as const,
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session_id: sessionId,
        items_count: 0,
      },
    };

    return NextResponse.json(
      { data: responseBody, success: true, status: 201, message: "Session created from quick list" },
      { status: 201 }
    );
  } catch (err) {
    console.error(`[POST /api/quick-lists/${slug}/start] failed:`, err);
    return NextResponse.json(
      { error: "Failed to create session", success: false, status: 500 },
      { status: 500 }
    );
  }
}
