import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';

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

const PORT = process.env.PORT || 5000;
if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_AUTHORIZED_PARTIES) throw new Error('CLERK_SECRET_KEY and CLERK_AUTHORIZED_PARTIES are required.');
initDb().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
