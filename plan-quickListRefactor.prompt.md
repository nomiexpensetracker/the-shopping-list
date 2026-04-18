# Quick List Refactor Plan

Rebrand Starter Pack module → Quick List. Simplify data model (drop variants layer). Fix quantity/unit bug.

---

## Decisions

| Topic | Decision |
|---|---|
| Branding | `starter_packs` → `quick_lists`, "Starter Pack" → "Quick List" everywhere |
| Variants | Dropped. Each quick_list is single-item-set. `starter_pack_variants` table removed. |
| Items table | `starter_pack_variant_items` → `quick_list_items`. `variant_id` FK → `quick_list_id` FK |
| Dropped columns | `cuisine`, `difficulty` removed from `quick_lists` |
| URL path | `/app/starter-packs/[slug]` → `/app/quick-lists/[slug]` |
| API route | `/api/starter-packs/[slug]/variants/[variantId]` → `/api/quick-lists/[slug]/start` |
| Import route | `/api/lists/[token]/import-variant` → `/api/lists/[token]/import-quick-list` (body: `{ quick_list_id }`) |
| Quantity/unit bug | When copying items into session or list: format item name as `"{quantity}{unit} {name}"` (e.g. `"500gr minced meat"`), session/list item quantity = 1 |

---

## DB Migration (schema-v7.sql)

```sql
-- 1. Create quick_lists (replaces starter_packs, minus cuisine/difficulty)
CREATE TABLE IF NOT EXISTS quick_lists (
  id           TEXT        PRIMARY KEY,
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  category     TEXT,
  locale       TEXT        NOT NULL DEFAULT 'id-ID',
  is_published BOOLEAN     NOT NULL DEFAULT true,
  is_featured  BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create quick_list_items (replaces starter_pack_variant_items, FK to quick_list)
CREATE TABLE IF NOT EXISTS quick_list_items (
  id            TEXT           PRIMARY KEY,
  quick_list_id TEXT           NOT NULL REFERENCES quick_lists(id) ON DELETE CASCADE,
  name          TEXT           NOT NULL,
  quantity      INTEGER        NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit          TEXT,
  is_optional   BOOLEAN        NOT NULL DEFAULT false,
  category      TEXT,
  tags          TEXT[]         DEFAULT '{}',
  default_price NUMERIC(10,2),
  position      INTEGER        NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 3. Migrate data from old tables
INSERT INTO quick_lists (id, slug, title, description, category, locale, is_published, is_featured, created_at, updated_at)
SELECT sp.id, sp.slug, sp.title, sp.description, sp.category, sp.locale, sp.is_published, sp.is_featured, sp.created_at, sp.updated_at
FROM starter_packs sp;

INSERT INTO quick_list_items (id, quick_list_id, name, quantity, unit, is_optional, category, tags, default_price, position, created_at)
SELECT spvi.id, spv.starter_pack_id, spvi.name, spvi.quantity, spvi.unit, spvi.is_optional, spvi.category, spvi.tags, spvi.default_price, spvi.position, spvi.created_at
FROM starter_pack_variant_items spvi
JOIN starter_pack_variants spv ON spv.id = spvi.variant_id
-- Only take items from the first (earliest) variant per pack to avoid duplicates
WHERE spvi.variant_id IN (
  SELECT DISTINCT ON (starter_pack_id) id FROM starter_pack_variants ORDER BY starter_pack_id, created_at
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS ql_slug_idx      ON quick_lists(slug);
CREATE INDEX IF NOT EXISTS ql_category_idx  ON quick_lists(category);
CREATE INDEX IF NOT EXISTS ql_published_idx ON quick_lists(is_published);
CREATE INDEX IF NOT EXISTS qli_ql_id_idx    ON quick_list_items(quick_list_id);

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION set_quick_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quick_list_updated_at ON quick_lists;
CREATE TRIGGER trigger_quick_list_updated_at
  BEFORE UPDATE ON quick_lists FOR EACH ROW
  EXECUTE FUNCTION set_quick_list_updated_at();

-- NOTE: Keep starter_packs / starter_pack_variants / starter_pack_variant_items alive
-- until confirmed data migration is verified. Drop separately.
```

---

## Files to Change

### Types (`src/types/dao.ts`)
- Remove `StarterPack`, `StarterPackVariant`, `StarterPackVariantItem`
- Add `QuickList`, `QuickListItem`

### Types (`src/types/dto.ts`)
- Remove `StarterPackSummary`, `StarterPackVariantWithItems`, `StarterPackDetailResponse`, `GetStarterPacksResponse`, `PostStarterPackStartResponse`
- Add `QuickListSummary`, `QuickListDetailResponse`, `GetQuickListsResponse`, `PostQuickListStartResponse`

### API Routes
| Old | New |
|---|---|
| `src/app/api/starter-packs/route.ts` | `src/app/api/quick-lists/route.ts` |
| `src/app/api/starter-packs/[slug]/route.ts` | `src/app/api/quick-lists/[slug]/route.ts` |
| `src/app/api/starter-packs/[slug]/variants/[variantId]/route.ts` | `src/app/api/quick-lists/[slug]/start/route.ts` |
| `src/app/api/lists/[token]/import-variant/route.ts` | `src/app/api/lists/[token]/import-quick-list/route.ts` |

### Frontend
| Old | New |
|---|---|
| `src/app/app/starter-packs/page.tsx` | `src/app/app/quick-lists/page.tsx` |
| `src/app/app/starter-packs/[slug]/page.tsx` | `src/app/app/quick-lists/[slug]/page.tsx` |
| `src/components/StarterPacksTopBar.tsx` | update links only |
| `src/components/StartShoppingButton.tsx` | remove variant selector, update API call |
| `src/components/AddToMyListsButton.tsx` | remove variant selector, update API call |
| `src/modules/home/components/StarterPackSection.tsx` | update copy & href |

### Redirects (`next.config.ts`)
- Add permanent redirect: `/app/starter-packs` → `/app/quick-lists`
- Add permanent redirect: `/app/starter-packs/:slug` → `/app/quick-lists/:slug`

---

## Quantity/Unit Copy Logic

When inserting items from `quick_list_items` into `items` (session) or `list_items`:

```
displayName = quantity > 1 || unit
  ? `${quantity}${unit ? unit : ""} ${name}`.trim()  // e.g. "500gr minced meat" or "2 eggs"
  : name                                              // e.g. "salt"
quantity_to_insert = 1
```

Applies in:
- `POST /api/quick-lists/[slug]/start` (session creation)
- `POST /api/lists/[token]/import-quick-list` (list import)
