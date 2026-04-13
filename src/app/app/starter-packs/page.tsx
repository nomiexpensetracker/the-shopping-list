import Link from "next/link";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import type { StarterPack } from "@/types/dao";
import StarterPacksTopBar from "@/components/StarterPacksTopBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Starter Packs — Ready-Made Shopping Lists | The Shopping List",
  description:
    "Choose from a collection of ready-made shopping lists. From rendang to BBQ — start shopping in seconds.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Starter Packs — Ready-Made Shopping Lists",
    description:
      "Choose from a collection of ready-made shopping lists. From rendang to BBQ — start shopping in seconds.",
    url: "https://the-shopping-list-eight.vercel.app/app/starter-packs",
    siteName: "The Shopping List",
    type: "website",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  party: "Party",
  outdoor: "Outdoor",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

async function fetchPacks(): Promise<StarterPack[]> {
  try {
    const rows = await sql`
      SELECT id, slug, title, description, category, cuisine, difficulty, locale, is_published, is_featured, created_at, updated_at
      FROM starter_packs
      WHERE is_published = true
      ORDER BY is_featured DESC, created_at DESC
    `;
    return rows as unknown as StarterPack[];
  } catch {
    return [];
  }
}

export default async function StarterPacksPage() {
  const packs = await fetchPacks();

  const featured = packs.filter((p) => p.is_featured);
  const rest = packs.filter((p) => !p.is_featured);

  return (
    <div style={{ background: "var(--background)", minHeight: "100dvh" }}>
      <StarterPacksTopBar />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Starter Packs
          </h1>
          <p className="text-lg max-w-2xl text-muted">
            Ready-made shopping lists for every occasion. Just pick one, enter your name, and start shopping.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {packs.length === 0 && (
          <p className="text-center text-muted py-20">
            No starter packs available yet.
          </p>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-muted mb-4">
              Featured
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((pack) => (
                <PackCard key={pack.id} pack={pack} featured />
              ))}
            </div>
          </section>
        )}

        {/* All others */}
        {rest.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-muted mb-4">
              All Packs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rest.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PackCard({ pack, featured = false }: { pack: StarterPack; featured?: boolean }) {
  return (
    <Link
      href={`/app/starter-packs/${pack.slug}`}
      className="group block rounded-2xl border p-5 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      style={{
        background: featured ? "var(--brand-light)" : "var(--card)",
        borderColor: featured ? "var(--brand)" : "var(--border)",
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-base text-foreground group-hover:text-brand transition-colors">
          {pack.title}
        </h3>
        {featured && (
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--brand)", color: "#ffffff" }}
          >
            Popular
          </span>
        )}
      </div>

      {pack.description && (
        <p className="text-sm text-muted line-clamp-2 mb-3">
          {pack.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {pack.category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--border)", color: "var(--muted)" }}
          >
            {CATEGORY_LABELS[pack.category] ?? pack.category}
          </span>
        )}
        {pack.cuisine && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--border)", color: "var(--muted)" }}
          >
            {pack.cuisine}
          </span>
        )}
        {pack.difficulty && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--border)", color: "var(--muted)" }}
          >
            {DIFFICULTY_LABELS[pack.difficulty] ?? pack.difficulty}
          </span>
        )}
      </div>
    </Link>
  );
}
