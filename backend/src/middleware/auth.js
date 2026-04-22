import jwt from 'jsonwebtoken';
import { readDb } from '../utils/db.js';

export function auth(requiredAdmin = false) {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const db = readDb();
      const session = db.sessions.find(s => s.id === payload.sid && s.userId === payload.userId && !s.revoked);
      const user = db.users.find(u => u.id === payload.userId);
      if (!session || !user || user.status === 'banned') return res.status(401).json({ error: 'Unauthorized' });
      if (requiredAdmin && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      req.sessionId = session.id;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
