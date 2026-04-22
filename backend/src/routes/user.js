import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validators.js';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../utils/db.js';

const router = Router();
router.use(auth());

router.get('/me', (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

router.patch('/username', body('username').isLength({ min: 3, max: 32 }), handleValidation, (req, res) => {
  const db = readDb();
  const taken = db.users.some(u => u.username === req.body.username && u.id !== req.user.id);
  if (taken) return res.status(409).json({ error: 'Username taken' });
  const u = db.users.find(x => x.id === req.user.id);
  u.username = req.body.username;
  writeDb(db);
  res.json({ ok: true });
});

router.patch('/password', body('oldPassword').notEmpty(), body('newPassword').isLength({ min: 8 }), handleValidation, async (req, res) => {
  const db = readDb();
  const u = db.users.find(x => x.id === req.user.id);
  if (!(await bcrypt.compare(req.body.oldPassword, u.password))) return res.status(401).json({ error: 'Wrong password' });
  u.password = await bcrypt.hash(req.body.newPassword, 10);
  writeDb(db);
  res.json({ ok: true });
});

router.patch('/defaults', (req, res) => {
  const db = readDb();
  const u = db.users.find(x => x.id === req.user.id);
  u.settings = { ...u.settings, ...req.body };
  writeDb(db);
  res.json({ ok: true });
});

router.post('/api-key/regenerate', (req, res) => {
  const db = readDb();
  const u = db.users.find(x => x.id === req.user.id);
  u.apiKey = nanoid(32);
  writeDb(db);
  res.json({ apiKey: u.apiKey });
});

export default router;
