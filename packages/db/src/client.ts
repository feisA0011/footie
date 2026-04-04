import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/index.js';
import { resolveDbPath } from './path.js';

const DB_PATH = resolveDbPath();

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (!_db) {
    const sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    _db = drizzle(sqlite, { schema });
  }
  return _db;
};

export type Db = ReturnType<typeof getDb>;
