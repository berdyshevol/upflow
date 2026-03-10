import Database from 'better-sqlite3';
import 'dotenv/config';

const dbPath = process.env.DATABASE_PATH || './upflow.sqlite';

export interface Proposal {
  id?: number;
  job_id: string;
  cover_letter: string;
  feedback_history?: string;
  status?: string;
  submitted_at?: string;
}

export function saveProposal(proposal: Proposal): number {
  const db = new Database(dbPath);
  const result = db.prepare(`
    INSERT INTO proposals (job_id, cover_letter, feedback_history, status)
    VALUES (@job_id, @cover_letter, @feedback_history, @status)
  `).run(proposal);
  db.close();
  return result.lastInsertRowid as number;
}

export function updateProposalCoverLetter(id: number, coverLetter: string, feedback: string): void {
  const db = new Database(dbPath);
  const proposal = db.prepare('SELECT feedback_history FROM proposals WHERE id = ?').get(id) as { feedback_history?: string };
  const history = JSON.parse(proposal.feedback_history || '[]');
  history.push(feedback);
  
  db.prepare('UPDATE proposals SET cover_letter = ?, feedback_history = ? WHERE id = ?').run(coverLetter, JSON.stringify(history), id);
  db.close();
}

export function updateProposalStatus(id: number, status: string): void {
  const db = new Database(dbPath);
  const submittedAt = status === 'Submitted' ? new Date().toISOString() : null;
  if (submittedAt) {
    db.prepare('UPDATE proposals SET status = ?, submitted_at = ? WHERE id = ?').run(status, submittedAt, id);
  } else {
    db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run(status, id);
  }
  db.close();
}

export function getProposal(id: number): Proposal | undefined {
  const db = new Database(dbPath);
  const row = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id) as Proposal | undefined;
  db.close();
  return row;
}
