import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidSlug } from "@/lib/validate";
import type { StarterPackDetailResponse } from "@/types/dto";
import type { StarterPackVariantItem } from "@/types/dao";

export const dynamic = "force-dynamic";

// GET /api/starter-packs/[slug] — fetch a published pack with all variants and items
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
    const [pack] = await sql`
      SELECT id, slug, title, description, category, cuisine, difficulty, locale, is_featured, updated_at
      FROM starter_packs
      WHERE slug = ${slug} AND is_published = true
    `;

    if (!pack) {
      return NextResponse.json(
        { error: "Starter pack not found", success: false, status: 404 },
        { status: 404 }
      );
    }

    const variants = await sql`
      SELECT id, name, locale, description
      FROM starter_pack_variants
      WHERE starter_pack_id = ${pack.id as string}
      ORDER BY created_at
    `;

    const variantIds = variants.map((v) => v.id as string);

    let items: Record<string, unknown>[] = [];
    if (variantIds.length > 0) {
      items = await sql`
        SELECT id, variant_id, name, quantity, unit, is_optional, category, tags, default_price, position
        FROM starter_pack_variant_items
        WHERE variant_id = ANY(${variantIds}::text[])
        ORDER BY variant_id, position
      `;
    }

    const itemsByVariant = new Map<string, StarterPackVariantItem[]>();
    for (const item of items) {
      const vid = item.variant_id as string;
      if (!itemsByVariant.has(vid)) itemsByVariant.set(vid, []);
      itemsByVariant.get(vid)!.push({
        id: item.id as string,
        variant_id: vid,
        name: item.name as string,
        quantity: item.quantity as number,
        unit: item.unit as string | null,
        is_optional: item.is_optional as boolean,
        category: item.category as string | null,
        tags: (item.tags as string[]) ?? [],
        default_price: item.default_price != null ? Number(item.default_price) : null,
        position: item.position as number,
        created_at: item.created_at as string,
      });
    }

    const response: StarterPackDetailResponse = {
      id: pack.id as string,
      slug: pack.slug as string,
      title: pack.title as string,
      description: pack.description as string | null,
      category: pack.category as string | null,
      cuisine: pack.cuisine as string | null,
      difficulty: pack.difficulty as string | null,
      locale: pack.locale as string,
      is_featured: pack.is_featured as boolean,
      updated_at: pack.updated_at as string,
      variants: variants.map((v) => ({
        id: v.id as string,
        name: v.name as string,
        locale: v.locale as string,
        description: v.description as string | null,
        items: itemsByVariant.get(v.id as string) ?? [],
      })),
    };

    return NextResponse.json(
      { data: response, success: true, status: 200 },
      { status: 200 }
    );
  } catch (err) {
    console.error(`[GET /api/starter-packs/${slug}] failed:`, err);
    return NextResponse.json(
      { error: "Failed to fetch starter pack", success: false, status: 500 },
      { status: 500 }
    );
  }
}
