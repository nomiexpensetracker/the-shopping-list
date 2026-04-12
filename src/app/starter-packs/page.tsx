import Link from "next/link";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import type { StarterPack } from "@/types/dao";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Starter Packs — Daftar Belanja Siap Pakai | The Shopping List",
  description:
    "Pilih dari koleksi daftar belanja siap pakai. Dari rendang hingga acara BBQ — mulai belanja dalam hitungan detik.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Starter Packs — Daftar Belanja Siap Pakai",
    description:
      "Pilih dari koleksi daftar belanja siap pakai. Dari rendang hingga acara BBQ — mulai belanja dalam hitungan detik.",
    url: "https://the-shopping-list-eight.vercel.app/starter-packs",
    siteName: "The Shopping List",
    type: "website",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "Makanan",
  party: "Pesta",
  outdoor: "Outdoor",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
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
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-gray-100">Starter Packs</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Starter Packs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            Daftar belanja siap pakai untuk berbagai kebutuhan. Tinggal pilih, masukkan nama, dan mulai belanja.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {packs.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            Belum ada starter pack tersedia.
          </p>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Pilihan Terpopuler
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
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Semua Pack
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rest.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function PackCard({ pack, featured = false }: { pack: StarterPack; featured?: boolean }) {
  return (
    <Link
      href={`/starter-packs/${pack.slug}`}
      className={`
        group block rounded-2xl border p-5 transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5
        ${featured
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {pack.title}
        </h3>
        {featured && (
          <span className="shrink-0 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            Populer
          </span>
        )}
      </div>

      {pack.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {pack.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {pack.category && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {CATEGORY_LABELS[pack.category] ?? pack.category}
          </span>
        )}
        {pack.cuisine && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {pack.cuisine}
          </span>
        )}
        {pack.difficulty && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {DIFFICULTY_LABELS[pack.difficulty] ?? pack.difficulty}
          </span>
        )}
      </div>
    </Link>
  );
}
