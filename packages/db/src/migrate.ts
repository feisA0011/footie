import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');

export const migrate = () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      country_code TEXT,
      level INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY,
      competition_id TEXT NOT NULL REFERENCES competitions(id),
      label TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      country_code TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      primary_position TEXT,
      birth_date TEXT,
      nationality TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      season_id TEXT NOT NULL REFERENCES seasons(id),
      competition_id TEXT NOT NULL REFERENCES competitions(id),
      kickoff_at TEXT NOT NULL,
      home_team_id TEXT NOT NULL REFERENCES teams(id),
      away_team_id TEXT NOT NULL REFERENCES teams(id),
      status TEXT NOT NULL CHECK(status IN ('scheduled','live','paused','finished','postponed','cancelled')),
      home_score INTEGER,
      away_score INTEGER,
      minute_played INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS provider_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      canonical_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_entity_id TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      fetched_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS validation_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      code TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('info','warning','error')),
      entity_id TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS publish_records (
      record_id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      promoted_at TEXT NOT NULL,
      entity_count INTEGER NOT NULL,
      validation_issue_count INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
    CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition_id);
    CREATE INDEX IF NOT EXISTS idx_provider_mappings_canonical ON provider_mappings(canonical_id);

    -- FTS5 full-text search index (stores content for retrieval)
    CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
      entity_id UNINDEXED,
      entity_type UNINDEXED,
      display_name,
      keywords,
      tokenize='unicode61'
    );
  `);

  db.close();
  console.log(`Database migrated: ${DB_PATH}`);
};

migrate();
