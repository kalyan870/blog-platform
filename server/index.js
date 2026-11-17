import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(clerkMiddleware());
if (allowedOrigins.length) app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '256kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, configured: { clerk: Boolean(process.env.CLERK_SECRET_KEY), database: Boolean(process.env.DATABASE_URL) } }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use((error, _req, res, _next) => {
  console.error('Request failed:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
