import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.VERCEL
  ? path.join('/tmp', 'transcontinenta-chatbot')
  : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'conversations.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      title TEXT NOT NULL,
      message_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
  `);

  return db;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

export interface Conversation {
  id: string;
  created_at: number;
  updated_at: number;
  title: string;
  message_count: number;
  messages?: Message[];
}

export function createConversation(id: string, title: string): Conversation {
  const db = getDb();
  const now = Date.now();

  db.prepare(`
    INSERT INTO conversations (id, created_at, updated_at, title, message_count)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, now, now, title);

  return { id, created_at: now, updated_at: now, title, message_count: 0 };
}

export function addMessage(conversationId: string, message: Omit<Message, 'created_at'> & { created_at?: number }): void {
  const db = getDb();
  const now = message.created_at || Date.now();

  db.prepare(`
    INSERT OR REPLACE INTO messages (id, conversation_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(message.id, conversationId, message.role, message.content, now);

  db.prepare(`
    UPDATE conversations SET updated_at = ?, message_count = message_count + 1 WHERE id = ?
  `).run(now, conversationId);
}

export function getConversation(id: string): Conversation | null {
  const db = getDb();
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as Conversation | undefined;
  if (!conv) return null;

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(id) as Message[];

  return { ...conv, messages };
}

export function listConversations(limit = 50): Conversation[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ?'
  ).all(limit) as Conversation[];
}

export function getStats() {
  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  const todayCount = (db.prepare(
    'SELECT COUNT(*) as count FROM conversations WHERE created_at >= ?'
  ).get(todayTs) as { count: number }).count;

  const totalCount = (db.prepare(
    'SELECT COUNT(*) as count FROM conversations'
  ).get() as { count: number }).count;

  const avgMessages = (db.prepare(
    'SELECT AVG(message_count) as avg FROM conversations WHERE message_count > 0'
  ).get() as { avg: number | null }).avg || 0;

  return {
    today: todayCount,
    total: totalCount,
    avgMessagesPerConversation: Math.round(avgMessages * 10) / 10,
  };
}

export function updateConversationTitle(id: string, title: string): void {
  const db = getDb();
  db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, id);
}
