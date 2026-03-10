import Database from 'better-sqlite3';
import 'dotenv/config';

const dbPath = process.env.DATABASE_PATH || './upflow.sqlite';

export interface Job {
  id: string;
  title: string;
  description: string;
  client_info?: string;
  budget?: string;
  category?: string;
  status?: string;
  created_at?: string;
}

export function jobExists(id: string): boolean {
  const db = new Database(dbPath);
  const row = db.prepare('SELECT id FROM jobs WHERE id = ?').get(id);
  db.close();
  return !!row;
}

export function saveJob(job: Job): void {
  const db = new Database(dbPath);
  db.prepare(`
    INSERT INTO jobs (id, title, description, client_info, budget, category, status)
    VALUES (@id, @title, @description, @client_info, @budget, @category, @status)
  `).run(job);
  db.close();
}

export function updateJobStatus(id: string, status: string): void {
  const db = new Database(dbPath);
  db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, id);
  db.close();
}

export function getJob(id: string): Job | undefined {
  const db = new Database(dbPath);
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
  db.close();
  return row;
}
