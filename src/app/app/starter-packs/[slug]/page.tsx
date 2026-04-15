import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sql } from "@/lib/db";
import type { StarterPackVariantItem } from "@/types/dao";
import type { StarterPackDetailResponse } from "@/types/dto";

import AddToMyListsButton from "@/components/AddToMyListsButton";
import StarterPacksTopBar from "@/components/StarterPacksTopBar";
import StartShoppingButton from "@/components/StartShoppingButton";

export const dynamic = "force-dynamic";

// ----------------------------------------------------------------
// Data fetching (direct DB — no internal fetch round-trip)
// ----------------------------------------------------------------
async function fetchPack(slug: string): Promise<StarterPackDetailResponse | null> {
  let pack: Record<string, unknown> | undefined;
  let variants: Record<string, unknown>[] = [];
  let items: Record<string, unknown>[] = [];

  try {
  const [_pack] = await sql`
    SELECT id, slug, title, description, category, cuisine, difficulty, locale, is_featured, updated_at
    FROM starter_packs
    WHERE slug = ${slug} AND is_published = true
  `;
  pack = _pack;
  if (!pack) return null;

  variants = await sql`
    SELECT id, name, locale, description
    FROM starter_pack_variants
    WHERE starter_pack_id = ${pack.id as string}
    ORDER BY created_at
  `;

  const variantIds = variants.map((v) => v.id as string);
  if (variantIds.length > 0) {
    items = await sql`
      SELECT id, variant_id, name, quantity, unit, is_optional, category, tags, default_price, position
      FROM starter_pack_variant_items
      WHERE variant_id = ANY(${variantIds}::text[])
      ORDER BY variant_id, position
    `;
  }
  } catch (err) {
    console.error(`[fetchPack] DB error for slug "${slug}":`, err);
    return null;
  }

  if (!pack) return null;

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

  return {
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
}

// ----------------------------------------------------------------
// Metadata
// ----------------------------------------------------------------
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const pack = await fetchPack(slug);
  if (!pack) return { title: "Not found" };

  const title = `${pack.title} — Complete Shopping List`;
  const description =
    pack.description ??
    `Complete shopping list for ${pack.title}. Start shopping in seconds.`;
  const ogUrl = `https://the-shopping-list-eight.vercel.app/api/og/starter-pack?title=${encodeURIComponent(pack.title)}&description=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://the-shopping-list-eight.vercel.app/app/starter-packs/${slug}`,
      siteName: "The Shopping List",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: pack.title }],
      type: "website",
    },
  };
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------
export default async function StarterPackDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pack = await fetchPack(slug);

  if (!pack) notFound();

  // Structured data: Recipe for food packs, ItemList otherwise
  const structuredData = pack.cuisine
    ? buildRecipeSchema(pack)
    : buildItemListSchema(pack);

  // Flatten items from all variants for the primary ingredient display
  const primaryVariant = pack.variants[0];
  const allItems = primaryVariant?.items ?? [];

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div style={{ background: "var(--background)", minHeight: "100dvh" }}>
        <StarterPacksTopBar />

        {/* Pack header */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-foreground">
              {pack.title}
            </h1>

            {pack.description && (
              <p className="text-lg leading-relaxed max-w-2xl text-muted">
                {pack.description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-12">
          {/* Ingredients — SEO critical section */}
          <section>
            <h2 className="text-xl font-bold mb-5 text-foreground">
              Ingredients
              {primaryVariant && primaryVariant.name && (
                <span className="ml-2 text-base font-normal text-muted">
                  ({primaryVariant.name})
                </span>
              )}
            </h2>

            {allItems.length === 0 ? (
              <p className="text-muted">No items yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {allItems.map((item) => (
                  <IngredientRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>

          {/* Variants — show all if more than one */}
          {pack.variants.length > 1 && (
            <section>
              <h2 className="text-xl font-bold mb-5 text-foreground">
                Varian Tersedia
              </h2>
              <div className="space-y-6">
                {pack.variants.map((variant) => (
                  <div key={variant.id}>
                    <h3 className="font-semibold mb-3 text-foreground">
                      {variant.name}
                    </h3>
                    {variant.description && (
                      <p className="text-sm text-muted mb-3">
                        {variant.description}
                      </p>
                    )}
                    <ul className="divide-y divide-border">
                      {variant.items.map((item) => (
                        <IngredientRow key={item.id} item={item} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Second CTA */}
          <section
            className="rounded-2xl p-6 text-center"
            style={{
              background: "var(--brand-light)",
              border: "1px solid var(--brand)",
            }}
          >
            <h2 className="text-lg font-bold mb-2 text-foreground">
              Ready to shop?
            </h2>
            <p className="text-sm text-muted mb-5">
              Create a shopping session from this pack and invite friends or family.
            </p>
            <div className="flex flex-col gap-2">
              <StartShoppingButton
                variants={pack.variants}
                packSlug={pack.slug}
                packTitle={pack.title}
              />
              <AddToMyListsButton
                variants={pack.variants}
                packTitle={pack.title}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function IngredientRow({ item }: { item: StarterPackVariantItem }) {
  return (
    <li className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--brand)" }} />
        <span className="text-sm font-medium truncate text-foreground">
          {item.name}
        </span>
        {item.is_optional && (
          <span className="shrink-0 text-xs text-muted italic">(optional)</span>
        )}
      </div>
      <span className="shrink-0 text-sm text-muted tabular-nums">
        {item.quantity}
        {item.unit ? ` ${item.unit}` : ""}
      </span>
    </li>
  );
}

// ----------------------------------------------------------------
// Structured data helpers
// ----------------------------------------------------------------
function buildRecipeSchema(pack: StarterPackDetailResponse) {
  const primaryItems = pack.variants[0]?.items ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: pack.title,
    description: pack.description,
    recipeIngredient: primaryItems.map(
      (i) => `${i.quantity}${i.unit ? ` ${i.unit}` : ""} ${i.name}`
    ),
    recipeCuisine: pack.cuisine ?? undefined,
    dateModified: pack.updated_at,
  };
}

function buildItemListSchema(pack: StarterPackDetailResponse) {
  const primaryItems = pack.variants[0]?.items ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pack.title,
    description: pack.description,
    itemListElement: primaryItems.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${i.quantity}${i.unit ? ` ${i.unit}` : ""} ${i.name}`,
    })),
  };
}
