import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/sessions/[token]/receipt - get session receipt with collected items, list participant and total items they collected, and total price they should pay
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }

  try {
    const receipt = await sql`
      SELECT
        s.id AS session_id,
        s.title AS session_name,
        s.created_at::date AS session_date,
        to_char(s.created_at, 'HH12:MI AM') AS session_time,
  
        -- participants with their collected items count
        (
          SELECT json_agg(
            json_build_object(
              'id', sub.id,
              'name', sub.name,
              'color', sub.color,
              'items_count', sub.items_count
            )
            ORDER BY sub.name
          )
          FROM (
            SELECT sp.id, sp.name, sp.color, COUNT(i.id) AS items_count
            FROM session_participants sp
            LEFT JOIN items i
              ON i.collected_by = sp.id
              AND i.state = 'collected'
            WHERE sp.session_id = s.id
            GROUP BY sp.id, sp.name, sp.color
          ) sub
        ) AS participants,
  
        -- collected items list
        (
          SELECT json_agg(
            json_build_object(
              'id', i.id,
              'name', i.name,
              'price', i.price,
              'quantity', i.quantity,
              'description', i.description
            )
            ORDER BY i.collected_at
          )
          FROM items i
          WHERE i.session_id = s.id
            AND i.state = 'collected'
        ) AS items,
  
        -- total price (qty * price)
        (
          SELECT COALESCE(SUM(i.quantity * i.price), 0)
          FROM items i
          WHERE i.session_id = s.id
            AND i.state = 'collected'
        ) AS total_price
  
      FROM sessions s
      WHERE s.id = ${token};
    `;
  
    if (receipt.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  
    return NextResponse.json({
      data: receipt[0],
      status: 200,
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
};
