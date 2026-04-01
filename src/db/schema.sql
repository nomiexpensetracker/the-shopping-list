-- The Shopping List — Database Schema
-- Run once on a fresh Neon PostgreSQL database.

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT        PRIMARY KEY,               -- CUID2 unguessable token
  title       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()      -- bump on every write; used for TTL cleanup
);

CREATE TABLE IF NOT EXISTS items (
  id                TEXT        PRIMARY KEY,          -- CUID2
  session_id        TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  quantity          INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  state             TEXT        NOT NULL DEFAULT 'added'
                                CHECK (state IN ('added', 'collected', 'deleted')),
  price             NUMERIC(10,2)  NULL,              -- optional; only when collected
  contributor_label TEXT        NULL,                 -- anonymous display name of collector
  edit_at           TIMESTAMPTZ NOT NULL DEFAULT NOW() -- last-write-wins conflict key
);

CREATE INDEX IF NOT EXISTS items_session_id_idx ON items(session_id);
CREATE INDEX IF NOT EXISTS sessions_last_active_idx ON sessions(last_active);
