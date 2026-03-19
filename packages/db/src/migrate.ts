import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');

export const migrate = () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      country_code TEXT, level INTEGER, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY, competition_id TEXT NOT NULL REFERENCES competitions(id),
      label TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS managers (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      nationality TEXT, birth_date TEXT, description TEXT,
      current_team_id TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      country_code TEXT, founded INTEGER, stadium TEXT,
      stadium_capacity INTEGER, nickname TEXT, description TEXT,
      primary_color TEXT, manager_id TEXT REFERENCES managers(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
      primary_position TEXT, birth_date TEXT, nationality TEXT,
      current_team_id TEXT REFERENCES teams(id), height_cm INTEGER,
      weight_kg INTEGER, description TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY, season_id TEXT NOT NULL REFERENCES seasons(id),
      competition_id TEXT NOT NULL REFERENCES competitions(id),
      kickoff_at TEXT NOT NULL, home_team_id TEXT NOT NULL REFERENCES teams(id),
      away_team_id TEXT NOT NULL REFERENCES teams(id),
      status TEXT NOT NULL CHECK(status IN ('scheduled','live','paused','finished','postponed','cancelled')),
      home_score INTEGER, away_score INTEGER, minute_played INTEGER,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS player_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL REFERENCES players(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      season_label TEXT NOT NULL,
      competition_slug TEXT NOT NULL DEFAULT 'premier-league',
      appearances INTEGER NOT NULL DEFAULT 0,
      starts INTEGER NOT NULL DEFAULT 0,
      minutes_played INTEGER NOT NULL DEFAULT 0,
      goals INTEGER NOT NULL DEFAULT 0,
      assists INTEGER NOT NULL DEFAULT 0,
      shots INTEGER NOT NULL DEFAULT 0,
      shots_on_target INTEGER NOT NULL DEFAULT 0,
      xg REAL NOT NULL DEFAULT 0,
      xa REAL NOT NULL DEFAULT 0,
      passes INTEGER NOT NULL DEFAULT 0,
      pass_accuracy REAL NOT NULL DEFAULT 0,
      key_passes INTEGER NOT NULL DEFAULT 0,
      dribbles_completed INTEGER NOT NULL DEFAULT 0,
      tackles INTEGER NOT NULL DEFAULT 0,
      interceptions INTEGER NOT NULL DEFAULT 0,
      yellow_cards INTEGER NOT NULL DEFAULT 0,
      red_cards INTEGER NOT NULL DEFAULT 0,
      free_kicks INTEGER NOT NULL DEFAULT 0,
      penalties_scored INTEGER NOT NULL DEFAULT 0,
      penalties_taken INTEGER NOT NULL DEFAULT 0,
      throw_ins INTEGER NOT NULL DEFAULT 0,
      distance_km REAL NOT NULL DEFAULT 0,
      top_speed_kmh REAL NOT NULL DEFAULT 0,
      UNIQUE(player_id, team_id, season_label, competition_slug)
    );
    CREATE TABLE IF NOT EXISTS manager_stints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manager_id TEXT NOT NULL REFERENCES managers(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      started_at TEXT NOT NULL, ended_at TEXT,
      is_current INTEGER NOT NULL DEFAULT 0,
      matches INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      draws INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      trophies TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS player_career (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL REFERENCES players(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      started_at TEXT NOT NULL, ended_at TEXT,
      is_current INTEGER NOT NULL DEFAULT 0,
      appearances INTEGER NOT NULL DEFAULT 0,
      goals INTEGER NOT NULL DEFAULT 0,
      assists INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS provider_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, canonical_id TEXT NOT NULL,
      entity_type TEXT NOT NULL, provider TEXT NOT NULL,
      provider_entity_id TEXT NOT NULL, confidence REAL NOT NULL DEFAULT 1.0,
      fetched_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS validation_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT, batch_id TEXT NOT NULL,
      code TEXT NOT NULL, severity TEXT NOT NULL, entity_id TEXT,
      message TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS publish_records (
      record_id TEXT PRIMARY KEY, batch_id TEXT NOT NULL,
      promoted_at TEXT NOT NULL, entity_count INTEGER NOT NULL,
      validation_issue_count INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
    CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition_id);
    CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
    CREATE INDEX IF NOT EXISTS idx_player_stats_team ON player_stats(team_id);
    CREATE INDEX IF NOT EXISTS idx_manager_stints_manager ON manager_stints(manager_id);
    CREATE INDEX IF NOT EXISTS idx_player_career_player ON player_career(player_id);
    CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
      entity_id UNINDEXED, entity_type UNINDEXED,
      display_name, keywords, tokenize='unicode61'
    );
  `);

  db.close();
  console.log(`Database migrated: ${DB_PATH}`);
};

migrate();
