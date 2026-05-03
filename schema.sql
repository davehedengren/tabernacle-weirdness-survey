CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  scripture_ref TEXT NOT NULL,           -- Round 1 ref (Exodus, "how it's used")
  scripture_text TEXT NOT NULL,          -- Round 1 KJV text
  context_scripture_ref TEXT,            -- Round 2 ref (Christ-centered context)
  context_scripture_text TEXT,           -- Round 2 KJV text
  meaning TEXT,                          -- one-line summary (optional)
  image_url TEXT,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voter_uuid TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  round TEXT NOT NULL CHECK(round IN ('1', '2')),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(voter_uuid, item_id, round)
);

CREATE TABLE IF NOT EXISTS state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
