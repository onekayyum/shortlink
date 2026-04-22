import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import linkRoutes from './routes/links.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.get('/:code', (req, res, next) => {
  req.url = `/r/${req.params.code}`;
  next();
}, linkRoutes);

app.listen(process.env.PORT || 4000, () => console.log('API running'));
