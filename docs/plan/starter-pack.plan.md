# 🧭 Starter Pack + SEO Execution Plan

## 🎯 Objective

Build **Starter Pack Shopping Lists** as:

* A **user acquisition engine (SEO)**
* A **faster onboarding flow**
* A **foundation for future AI features**

---

# 🧱 Phase 1 — Foundation (DO THIS FIRST)

## 1. Database Schema

### Create Tables

```sql
-- Starter Packs
CREATE TABLE starter_packs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cuisine TEXT,
  difficulty TEXT,
  locale TEXT DEFAULT 'id-ID',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variants (critical for localization)
CREATE TABLE starter_pack_variants (
  id TEXT PRIMARY KEY,
  starter_pack_id TEXT REFERENCES starter_packs(id) ON DELETE CASCADE,
  name TEXT,
  locale TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items
CREATE TABLE starter_pack_variant_items (
  id TEXT PRIMARY KEY,
  variant_id TEXT REFERENCES starter_pack_variants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT,
  is_optional BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[],
  default_price NUMERIC(10,2),
  position INTEGER
);
```

---

## 2. Seed Initial Data (IMPORTANT)

Create **5–10 high-quality packs manually**:

### Example Packs (Indonesia-first)

* Beef Rendang
* Nasi Goreng
* Sate Ayam
* BBQ Party (Indonesian)
* Camping Trip Food

👉 Each pack should have:

* 1–2 variants
* 8–15 items

---

# 🚀 Phase 2 — API Layer

## 1. Browse Starter Packs

### `GET /api/starter-packs`

Supports:

* search
* category
* cuisine
* locale
* pagination

---

## 2. Get Starter Pack Detail

### `GET /api/starter-packs/[slug]`

Returns:

* pack info
* variants
* items

---

## 3. Start Shopping (CRITICAL ENDPOINT)

### `POST /api/starter-packs/[variantId]/start`

### Flow:

1. Create session
2. Copy items into `items` table
3. Return session token

---

## Example Insert Logic

```sql
INSERT INTO items (id, session_id, name, quantity)
SELECT gen_random_uuid(), $session_id, name, quantity
FROM starter_pack_variant_items
WHERE variant_id = $variant_id;
```

---

# 🖥️ Phase 3 — Next.js Implementation

## 1. Folder Structure

```
/app
  /(marketing)
    /page.tsx
    /starter-packs
      /page.tsx
      /[slug]
        /page.tsx
        /loading.tsx
        /not-found.tsx

/api
  /starter-packs
  /starter-packs/[slug]
  /starter-packs/[variantId]/start
```

---

## 2. Server-side Data Fetching

```ts
export async function getStarterPack(slug: string) {
  const res = await fetch(`/api/starter-packs/${slug}`, {
    next: { revalidate: 3600 }
  });
  return res.json();
}
```

---

## 3. SEO Metadata

```ts
export async function generateMetadata({ params }) {
  const pack = await getStarterPack(params.slug);

  return {
    title: `${pack.title} Shopping List (Complete Ingredients)`,
    description: pack.description,
    openGraph: {
      title: pack.title,
      description: pack.description,
      images: [
        `/api/og/starter-pack?title=${encodeURIComponent(pack.title)}`
      ]
    }
  };
}
```

---

## 4. Starter Pack Page

### MUST INCLUDE:

* `<h1>` title
* ingredient list (`<ul>`)
* CTA button
* variants
* structured content

---

# 🔍 Phase 4 — SEO Optimization

## 1. URL Structure

```
/starter-packs/beef-rendang
/starter-packs/bbq-party
```

---

## 2. Page Content Structure

### Above Fold

* Title (H1)
* Description
* CTA (Start Shopping)

### Sections

1. Ingredients (SEO critical)
2. Explanation
3. Variants
4. CTA again
5. Related packs

---

## 3. Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Beef Rendang",
  "recipeIngredient": [
    "1kg beef",
    "2L coconut milk"
  ]
}
```

---

## 4. Static Generation

```ts
export async function generateStaticParams() {
  const res = await fetch('/api/starter-packs');
  const data = await res.json();

  return data.data.slice(0, 20).map(pack => ({
    slug: pack.slug
  }));
}
```

---

# 🖼️ Phase 5 — Open Graph Images

## API Route

```ts
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');

  return new ImageResponse(
    <div style={{
      width: '1200px',
      height: '630px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'white',
      fontSize: 48
    }}>
      {title}
    </div>,
    { width: 1200, height: 630 }
  );
}
```

---

# 🌍 Phase 6 — Localization (Lightweight)

## Middleware

```ts
export function middleware(req) {
  const locale = req.headers.get('accept-language')?.includes('id')
    ? 'id-ID'
    : 'en-US';

  const res = NextResponse.next();
  res.headers.set('x-locale', locale);
  return res;
}
```

---

## Currency Fix

DO NOT hardcode `"Rp"`

Use:

```ts
new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "IDR"
});
```

---

# 🚫 What NOT to Build Yet

* ❌ AI generation
* ❌ user-generated packs
* ❌ personalization engine
* ❌ ratings/reviews

---

# 🧠 Phase 7 — Future AI (Design Ready)

When ready:

### Add:

* AI-assisted item suggestions
* quantity scaling (servings)
* localization adjustments

---

# 📈 Execution Checklist

## Week 1

* [ ] Create schema
* [ ] Seed 5 packs
* [ ] Build APIs

## Week 2

* [ ] Build `/starter-packs/[slug]`
* [ ] Add SEO metadata
* [ ] Add structured data

## Week 3

* [ ] Add OG image
* [ ] Deploy
* [ ] Submit to Google Search Console

---

# 💬 Final Principle

👉 Start simple
👉 Ship fast
👉 Learn from real usage

This system is designed so:

* Phase 1 works without AI
* Phase 2 improves with data
* Phase 3 unlocks AI naturally

---

**Build this right, and you don’t just have a feature — you have a growth engine.**
