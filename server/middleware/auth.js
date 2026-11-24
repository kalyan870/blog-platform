import { verifyToken } from '@clerk/backend';

export async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Sign in required.' });
  const authorizedParties = (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  if (!process.env.CLERK_SECRET_KEY || !authorizedParties.length) return res.status(503).json({ error: 'Authentication is not configured.' });
  try {
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, authorizedParties });
    if (!claims.sub) return res.status(401).json({ error: 'Invalid session.' });
    req.user = { id: claims.sub, name: claims.name || claims.email || 'Member' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}
