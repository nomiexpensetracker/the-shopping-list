-- The Shopping List — Database Schema v6 (Starter Packs)
-- Additive migration. Run on an existing v5 database.
-- All IDs use CUID2 (application-generated, TEXT PRIMARY KEY).

-- ============================================================
-- 1. starter_packs — curated shopping list templates (SEO)
-- ============================================================
CREATE TABLE IF NOT EXISTS starter_packs (
  id           TEXT        PRIMARY KEY,
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  category     TEXT,
  cuisine      TEXT,
  difficulty   TEXT,
  locale       TEXT        NOT NULL DEFAULT 'id-ID',
  is_published BOOLEAN     NOT NULL DEFAULT true,
  is_featured  BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS starter_packs_slug_idx      ON starter_packs(slug);
CREATE INDEX IF NOT EXISTS starter_packs_category_idx  ON starter_packs(category);
CREATE INDEX IF NOT EXISTS starter_packs_cuisine_idx   ON starter_packs(cuisine);
CREATE INDEX IF NOT EXISTS starter_packs_published_idx ON starter_packs(is_published);

-- ============================================================
-- 2. starter_pack_variants — localized variants of a pack
-- ============================================================
CREATE TABLE IF NOT EXISTS starter_pack_variants (
  id               TEXT        PRIMARY KEY,
  starter_pack_id  TEXT        NOT NULL REFERENCES starter_packs(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  locale           TEXT        NOT NULL DEFAULT 'id-ID',
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS spv_starter_pack_id_idx ON starter_pack_variants(starter_pack_id);

-- ============================================================
-- 3. starter_pack_variant_items — individual items per variant
-- ============================================================
CREATE TABLE IF NOT EXISTS starter_pack_variant_items (
  id            TEXT           PRIMARY KEY,
  variant_id    TEXT           NOT NULL REFERENCES starter_pack_variants(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS spvi_variant_id_idx ON starter_pack_variant_items(variant_id);

-- ============================================================
-- 4. updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION set_starter_pack_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_starter_pack_updated_at ON starter_packs;
CREATE TRIGGER trigger_starter_pack_updated_at
  BEFORE UPDATE ON starter_packs
  FOR EACH ROW
  EXECUTE FUNCTION set_starter_pack_updated_at();

DROP TRIGGER IF EXISTS trigger_starter_pack_variant_updated_at ON starter_pack_variants;
CREATE TRIGGER trigger_starter_pack_variant_updated_at
  BEFORE UPDATE ON starter_pack_variants
  FOR EACH ROW
  EXECUTE FUNCTION set_starter_pack_updated_at();
