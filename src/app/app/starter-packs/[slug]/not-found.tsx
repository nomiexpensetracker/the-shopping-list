import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-6">🛒</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Pack not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The starter pack you&#39;re looking for doesn&#39;t exist or is no longer available.
        </p>
        <Link
          href="/app/starter-packs"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          ← View all packs
        </Link>
      </div>
    </main>
  );
}
