-- The Shopping List — Database Schema v3 (Improved)
-- Run once on a fresh Neon PostgreSQL database.

-- Clean reset
DROP TABLE IF EXISTS item_activities;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS session_participants;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS template_items;

CREATE TABLE sessions (
  id           TEXT        PRIMARY KEY,
  title        TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_participants (
  id           TEXT        PRIMARY KEY,
  session_id   TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  role         TEXT        NOT NULL CHECK (role IN ('host', 'participant')) DEFAULT 'participant',
  color        TEXT        NOT NULL,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (session_id, name),
  UNIQUE (id, session_id) -- 🔥 required for composite FK
);

CREATE TABLE items (
  id              TEXT        PRIMARY KEY,
  session_id      TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT        NULL,
  quantity        INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  state           TEXT        NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'deleted', 'restored', 'collected')),
  price           NUMERIC(10,2) NULL,
  -- Ownership tracking (SAFE with composite FK)
  created_by      TEXT        NULL,
  updated_by      TEXT        NULL,
  collected_by    TEXT        NULL,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collected_at    TIMESTAMPTZ NULL,
  deleted_at      TIMESTAMPTZ NULL,

  -- 🔥 Composite Foreign Keys (critical integrity)
  FOREIGN KEY (created_by, session_id)
    REFERENCES session_participants(id, session_id)
    ON DELETE SET NULL,

  FOREIGN KEY (updated_by, session_id)
    REFERENCES session_participants(id, session_id)
    ON DELETE SET NULL,

  FOREIGN KEY (collected_by, session_id)
    REFERENCES session_participants(id, session_id)
    ON DELETE SET NULL
);

CREATE TABLE item_activities (
  id                  TEXT PRIMARY KEY,
  item_id             TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  participant_id      TEXT NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  action              TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored', 'collected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMP NOT NULL
);

CREATE TABLE template_items (
  id BIGSERIAL PRIMARY KEY,

  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX items_session_id_idx ON items(session_id);
CREATE INDEX items_state_idx ON items(state);

CREATE INDEX sessions_last_active_idx ON sessions(last_active);

CREATE INDEX session_participants_session_id_idx
  ON session_participants(session_id);

CREATE INDEX item_activities_item_id_idx
  ON item_activities(item_id);

CREATE INDEX item_activities_participant_id_idx
  ON item_activities(participant_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE created_at < NOW() - INTERVAL '2 DAY';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_expired_template()
RETURNS void AS $$
BEGIN
  DELETE FROM templates
  WHERE created_at < NOW() - INTERVAL '30 DAY';
END;
$$ LANGUAGE plpgsql;