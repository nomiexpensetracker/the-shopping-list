-- The Shopping List — Database Schema v5 (List-First Architecture)
-- Additive migration on top of v4. Run on an existing v4 database.
-- Safe to run multiple times (IF NOT EXISTS / CREATE OR REPLACE throughout).

-- ============================================================
-- 1. lists — persistent personal shopping lists (no expiry)
-- ============================================================
CREATE TABLE IF NOT EXISTS lists (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. list_items — items belonging to a list
--    Two states only: active (default) and deleted (soft).
-- ============================================================
CREATE TABLE IF NOT EXISTS list_items (
  id           TEXT        PRIMARY KEY,
  list_id      TEXT        NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  state        TEXT        NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'deleted')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Add list_id to sessions
--    NULL = Quick Shop session (no parent list).
--    NOT NULL = spawned from a list via POST /api/lists/[token]/sessions.
-- ============================================================
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS list_id TEXT NULL REFERENCES lists(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS list_items_list_id_idx ON list_items(list_id);
CREATE INDEX IF NOT EXISTS sessions_list_id_idx   ON sessions(list_id);

-- ============================================================
-- 5. updated_at trigger for list_items
-- ============================================================
CREATE OR REPLACE FUNCTION set_list_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_list_item_updated_at ON list_items;
CREATE TRIGGER trigger_list_item_updated_at
  BEFORE UPDATE ON list_items
  FOR EACH ROW
  EXECUTE FUNCTION set_list_item_updated_at();

-- ============================================================
-- 6. Cleanup: delete lists idle for more than 1 year
--    Wire this up to the same pg_cron job as delete_expired_sessions().
-- ============================================================
CREATE OR REPLACE FUNCTION delete_idle_lists()
RETURNS void AS $$
BEGIN
  DELETE FROM lists
  WHERE last_active < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
