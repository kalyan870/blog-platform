import express from 'express';
import cors from 'cors';
import { initDb } from '../server/db.js';
import authRoutes from '../server/routes/auth.js';
import postRoutes from '../server/routes/posts.js';
import commentRoutes from '../server/routes/comments.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

let ready = false;

export default async function handler(req, res) {
  try {
    if (!ready) { await initDb(); ready = true; }
    return app(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
