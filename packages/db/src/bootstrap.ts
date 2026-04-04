import Database from 'better-sqlite3';
import { resolveDbPath } from './path.js';
import { migrate } from './migrate.js';
import { seed } from './seed.js';

interface TableCountRow {
  count: number;
}

const hasTable = (db: Database.Database, tableName: string) =>
  Boolean(
    db
      .prepare<{ tableName: string }, { name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = @tableName"
      )
      .get({ tableName })
  );

export const bootstrapDevDatabase = () => {
  const dbPath = resolveDbPath();
  const db = new Database(dbPath);
  const needsMigration = !hasTable(db, 'matches');
  const matchCount = needsMigration
    ? 0
    : db.prepare<[], TableCountRow>('SELECT COUNT(*) as count FROM matches').get()?.count ?? 0;
  db.close();

  if (needsMigration) {
    migrate();
  }

  if (matchCount === 0) {
    seed();
  }

  return {
    dbPath,
    migrated: needsMigration,
    seeded: matchCount === 0
  };
};
