-- Portfolio cases (migration v3)

CREATE TABLE IF NOT EXISTS cases (
  id            TEXT PRIMARY KEY,
  wp_id         TEXT UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL DEFAULT '',
  subtitle      TEXT NOT NULL DEFAULT '',
  cover_path    TEXT NOT NULL DEFAULT '',
  youtube_url   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  wp_source_url TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS case_content (
  case_id     TEXT PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  body_html   TEXT NOT NULL DEFAULT '',
  imported_at TEXT
);

CREATE TABLE IF NOT EXISTS case_media (
  id          TEXT PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  path        TEXT NOT NULL DEFAULT '',
  alt         TEXT NOT NULL DEFAULT '',
  caption     TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS case_media_case_idx ON case_media(case_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);
