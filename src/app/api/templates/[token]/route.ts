import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidToken } from "@/lib/validate";

export const dynamic = "force-dynamic";

export interface TemplateResponse {
  id: string;
  name: string;
  created_at: string;
  expires_at: string;
  items: { name: string; quantity: number }[];
}

// GET /api/templates/[token] — fetch template by id and validate expiry
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid template token" }, { status: 400 });
  }

  const rows = await sql`
    SELECT
      t.id,
      t.name,
      t.created_at,
      t.expires_at,
      COALESCE(
        json_agg(
          json_build_object('name', ti.name, 'quantity', ti.quantity)
          ORDER BY ti.id
        ) FILTER (WHERE ti.id IS NOT NULL),
        '[]'
      ) AS items
    FROM templates t
    LEFT JOIN template_items ti ON t.id = ti.template_id
    WHERE t.id = ${token}
    GROUP BY t.id, t.name, t.created_at, t.expires_at
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Template not found", success: false }, { status: 404 });
  }

  const template = rows[0];
  const isExpired = new Date(template.expires_at as string) < new Date();

  if (isExpired) {
    return NextResponse.json(
      { error: "This QR code has expired and can no longer be used.", success: false, expired: true },
      { status: 410 }
    );
  }

  return NextResponse.json({ data: template as unknown as TemplateResponse, success: true });
}
