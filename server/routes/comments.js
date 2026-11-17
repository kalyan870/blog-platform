import { Router } from 'express';
import { blogRepository } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { getDisplayName } from '../clerk-profile.js';

const router = Router();
const idIsValid = (id) => /^\d+$/.test(id) && Number(id) > 0;
const storageError = (res) => res.status(503).json({ error: 'Blog storage is temporarily unavailable' });

router.get('/post/:postId', async (req, res) => {
  if (!idIsValid(req.params.postId)) return res.status(400).json({ error: 'Invalid post id' });
  try { res.json({ comments: await blogRepository.listComments(req.params.postId) }); }
  catch { storageError(res); }
});

router.post('/post/:postId', requireUser, async (req, res) => {
  if (!idIsValid(req.params.postId)) return res.status(400).json({ error: 'Invalid post id' });
  const { content } = req.body ?? {};
  if (typeof content !== 'string' || !content.trim() || content.length > 5000) return res.status(400).json({ error: 'Comment must contain 1 to 5000 characters' });
  try {
    const post = await blogRepository.getPost(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const authorName = await getDisplayName(req.userId);
    const comment = await blogRepository.createComment(req.userId, authorName, req.params.postId, content.trim());
    res.status(201).json({ comment });
  } catch { storageError(res); }
});

router.delete('/:id', requireUser, async (req, res) => {
  if (!idIsValid(req.params.id)) return res.status(400).json({ error: 'Invalid comment id' });
  try {
    if (!(await blogRepository.deleteComment(req.userId, req.params.id))) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch { storageError(res); }
});

export default router;
