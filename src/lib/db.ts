import { neon } from "@neondatabase/serverless";

// Lazily initialise the client so the module can be imported at build time
// without crashing when DATABASE_URL is absent.
let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _sql = neon(url);
  }
  return _sql;
}

// Tagged-template wrapper that always resolves to Record<string,unknown>[]
// so callers don't have to fight Neon's overloaded return type.
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  const client = getSql();
  const result = await client(strings, ...values);
  // neon returns rows[] or FullQueryResults; rows are always the array entries
  if (Array.isArray(result)) {
    return result as Record<string, unknown>[];
  }
  return [];
}
