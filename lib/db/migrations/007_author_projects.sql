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
