import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { resolve } from 'node:path';
import * as schema from './schema/index.js';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');

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
