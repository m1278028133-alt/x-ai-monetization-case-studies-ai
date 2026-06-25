CREATE TABLE IF NOT EXISTS tweets (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  tone TEXT NOT NULL,
  angle TEXT NOT NULL,
  text TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  keyword_vector TEXT NOT NULL,
  embedding_json TEXT,
  hook TEXT,
  metadata_json TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_post_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_slots (
  id TEXT PRIMARY KEY,
  plan_date TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  tweet_id TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  execution_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(plan_date, scheduled_at)
);

CREATE TABLE IF NOT EXISTS run_logs (
  id TEXT PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS circuit_breaker (
  key TEXT PRIMARY KEY,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_failure_at TEXT,
  last_error TEXT,
  updated_at TEXT NOT NULL
);
