import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidSlug } from "@/lib/validate";
import type { QuickListDetailResponse } from "@/types/dto";
import type { QuickListItem } from "@/types/dao";

export const dynamic = "force-dynamic";

// GET /api/quick-lists/[slug] — fetch a published quick list with its items
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug", success: false, status: 400 },
      { status: 400 }
    );
  }

  try {
    const [ql] = await sql`
      SELECT id, slug, title, description, category, locale, is_featured, updated_at
      FROM quick_lists
      WHERE slug = ${slug} AND is_published = true
    `;

    if (!ql) {
      return NextResponse.json(
        { error: "Quick list not found", success: false, status: 404 },
        { status: 404 }
      );
    }

    const itemRows = await sql`
      SELECT id, quick_list_id, name, quantity, unit, is_optional, category, tags, default_price, position, created_at
      FROM quick_list_items
      WHERE quick_list_id = ${ql.id as string}
      ORDER BY position
    `;

    const items: QuickListItem[] = itemRows.map((r) => ({
      id: r.id as string,
      quick_list_id: r.quick_list_id as string,
      name: r.name as string,
      quantity: r.quantity as number,
      unit: r.unit as string | null,
      is_optional: r.is_optional as boolean,
      category: r.category as string | null,
      tags: (r.tags as string[]) ?? [],
      default_price: r.default_price != null ? Number(r.default_price) : null,
      position: r.position as number,
      created_at: r.created_at as string,
    }));

    const response: QuickListDetailResponse = {
      id: ql.id as string,
      slug: ql.slug as string,
      title: ql.title as string,
      description: ql.description as string | null,
      category: ql.category as string | null,
      locale: ql.locale as string,
      is_featured: ql.is_featured as boolean,
      updated_at: ql.updated_at as string,
      items,
    };

    return NextResponse.json(
      { data: response, success: true, status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.error(`[GET /api/quick-lists/${slug}] failed:`, err);
    return NextResponse.json(
      { error: "Failed to fetch quick list", success: false, status: 500 },
      { status: 500 }
    );
  }
}
