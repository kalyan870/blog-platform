import { Router } from 'express';
import { blogRepository } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { getDisplayName } from '../clerk-profile.js';

const router = Router();
const idIsValid = (id) => /^\d+$/.test(id) && Number(id) > 0;
const storageError = (res) => res.status(503).json({ error: 'Blog storage is temporarily unavailable' });

router.get('/', async (_req, res) => {
  try { res.json({ posts: await blogRepository.listPosts() }); }
  catch { storageError(res); }
});

router.get('/:id', async (req, res) => {
  if (!idIsValid(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    const post = await blogRepository.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comments = await blogRepository.listComments(req.params.id);
    res.json({ post, comments });
  } catch { storageError(res); }
});

router.post('/', requireUser, async (req, res) => {
  const { title, content, excerpt } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.length > 200 || typeof content !== 'string' || !content.trim() || content.length > 100000) {
    return res.status(400).json({ error: 'Title and content are required and must be within the allowed size' });
  }
  const safeExcerpt = typeof excerpt === 'string' ? excerpt.trim().slice(0, 300) : `${content.trim().slice(0, 150)}...`;
  try {
    const authorName = await getDisplayName(req.userId);
    const post = await blogRepository.createPost(req.userId, authorName, { title: title.trim(), content, excerpt: safeExcerpt });
    res.status(201).json({ post });
  } catch { storageError(res); }
});

router.put('/:id', requireUser, async (req, res) => {
  if (!idIsValid(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
  const { title, content, excerpt } = req.body ?? {};
  if ((title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 200)) ||
      (content !== undefined && (typeof content !== 'string' || !content.trim() || content.length > 100000)) ||
      (excerpt !== undefined && (typeof excerpt !== 'string' || excerpt.length > 300))) {
    return res.status(400).json({ error: 'Invalid post content' });
  }
  try {
    const current = await blogRepository.getPost(req.params.id);
    if (!current || current.author_id !== req.userId) return res.status(404).json({ error: 'Post not found' });
    const post = await blogRepository.updatePost(req.userId, req.params.id, {
      title: title?.trim() ?? current.title,
      content: content ?? current.content,
      excerpt: excerpt?.trim() ?? current.excerpt,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch { storageError(res); }
});

router.delete('/:id', requireUser, async (req, res) => {
  if (!idIsValid(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    if (!(await blogRepository.deletePost(req.userId, req.params.id))) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch { storageError(res); }
});

export default router;
