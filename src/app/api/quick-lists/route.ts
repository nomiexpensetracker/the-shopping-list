import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { GetQuickListsResponse } from "@/types/dto";

export const dynamic = "force-dynamic";

// GET /api/quick-lists — browse published quick lists
// Query params: search, category, locale, page (default 1), limit (default 20)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const locale = searchParams.get("locale")?.trim() ?? "";
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 20;
  const offset = (page - 1) * limit;

  try {
    const searchPattern = search ? `%${search}%` : null;

    const rows = await sql`
      SELECT
        id, slug, title, description, category, is_featured,
        COUNT(*) OVER() AS total_count
      FROM quick_lists
      WHERE is_published = true
        AND (${searchPattern}::text IS NULL OR (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern}))
        AND (${category || null}::text IS NULL OR category = ${category || null})
        AND (${locale || null}::text IS NULL OR locale = ${locale || null})
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = rows.length > 0 ? parseInt(rows[0].total_count as string, 10) : 0;

    const lists = rows.map((r) => ({
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      description: r.description as string | null,
      category: r.category as string | null,
      is_featured: r.is_featured as boolean,
    }));

    const responseBody: GetQuickListsResponse = { lists, total, page, limit };

    return NextResponse.json(
      { data: responseBody, success: true, status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/quick-lists] failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch quick lists", success: false, status: 500 },
      { status: 500 }
    );
  }
}
