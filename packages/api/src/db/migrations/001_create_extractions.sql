CREATE TABLE IF NOT EXISTS extractions (
  id TEXT PRIMARY KEY,
  document_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  zone_x REAL NOT NULL,
  zone_y REAL NOT NULL,
  zone_width REAL NOT NULL,
  zone_height REAL NOT NULL,
  extracted_text TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_extractions_created_at ON extractions(created_at DESC);
