import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

const base = {
  users: [],
  links: [],
  clickLogs: [],
  settings: {
    smtp: { enabled: false, host: '', port: 587, email: '', password: '' },
    featureToggles: { signup: true, apiAccess: true, webhooks: true },
    rateLimits: { loginPer15Min: 10, createLinkPerMin: 30, apiPerMin: 60 }
  },
  systemLogs: [],
  sessions: []
};

function ensureDb() {
  if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(base, null, 2));
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

export function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function nowIso() { return new Date().toISOString(); }

export function appendLog(action, meta = {}) {
  const db = readDb();
  db.systemLogs.unshift({ id: nanoid(), action, meta, timestamp: nowIso() });
  db.systemLogs = db.systemLogs.slice(0, 2000);
  writeDb(db);
}
