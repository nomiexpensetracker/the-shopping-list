import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token]/summary — get session summary with items total count, item collected count, item collected total price, and participants count
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  const summary = await sql`
    SELECT
      s.id AS session_id,
      s.title AS session_name,
      s.created_at::date AS session_date,
      to_char(s.created_at, 'HH12:MI AM') AS session_time,

      -- total items count
      (
        SELECT COUNT(*)
        FROM items i
        WHERE i.session_id = s.id
      ) AS total_items_count,

      -- collected items count
      (
        SELECT COUNT(*)
        FROM items i
        WHERE i.session_id = s.id
          AND i.state = 'collected'
      ) AS collected_items_count,

      -- collected items total price
      (
        SELECT COALESCE(SUM(i.price * i.quantity), 0)
        FROM items i
        WHERE i.session_id = s.id
          AND i.state = 'collected' AND i.collected_by = sp.id
      ) AS collected_items_total_price,

      -- participants count
      (
        SELECT COUNT(*)
        FROM session_participants sp
        WHERE sp.session_id = s.id
      ) AS participants_count
    FROM sessions s
    WHERE s.token = ${token}
  `;

  if (summary.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(summary[0]);
}
