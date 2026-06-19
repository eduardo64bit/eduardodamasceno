-- Chat: offline/online presence + owner activity timer

ALTER TABLE chat_sessions ADD COLUMN owner_presence_until TEXT;

UPDATE chat_sessions SET status = 'offline' WHERE status IN ('auto', 'closed');
UPDATE chat_sessions SET status = 'online' WHERE status = 'live';
