import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

const BASE_URL = "https://the-shopping-list-eight.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/starter-packs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  let packRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await sql`
      SELECT slug, updated_at
      FROM starter_packs
      WHERE is_published = true
      ORDER BY updated_at DESC
    `;
    packRoutes = rows.map((r) => ({
      url: `${BASE_URL}/starter-packs/${r.slug as string}`,
      lastModified: new Date(r.updated_at as string),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If DB is unavailable at build time, return only static routes
  }

  return [...staticRoutes, ...packRoutes];
}
