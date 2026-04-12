import { NextResponse } from "next/server";
import { sql, getClient } from "@/lib/db";
import { isValidSlug, isValidToken, isValidParticipantName } from "@/lib/validate";
import { generateSessionId, generateSessionParticipantId, generateItemId } from "@/lib/session";
import { getRandomHexColor } from "@/lib/utils";
import type { PostStarterPackStartResponse } from "@/types/dto";

export const dynamic = "force-dynamic";

// POST /api/starter-packs/[slug]/variants/[variantId]
// Body: { participantName: string }
// Creates a Quick Shop session from a starter pack variant and returns the session token.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; variantId: string }> }
) {
  const { slug, variantId } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug", success: false, status: 400 },
      { status: 400 }
    );
  }

  if (!isValidToken(variantId)) {
    return NextResponse.json(
      { error: "Invalid variant ID", success: false, status: 400 },
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

  // Verify the variant belongs to the pack identified by slug
  const [variant] = await sql`
    SELECT spv.id, spv.starter_pack_id, sp.title AS pack_title
    FROM starter_pack_variants spv
    JOIN starter_packs sp ON sp.id = spv.starter_pack_id
    WHERE spv.id = ${variantId}
      AND sp.slug = ${slug}
      AND sp.is_published = true
  `;

  if (!variant) {
    return NextResponse.json(
      { error: "Variant not found", success: false, status: 404 },
      { status: 404 }
    );
  }

  const packTitle = (variant.pack_title as string).trim();
  const name = (participantName as string).trim();

  const variantItems = await sql`
    SELECT name, quantity
    FROM starter_pack_variant_items
    WHERE variant_id = ${variantId}
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
        VALUES (${sessionId}, ${packTitle})
      `,
      // 2. Create host participant
      db`
        INSERT INTO session_participants (id, name, color, session_id, role)
        VALUES (${participantId}, ${name}, ${participantColor}, ${sessionId}, 'host')
      `,
    ]);

    // 3. Copy variant items into session items (parallel, outside transaction)
    if (variantItems.length > 0) {
      const itemInserts = variantItems.map((item) =>
        db`
          INSERT INTO items (id, session_id, name, quantity, state, created_by, updated_by)
          VALUES (
            ${generateItemId()},
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

    const responseBody: PostStarterPackStartResponse = {
      session_token: sessionId,
      participant: {
        id: participantId,
        name,
        color: participantColor,
        role: "host",
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session_id: sessionId,
        items_count: 0,
      },
    };

    return NextResponse.json(
      { data: responseBody, success: true, status: 201, message: "Session created from starter pack" },
      { status: 201 }
    );
  } catch (err) {
    console.error(`[POST /api/starter-packs/${slug}/variants/${variantId}] failed:`, err);
    return NextResponse.json(
      { error: "Failed to create session", success: false, status: 500 },
      { status: 500 }
    );
  }
}
