import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

const dbPath = process.env.DATABASE_PATH || './upflow.sqlite';

function initDb() {
  const db = new Database(dbPath, { verbose: console.log });
  db.pragma('foreign_keys = ON');

  console.log(`Initializing database at: ${dbPath}`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      client_info TEXT, -- Store as JSON string
      budget TEXT,
      category TEXT, -- Quick, Greenfield, Irrelevant
      status TEXT DEFAULT 'Pending', -- Pending, Approved, Skipped
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      cover_letter TEXT,
      feedback_history TEXT, -- Store as JSON array of strings
      status TEXT DEFAULT 'Draft', -- Draft, Approved, Submitted, Won, Lost
      submitted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  console.log('Database tables created successfully.');
  db.close();
}

try {
  initDb();
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
