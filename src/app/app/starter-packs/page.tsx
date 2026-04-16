import Link from "next/link";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import type { StarterPack } from "@/types/dao";
import CommonHeader from "@/components/CommonHeader";

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
      <CommonHeader />

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
          <section className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Featured
            </p>
            <div
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {featured.map((pack, idx) => (
                <PackCard key={pack.id} pack={pack} featured isLast={idx === featured.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* All others */}
        {rest.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              All Packs
            </p>
            <div
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {rest.map((pack, idx) => (
                <PackCard key={pack.id} pack={pack} isLast={idx === rest.length - 1} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PackCard({ pack, featured = false, isLast = false }: { pack: StarterPack; featured?: boolean; isLast?: boolean }) {
  return (
    <Link
      href={`/app/starter-packs/${pack.slug}`}
      className="w-full flex items-center justify-between px-4 py-4 text-left transition active:opacity-70"
      style={{
        background: "var(--card)",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
      }}
    >
      <div className="flex flex-col min-w-0 gap-0.5 mr-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base truncate" style={{ color: "var(--foreground)" }}>
            {pack.title}
          </span>
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
          <span className="text-sm truncate" style={{ color: "var(--muted)" }}>
            {pack.description}
          </span>
        )}
      </div>
      <svg
        className="shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M9 18L15 12L9 6" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
