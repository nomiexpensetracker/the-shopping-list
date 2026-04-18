import type { Metadata } from "next";
import { sql } from "@/lib/db";
import type { QuickList } from "@/types/dao";
import CommonHeader from "@/components/CommonHeader";
import QuickListsBrowser from "./QuickListsBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quick Lists — Ready-Made Shopping Lists | The Shopping List",
  description:
    "Choose from a collection of ready-made shopping lists. Start shopping in seconds.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Quick Lists — Ready-Made Shopping Lists",
    description:
      "Choose from a collection of ready-made shopping lists. Start shopping in seconds.",
    url: "https://the-shopping-list-eight.vercel.app/app/quick-lists",
    siteName: "The Shopping List",
    type: "website",
  },
};

async function fetchQuickLists(): Promise<QuickList[]> {
  try {
    const rows = await sql`
      SELECT id, slug, title, description, category, locale, is_published, is_featured, created_at, updated_at
      FROM quick_lists
      WHERE is_published = true
      ORDER BY is_featured DESC, created_at DESC
    `;
    return rows as unknown as QuickList[];
  } catch {
    return [];
  }
}

export default async function QuickListsPage() {
  const lists = await fetchQuickLists();

  return (
    <div style={{ background: "var(--background)", minHeight: "100dvh" }}>
      <CommonHeader />

      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Quick Lists
          </h1>
          <p className="text-lg max-w-2xl text-muted">
            Ready-made shopping lists for every occasion. Just pick one, enter your name, and start shopping.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {lists.length === 0 ? (
          <p className="text-center text-muted py-20">
            No quick lists available yet.
          </p>
        ) : (
          <QuickListsBrowser lists={lists} />
        )}
      </div>
    </div>
  );
}
