import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/post/:postId', (req, res) => {
  const db = getDb();
  const comments = db.comments
    .filter(c => c.post_id === parseInt(req.params.postId))
    .map(c => ({ ...c, author_name: db.users.find(u => u.id === c.author_id)?.name || 'Unknown' }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json({ comments });
});

router.post('/post/:postId', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });

  const db = getDb();
  const post = db.posts.find(p => p.id === parseInt(req.params.postId));
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = {
    id: Date.now(), post_id: parseInt(req.params.postId),
    author_id: req.user.id, content: content.trim(),
    created_at: new Date().toISOString()
  };
  db.comments.push(comment);
  saveDb();

  const author = db.users.find(u => u.id === comment.author_id);
  res.status(201).json({ comment: { ...comment, author_name: author?.name || 'Unknown' } });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const idx = db.comments.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Comment not found' });
  if (db.comments[idx].author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.comments.splice(idx, 1);
  saveDb();
  res.json({ message: 'Comment deleted' });
});

export default router;
