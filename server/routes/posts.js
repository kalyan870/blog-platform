import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const posts = db.posts.map(p => {
    const author = db.users.find(u => u.id === p.author_id);
    const commentCount = db.comments.filter(c => c.post_id === p.id).length;
    return { ...p, author_name: author?.name || 'Unknown', comment_count: commentCount };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ posts });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const post = db.posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const author = db.users.find(u => u.id === post.author_id);
  const comments = db.comments
    .filter(c => c.post_id === post.id)
    .map(c => ({ ...c, author_name: db.users.find(u => u.id === c.author_id)?.name || 'Unknown' }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json({ post: { ...post, author_name: author?.name || 'Unknown' }, comments });
});

router.post('/', authenticateToken, (req, res) => {
  const { title, content, excerpt } = req.body;
  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const now = new Date().toISOString();
  const post = {
    id: Date.now(), author_id: req.user.id,
    title: title.trim(), content, excerpt: excerpt || content.substring(0, 150) + '...',
    created_at: now, updated_at: now
  };
  getDb().posts.unshift(post);
  saveDb();
  res.status(201).json({ post });
});

router.put('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const post = db.posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const { title, content, excerpt } = req.body;
  if (title !== undefined) post.title = title.trim();
  if (content !== undefined) post.content = content;
  if (excerpt !== undefined) post.excerpt = excerpt;
  post.updated_at = new Date().toISOString();
  saveDb();
  res.json({ post });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const idx = db.posts.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (db.posts[idx].author_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.posts.splice(idx, 1);
  db.comments = db.comments.filter(c => c.post_id !== parseInt(req.params.id));
  saveDb();
  res.json({ message: 'Post deleted' });
});

export default router;
