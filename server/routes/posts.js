import { Router } from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const validId = (value) => /^\d+$/.test(value) && Number(value) > 0;

router.get('/', async (_req, res, next) => {
  try {
    const posts = await query`SELECT p.*, count(c.id)::int AS comment_count FROM posts p LEFT JOIN comments c ON c.post_id = p.id GROUP BY p.id ORDER BY p.created_at DESC`;
    res.json({ posts });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post id.' });
  try {
    const [post] = await query`SELECT p.*, count(c.id)::int AS comment_count FROM posts p LEFT JOIN comments c ON c.post_id = p.id WHERE p.id = ${Number(req.params.id)} GROUP BY p.id`;
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const comments = await query`SELECT id, post_id, author_id, author_name, content, created_at FROM comments WHERE post_id = ${post.id} ORDER BY created_at`;
    res.json({ post, comments });
  } catch (error) { next(error); }
});

router.post('/', authenticateToken, async (req, res, next) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : content.slice(0, 150);
  if (!title || title.length > 180 || !content || content.length > 50000 || excerpt.length > 300) return res.status(400).json({ error: 'Check title, content, and excerpt lengths.' });
  try {
    const [post] = await query`INSERT INTO posts (author_id, author_name, title, content, excerpt) VALUES (${req.user.id}, ${req.user.name}, ${title}, ${content}, ${excerpt}) RETURNING *`;
    res.status(201).json({ post: { ...post, comment_count: 0 } });
  } catch (error) { next(error); }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post id.' });
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : null;
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : null;
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : null;
  if (title !== null && (!title || title.length > 180) || content !== null && (!content || content.length > 50000) || excerpt !== null && excerpt.length > 300) return res.status(400).json({ error: 'Invalid post fields.' });
  try {
    const [post] = await query`UPDATE posts SET title = COALESCE(${title}, title), content = COALESCE(${content}, content), excerpt = COALESCE(${excerpt}, excerpt), updated_at = now() WHERE id = ${Number(req.params.id)} AND author_id = ${req.user.id} RETURNING *`;
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post id.' });
  try {
    const deleted = await query`DELETE FROM posts WHERE id = ${Number(req.params.id)} AND author_id = ${req.user.id} RETURNING id`;
    if (!deleted.length) return res.status(404).json({ error: 'Post not found.' });
    res.json({ message: 'Post deleted.' });
  } catch (error) { next(error); }
});

export default router;
