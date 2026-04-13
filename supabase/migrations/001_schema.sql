-- ============================================================
-- CVMKR — Schema
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── resumes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  is_base     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one resume can be active at a time
CREATE UNIQUE INDEX IF NOT EXISTS resumes_one_active
  ON resumes (is_active)
  WHERE is_active = TRUE;

-- ── profile ───────────────────────────────────────────────────────────────────
-- 1-to-1 with resumes (ON DELETE CASCADE keeps DB clean)
CREATE TABLE IF NOT EXISTS profile (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID  NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  name        TEXT  NOT NULL DEFAULT '',
  title       TEXT  NOT NULL DEFAULT '',
  location    TEXT  NOT NULL DEFAULT '',
  email       TEXT  NOT NULL DEFAULT '',
  phone       TEXT  NOT NULL DEFAULT '',
  linkedin    TEXT  NOT NULL DEFAULT '',
  summary     TEXT  NOT NULL DEFAULT ''
);

-- ── experiences ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID    NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  company     TEXT    NOT NULL DEFAULT '',
  role        TEXT    NOT NULL DEFAULT '',
  start_date  TEXT    NOT NULL DEFAULT '',
  end_date    TEXT,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT    NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS experiences_resume_idx ON experiences(resume_id);

-- ── skills ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID   NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  category    TEXT   NOT NULL DEFAULT '',
  items       TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS skills_resume_idx ON skills(resume_id);

-- ── education ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID    NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL DEFAULT '',
  institution TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS education_resume_idx ON education(resume_id);

-- ── RLS — disable for service role access (admin-only tool) ──────────────────
-- If you want public read on the active resume, enable RLS and add a policy.
-- ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public read active" ON resumes FOR SELECT USING (is_active = TRUE);
