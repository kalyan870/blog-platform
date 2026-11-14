import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  return secret;
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  let secret;
  try { secret = getJwtSecret(); }
  catch { return res.status(500).json({ error: 'Authentication is not configured.' }); }
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
