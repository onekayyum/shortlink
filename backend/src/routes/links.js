import { Router } from 'express';
import { body } from 'express-validator';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { auth } from '../middleware/auth.js';
import { handleValidation, sanitize } from '../middleware/validators.js';
import { appendLog, nowIso, readDb, writeDb } from '../utils/db.js';
import { getCountryFromIp, parseDevice, parseReferrer } from '../services/analytics.js';
import { fingerprint, isMaliciousUrl } from '../services/security.js';

const router = Router();
const seen = new Map();

const createLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60 });

router.post('/', auth(), createLimiter,
  body('originalUrl').isURL(),
  body('shortCode').optional().isLength({ min: 3, max: 32 }).matches(/^[a-zA-Z0-9_-]+$/),
  handleValidation,
  async (req, res) => {
    const db = readDb();
    if (isMaliciousUrl(req.body.originalUrl)) return res.status(400).json({ error: 'Blocked URL' });
    const shortCode = sanitize(req.body.shortCode || nanoid(7));
    if (db.links.some(l => l.shortCode === shortCode)) return res.status(409).json({ error: 'Slug already in use' });
    const link = {
      id: nanoid(), userId: req.user.id, originalUrl: req.body.originalUrl, shortCode,
      settings: {
        expiryAt: req.body.expiryAt || null,
        passwordHash: req.body.password ? await bcrypt.hash(req.body.password, 10) : null,
        geoTargeting: req.body.geoTargeting || {},
        deviceTargeting: req.body.deviceTargeting || {},
        fallbackUrl: req.body.fallbackUrl || req.body.originalUrl,
        retargetingPixel: req.body.retargetingPixel || '',
        webhookUrl: req.body.webhookUrl || ''
      },
      createdAt: nowIso(), clicks: 0
    };
    db.links.push(link);
    req.user.settings.lastLinkPrefs = req.body.lastPrefs || {};
    writeDb(db);
    res.json({ link, shortUrl: `${process.env.BASE_URL}/${shortCode}` });
  }
);

router.get('/', auth(), (req, res) => {
  const db = readDb();
  const mine = db.links.filter(l => l.userId === req.user.id);
  res.json(mine);
});

router.get('/analytics/:id', auth(), (req, res) => {
  const db = readDb();
  const link = db.links.find(l => l.id === req.params.id && l.userId === req.user.id);
  if (!link) return res.status(404).json({ error: 'Not found' });
  const logs = db.clickLogs.filter(c => c.linkId === link.id);
  const daily = logs.reduce((a, c) => {
    const d = c.timestamp.slice(0, 10);
    a[d] = (a[d] || 0) + 1;
    return a;
  }, {});
  const referrers = logs.reduce((a, c) => ({ ...a, [c.referrer]: (a[c.referrer] || 0) + 1 }), {});
  res.json({ totalClicks: logs.length, daily, referrers, logs: logs.slice(0, 100) });
});

router.post('/api/create', apiLimiter, (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const db = readDb();
  const user = db.users.find(u => u.apiKey === apiKey && u.status === 'active');
  if (!user) return res.status(401).json({ error: 'Invalid key' });
  req.user = user;
  return router.handle({ ...req, url: '/', method: 'POST', headers: { ...req.headers, authorization: '' } }, res);
});

router.get('/r/:code', async (req, res) => {
  const db = readDb();
  const link = db.links.find(l => l.shortCode === req.params.code);
  if (!link) return res.status(404).send('Not found');
  if (link.settings.expiryAt && new Date(link.settings.expiryAt) < new Date()) return res.status(410).send('Link Expired');

  if (link.settings.passwordHash) {
    const provided = req.query.pwd;
    if (!provided || !(await bcrypt.compare(String(provided), link.settings.passwordHash))) {
      return res.status(401).send('Password required. Add ?pwd=your_password');
    }
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const fp = fingerprint(req);
  const now = Date.now();
  if (!seen.has(fp) || now - seen.get(fp) > 30000) {
    seen.set(fp, now);
    const ua = req.headers['user-agent'] || '';
    const { device, os } = parseDevice(ua);
    const country = await getCountryFromIp(ip);
    const referrer = parseReferrer(req.headers.referer || '');
    db.clickLogs.push({ id: nanoid(), linkId: link.id, timestamp: nowIso(), ip, country, device, os, referrer });
    link.clicks += 1;
    appendLog('link.click', { linkId: link.id, ip, country, device, referrer });
    if (link.settings.webhookUrl) {
      fetch(link.settings.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkId: link.id, timestamp: nowIso(), ip, country, device, referrer }) }).catch(() => {});
    }
    writeDb(db);
  }

  let dest = link.originalUrl;
  if (link.settings.geoTargeting[country]) dest = link.settings.geoTargeting[country];
  if (link.settings.deviceTargeting[device]) dest = link.settings.deviceTargeting[device];
  if (!dest) dest = link.settings.fallbackUrl;
  if (link.settings.retargetingPixel) res.setHeader('X-Retargeting-Pixel', link.settings.retargetingPixel);
  res.redirect(dest);
});

export default router;
