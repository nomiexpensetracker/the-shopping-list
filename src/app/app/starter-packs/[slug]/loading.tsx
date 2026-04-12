export default function Loading() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
          <div className="h-9 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
          <div className="h-5 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
          <div className="h-5 w-4/5 bg-gray-100 dark:bg-gray-800 rounded mb-6" />
          <div className="h-12 w-40 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
