CREATE TABLE IF NOT EXISTS dashboard_members (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dashboard_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  stamp TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS dashboard_sessions_expiry ON dashboard_sessions(expires);
CREATE TABLE IF NOT EXISTS auth_attempts (
  key TEXT PRIMARY KEY NOT NULL,
  window INTEGER NOT NULL,
  count INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
