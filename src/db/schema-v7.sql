-- The Shopping List — Database Schema v7 (Quick Lists)
-- Replaces Starter Packs with Quick Lists (no variant layer).
-- Run on an existing v6 database.

-- ============================================================
-- 1. quick_lists — replaces starter_packs (minus cuisine/difficulty)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS ql_slug_idx      ON quick_lists(slug);
CREATE INDEX IF NOT EXISTS ql_category_idx  ON quick_lists(category);
CREATE INDEX IF NOT EXISTS ql_published_idx ON quick_lists(is_published);

-- ============================================================
-- 2. quick_list_items — replaces starter_pack_variant_items
--    FK points directly to quick_list (no variant indirection)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS qli_ql_id_idx ON quick_list_items(quick_list_id);

-- ============================================================
-- 3. updated_at trigger for quick_lists
-- ============================================================
CREATE OR REPLACE FUNCTION set_quick_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quick_list_updated_at ON quick_lists;
CREATE TRIGGER trigger_quick_list_updated_at
  BEFORE UPDATE ON quick_lists
  FOR EACH ROW
  EXECUTE FUNCTION set_quick_list_updated_at();

-- ============================================================
-- 4. Data migration from old tables
--    Migrates each starter_pack as one quick_list.
--    Items taken from the first (earliest) variant per pack only.
-- ============================================================
INSERT INTO quick_lists (id, slug, title, description, category, locale, is_published, is_featured, created_at, updated_at)
SELECT
  sp.id, sp.slug, sp.title, sp.description, sp.category,
  sp.locale, sp.is_published, sp.is_featured, sp.created_at, sp.updated_at
FROM starter_packs sp
ON CONFLICT (id) DO NOTHING;

INSERT INTO quick_list_items (id, quick_list_id, name, quantity, unit, is_optional, category, tags, default_price, position, created_at)
SELECT
  spvi.id,
  spv.starter_pack_id,
  spvi.name,
  spvi.quantity,
  spvi.unit,
  spvi.is_optional,
  spvi.category,
  spvi.tags,
  spvi.default_price,
  spvi.position,
  spvi.created_at
FROM starter_pack_variant_items spvi
JOIN starter_pack_variants spv ON spv.id = spvi.variant_id
WHERE spvi.variant_id IN (
  SELECT DISTINCT ON (starter_pack_id) id
  FROM starter_pack_variants
  ORDER BY starter_pack_id, created_at
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTE: Old tables (starter_packs, starter_pack_variants,
-- starter_pack_variant_items) are kept alive until migration
-- is verified. Drop them separately after confirming data.
-- ============================================================
