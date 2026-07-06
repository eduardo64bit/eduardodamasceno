-- CVMKR — SQLite schema (self-hosted, no Supabase)

CREATE TABLE IF NOT EXISTS resumes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  is_base     INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS resumes_one_active
  ON resumes (is_active)
  WHERE is_active = 1;

CREATE TABLE IF NOT EXISTS profile (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  title       TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  linkedin    TEXT NOT NULL DEFAULT '',
  portfolio   TEXT NOT NULL DEFAULT '',
  summary     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS experiences (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  company     TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  start_date  TEXT NOT NULL DEFAULT '',
  end_date    TEXT,
  is_current  INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS experiences_resume_idx ON experiences(resume_id);

CREATE TABLE IF NOT EXISTS author_projects (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  start_date  TEXT NOT NULL DEFAULT '',
  end_date    TEXT,
  is_current  INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS author_projects_resume_idx ON author_projects(resume_id);

CREATE TABLE IF NOT EXISTS skills (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT '',
  items       TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS skills_resume_idx ON skills(resume_id);

CREATE TABLE IF NOT EXISTS education (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS education_resume_idx ON education(resume_id);

-- Portfolio cases (see lib/db/migrations/003_cases.sql for incremental migrate)
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
  segments      TEXT NOT NULL DEFAULT '[]',
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
