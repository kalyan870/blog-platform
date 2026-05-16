import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  const users = getDb().users;
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });

  const hashed = bcrypt.hashSync(password, 10);
  const user = { id: Date.now(), name, email, password: hashed };
  users.push(user);
  saveDb();

  const token = generateToken({ id: user.id, email: user.email });
  res.status(201).json({ user: { id: user.id, name, email }, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = getDb().users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

router.get('/me', authenticateToken, (req, res) => {
  const user = getDb().users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
