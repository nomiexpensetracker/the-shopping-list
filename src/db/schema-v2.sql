-- The Shopping List — Database Schema v2
-- Run once on a fresh Neon PostgreSQL database.

DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS session_participants;

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT        PRIMARY KEY,
  title       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_participants (
  id                TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  color             TEXT        NOT NULL,
  session_id        TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (session_id, name)
);

CREATE TABLE IF NOT EXISTS items (
  id                TEXT        PRIMARY KEY,
  session_id        TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  description       TEXT        NULL,
  quantity          INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  state             TEXT        NOT NULL DEFAULT 'added' CHECK (state IN ('added', 'collected', 'deleted')),
  price             NUMERIC(10,2) NULL,
  created_by        TEXT        NULL REFERENCES session_participants(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        TEXT        NULL REFERENCES session_participants(id),
  updated_at        TIMESTAMPTZ NULL,
  collected_by      TEXT        NULL REFERENCES session_participants(id),
  collected_at      TIMESTAMPTZ NULL,
);

CREATE INDEX IF NOT EXISTS items_session_id_idx ON items(session_id);
CREATE INDEX IF NOT EXISTS sessions_last_active_idx ON sessions(last_active);
CREATE INDEX IF NOT EXISTS session_participants_session_id_idx ON session_participants(session_id);
