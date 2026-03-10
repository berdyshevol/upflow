import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

const dbPath = process.env.DATABASE_PATH || './upflow.sqlite';

export function getSetting(key: string): string | null {
  const db = new Database(dbPath);
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  db.close();
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  const db = new Database(dbPath);
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  db.close();
}
