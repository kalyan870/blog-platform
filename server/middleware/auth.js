import { getAuth } from '@clerk/express';

export function createRequireUser(resolveAuth = getAuth) {
  return function requireUser(req, res, next) {
    const { isAuthenticated, userId } = resolveAuth(req);
    if (!isAuthenticated || !userId) return res.status(401).json({ error: 'Authentication required' });
    req.userId = userId;
    return next();
  };
}

export const requireUser = createRequireUser();
