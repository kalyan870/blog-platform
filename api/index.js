import express from 'express';
import cors from 'cors';
import { initDb } from '../server/db.js';
import postRoutes from '../server/routes/posts.js';
import commentRoutes from '../server/routes/comments.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err?.message || 'unknown error');
  res.status(err?.statusCode || 500).json({ error: 'Request could not be completed.' });
});

let ready = false;

export default async function handler(req, res) {
  try {
    if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_AUTHORIZED_PARTIES) throw new Error('Clerk environment is not configured.');
    if (!ready) { await initDb(); ready = true; }
    return app(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
