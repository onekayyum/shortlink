import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { readDb, writeDb } from '../utils/db.js';

const router = Router();
router.use(auth(true));

router.get('/stats', (req, res) => {
  const db = readDb();
  res.json({ users: db.users.length, links: db.links.length, clicks: db.clickLogs.length, logs: db.systemLogs.slice(0, 50) });
});
router.get('/users', (req, res) => res.json(readDb().users.map(({ password, ...u }) => u)));
router.patch('/users/:id/status', (req, res) => {
  const db = readDb();
  const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  u.status = req.body.status;
  writeDb(db);
  res.json({ ok: true });
});
router.delete('/users/:id', (req, res) => {
  const db = readDb();
  db.users = db.users.filter(u => u.id !== req.params.id);
  db.links = db.links.filter(l => l.userId !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});
router.get('/links', (req, res) => res.json(readDb().links));
router.delete('/links/:id', (req, res) => {
  const db = readDb();
  db.links = db.links.filter(l => l.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});
router.get('/settings', (req, res) => res.json(readDb().settings));
router.patch('/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json({ ok: true });
});

export default router;
