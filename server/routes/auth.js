import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';

const router = Router();
router.get('/me', requireUser, (req, res) => res.json({ user: { id: req.userId } }));
export default router;
