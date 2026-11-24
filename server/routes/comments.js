import { Router } from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const validId = (value) => /^\d+$/.test(value) && Number(value) > 0;

router.get('/post/:postId', async (req, res, next) => {
  if (!validId(req.params.postId)) return res.status(400).json({ error: 'Invalid post id.' });
  try {
    const comments = await query`SELECT id, post_id, author_id, author_name, content, created_at FROM comments WHERE post_id = ${Number(req.params.postId)} ORDER BY created_at`;
    res.json({ comments });
  } catch (error) { next(error); }
});

router.post('/post/:postId', authenticateToken, async (req, res, next) => {
  if (!validId(req.params.postId)) return res.status(400).json({ error: 'Invalid post id.' });
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  if (!content || content.length > 5000) return res.status(400).json({ error: 'Comment must contain 1 to 5000 characters.' });
  try {
    const [comment] = await query`INSERT INTO comments (post_id, author_id, author_name, content) SELECT id, ${req.user.id}, ${req.user.name}, ${content} FROM posts WHERE id = ${Number(req.params.postId)} RETURNING *`;
    if (!comment) return res.status(404).json({ error: 'Post not found.' });
    res.status(201).json({ comment });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid comment id.' });
  try {
    const deleted = await query`DELETE FROM comments WHERE id = ${Number(req.params.id)} AND author_id = ${req.user.id} RETURNING id`;
    if (!deleted.length) return res.status(404).json({ error: 'Comment not found.' });
    res.json({ message: 'Comment deleted.' });
  } catch (error) { next(error); }
});

export default router;
