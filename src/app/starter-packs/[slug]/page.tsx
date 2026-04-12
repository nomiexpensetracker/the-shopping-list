import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import type { StarterPackDetailResponse } from "@/types/dto";
import type { StarterPackVariantItem } from "@/types/dao";
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
  if (!pack) return { title: "Tidak ditemukan" };

  const title = `${pack.title} — Daftar Belanja Lengkap`;
  const description =
    pack.description ??
    `Daftar belanja lengkap untuk ${pack.title}. Mulai belanja dalam hitungan detik.`;
  const ogUrl = `https://the-shopping-list-eight.vercel.app/api/og/starter-pack?title=${encodeURIComponent(pack.title)}&description=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://the-shopping-list-eight.vercel.app/starter-packs/${slug}`,
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

      <main className="min-h-screen bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <nav className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                Beranda
              </Link>
              <span className="mx-2">/</span>
              <Link href="/starter-packs" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                Starter Packs
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100">{pack.title}</span>
            </nav>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {pack.category && <Tag>{pack.category}</Tag>}
              {pack.cuisine && <Tag>{pack.cuisine}</Tag>}
              {pack.difficulty && <Tag>{pack.difficulty}</Tag>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
              {pack.title}
            </h1>

            {pack.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6 max-w-2xl">
                {pack.description}
              </p>
            )}

            {/* Primary CTA — above fold */}
            <StartShoppingButton
              variants={pack.variants}
              packSlug={pack.slug}
              packTitle={pack.title}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
          {/* Ingredients — SEO critical section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">
              Bahan-bahan
              {primaryVariant && primaryVariant.name && (
                <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
                  ({primaryVariant.name})
                </span>
              )}
            </h2>

            {allItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Belum ada item.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {allItems.map((item) => (
                  <IngredientRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>

          {/* Variants — show all if more than one */}
          {pack.variants.length > 1 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">
                Varian Tersedia
              </h2>
              <div className="space-y-6">
                {pack.variants.map((variant) => (
                  <div key={variant.id}>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      {variant.name}
                    </h3>
                    {variant.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {variant.description}
                      </p>
                    )}
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
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
          <section className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-6 text-center border border-emerald-100 dark:border-emerald-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Siap berbelanja?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Buat sesi belanja dari pack ini dan ajak teman atau keluargamu.
            </p>
            <StartShoppingButton
              variants={pack.variants}
              packSlug={pack.slug}
              packTitle={pack.title}
            />
          </section>

          {/* Back link */}
          <div>
            <Link
              href="/starter-packs"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              ← Lihat semua starter packs
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full capitalize">
      {children}
    </span>
  );
}

function IngredientRow({ item }: { item: StarterPackVariantItem }) {
  return (
    <li className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-gray-900 dark:text-gray-100 text-sm font-medium truncate">
          {item.name}
        </span>
        {item.is_optional && (
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 italic">(opsional)</span>
        )}
      </div>
      <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
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
