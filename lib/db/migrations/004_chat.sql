-- Portfolio chat sessions (anonymous, TTL)

CREATE TABLE IF NOT EXISTS chat_sessions (
  id                        TEXT PRIMARY KEY,
  short_code                TEXT NOT NULL UNIQUE,
  status                    TEXT NOT NULL DEFAULT 'auto',
  telegram_notify_message_id INTEGER,
  telegram_notified         INTEGER NOT NULL DEFAULT 0,
  created_at                TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at                TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at                TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_expires_idx ON chat_sessions(expires_at);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  body        TEXT NOT NULL,
  automated   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages(session_id, created_at);
