import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { nanoid } from 'nanoid';
import { handleValidation, sanitize } from '../middleware/validators.js';
import { appendLog, nowIso, readDb, writeDb } from '../utils/db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true });

router.post('/signup',
  body('username').isLength({ min: 3, max: 32 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 8, max: 100 }),
  handleValidation,
  async (req, res) => {
    const db = readDb();
    const username = sanitize(req.body.username);
    if (db.users.some(u => u.username === username)) return res.status(409).json({ error: 'Username already exists' });
    const user = {
      id: nanoid(), username,
      password: await bcrypt.hash(req.body.password, 10),
      apiKey: nanoid(32), role: db.users.length === 0 ? 'admin' : 'user',
      status: 'active', failedLoginCount: 0, lockedUntil: null,
      settings: { defaultDomain: '', defaultExpiryHours: null, lastLinkPrefs: {} },
      createdAt: nowIso()
    };
    db.users.push(user);
    writeDb(db);
    appendLog('user.signup', { userId: user.id });
    res.json({ ok: true });
  }
);

router.post('/login', loginLimit,
  body('username').notEmpty(),
  body('password').notEmpty(),
  handleValidation,
  async (req, res) => {
    const db = readDb();
    const username = sanitize(req.body.username);
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) return res.status(423).json({ error: 'Account locked' });
    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        user.failedLoginCount = 0;
      }
      writeDb(db);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    const sid = nanoid();
    db.sessions.push({ id: sid, userId: user.id, createdAt: nowIso(), revoked: false });
    writeDb(db);
    const token = jwt.sign({ userId: user.id, sid }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  }
);

router.post('/logout-all', auth(), (req, res) => {
  const db = readDb();
  db.sessions = db.sessions.map(s => s.userId === req.user.id ? { ...s, revoked: true } : s);
  writeDb(db);
  res.json({ ok: true });
});

export default router;
