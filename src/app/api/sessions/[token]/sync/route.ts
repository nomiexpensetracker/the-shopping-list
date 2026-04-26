import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token]/sync — merged polling endpoint.
// Returns session detail, participants, items, and summary aggregates in a
// single round-trip to the database, replacing the three separate GET calls to
// /sessions/[token], /sessions/[token]/items, and /sessions/[token]/summary.
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
      WITH item_data AS (
        SELECT
          id, session_id, name, quantity, description, state, price,
          created_at, created_by, updated_at, updated_by, collected_at, collected_by
        FROM items
        WHERE session_id = ${token}
      ),
      session_data AS (
        SELECT
          s.id,
          s.title,
          s.created_at,
          s.last_active,
          COALESCE(
            json_agg(
              json_build_object(
                'id',    sp.id,
                'name',  sp.name,
                'role',  sp.role,
                'color', sp.color
              )
            ) FILTER (WHERE sp.id IS NOT NULL AND sp.status = 'approved'),
            '[]'::json
          ) AS participants,
          COALESCE(
            json_agg(
              json_build_object(
                'id',    sp.id,
                'name',  sp.name,
                'color', sp.color
              )
            ) FILTER (WHERE sp.id IS NOT NULL AND sp.status = 'pending'),
            '[]'::json
          ) AS pending_participants
        FROM sessions s
        LEFT JOIN session_participants sp ON s.id = sp.session_id
        WHERE s.id = ${token}
        GROUP BY s.id, s.title, s.created_at, s.last_active
      )
      SELECT
        -- session fields
        sd.id,
        sd.title,
        sd.created_at,
        sd.last_active,
        sd.participants,
        sd.pending_participants,

        -- summary fields (derived from item_data — no extra table scans)
        sd.id                                                              AS session_id,
        sd.title                                                           AS session_name,
        sd.created_at::date                                                AS session_date,
        to_char(sd.created_at, 'HH12:MI AM')                              AS session_time,
        (SELECT COUNT(*)           FROM item_data WHERE state != 'deleted')          AS total_items_count,
        (SELECT COUNT(*)           FROM item_data WHERE state = 'collected')         AS collected_items_count,
        (SELECT COALESCE(SUM(price * quantity), 0)
                                   FROM item_data WHERE state = 'collected')         AS collected_items_total_price,
        (SELECT COUNT(*) FROM session_participants WHERE session_id = sd.id)         AS participants_count,

        -- items array
        (
          SELECT COALESCE(json_agg(i ORDER BY i.created_at ASC), '[]'::json)
          FROM item_data i
        ) AS items

      FROM session_data sd
    `;
  } catch (err) {
    console.error("[GET /api/sessions/:token/sync] db error:", err);
    return NextResponse.json({ error: "Failed to fetch session", success: false }, { status: 500 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Session not found", success: false }, { status: 404 });
  }

  const row = rows[0];

  return NextResponse.json({
    data: {
      session: {
        id:           row.id,
        title:        row.title,
        created_at:   row.created_at,
        last_active:  row.last_active,
        list_id:      null,
        participants: row.participants,
      },
      pending_participants: row.pending_participants ?? [],
      items: row.items ?? [],
      summary: {
        session_id:                   String(row.session_id),
        session_name:                 String(row.session_name),
        session_date:                 String(row.session_date),
        session_time:                 String(row.session_time),
        total_items_count:            String(row.total_items_count),
        collected_items_count:        String(row.collected_items_count),
        collected_items_total_price:  String(row.collected_items_total_price),
        participants_count:           String(row.participants_count),
      },
    },
    success: true,
    status: 200,
  });
}
