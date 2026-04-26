import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sql } from "@/lib/db";
import type { QuickListItem } from "@/types/dao";
import type { QuickListDetailResponse } from "@/types/dto";

import AddToMyListsButton from "@/components/AddToMyListsButton";
import StarterPacksTopBar from "@/components/StarterPacksTopBar";
import StartShoppingButton from "@/components/StartShoppingButton";
import QuickListServings from "@/components/QuickListServings";

export const dynamic = "force-dynamic";

// ----------------------------------------------------------------
// Data fetching
// ----------------------------------------------------------------
async function fetchQuickList(slug: string): Promise<QuickListDetailResponse | null> {
  try {
    const [ql] = await sql`
      SELECT id, slug, title, description, category, locale, is_featured, updated_at
      FROM quick_lists
      WHERE slug = ${slug} AND is_published = true
    `;
    if (!ql) return null;

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

    return {
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
  } catch (err) {
    console.error(`[fetchQuickList] DB error for slug "${slug}":`, err);
    return null;
  }
}

// ----------------------------------------------------------------
// Metadata
// ----------------------------------------------------------------
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const ql = await fetchQuickList(slug);
  if (!ql) return { title: "Not found" };

  const title = `${ql.title} — Complete Shopping List`;
  const description =
    ql.description ??
    `Complete shopping list for ${ql.title}. Start shopping in seconds.`;
  const ogUrl = `https://the-shopping-list-eight.vercel.app/api/og/starter-pack?title=${encodeURIComponent(ql.title)}&description=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://the-shopping-list-eight.vercel.app/app/quick-lists/${slug}`,
      siteName: "The Shopping List",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: ql.title }],
      type: "website",
    },
  };
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------
export default async function QuickListDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ql = await fetchQuickList(slug);

  if (!ql) notFound();

  const structuredData = buildItemListSchema(ql);

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div style={{ background: "var(--background)", minHeight: "100dvh" }}>
        <StarterPacksTopBar />

        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-foreground">
              {ql.title}
            </h1>
            {ql.description && (
              <p className="text-lg leading-relaxed max-w-2xl text-muted">
                {ql.description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-12">
          {/* Items with servings scaler */}
          <QuickListServings items={ql.items} />

          {/* CTA */}
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
              Create a shopping session from this list and invite friends or family.
            </p>
            <div className="flex flex-col gap-2">
              <StartShoppingButton
                quickListId={ql.id}
                packSlug={ql.slug}
                packTitle={ql.title}
              />
              <AddToMyListsButton
                quickListId={ql.id}
                packTitle={ql.title}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------
// Structured data
// ----------------------------------------------------------------
function buildItemListSchema(ql: QuickListDetailResponse) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ql.title,
    description: ql.description,
    itemListElement: ql.items.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${i.quantity}${i.unit ? ` ${i.unit}` : ""} ${i.name}`,
    })),
  };
}
