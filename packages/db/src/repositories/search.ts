import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');

export interface SearchResult {
  entityId: string;
  entityType: string;
  displayName: string;
  keywords: string;
  rank: number;
}

export const searchRepo = () => {
  const db = new Database(DB_PATH, { readonly: true });

  return {
    search: (query: string, limit = 20): SearchResult[] => {
      const sanitized = query.trim().replace(/[^a-zA-Z0-9 ]/g, '');
      if (!sanitized) return [];
      const stmt = db.prepare<[string, number], SearchResult>(
        `SELECT entity_id as entityId, entity_type as entityType, display_name as displayName, keywords, rank
         FROM search_fts WHERE search_fts MATCH ? ORDER BY rank LIMIT ?`
      );
      return stmt.all(`${sanitized}*`, limit);
    },

    indexEntity: (entityId: string, entityType: string, displayName: string, keywords: string) => {
      const writeDb = new Database(DB_PATH);
      writeDb.prepare(
        `INSERT INTO search_fts(entity_id, entity_type, display_name, keywords) VALUES (?, ?, ?, ?)`
      ).run(entityId, entityType, displayName, keywords);
      writeDb.close();
    },

    clearIndex: () => {
      const writeDb = new Database(DB_PATH);
      writeDb.prepare(`DELETE FROM search_fts`).run();
      writeDb.close();
    }
  };
};
