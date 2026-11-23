import { findUserBySession } from '../models/authModel.js';
import { SESSION_COOKIE, hashSessionToken } from '../utils/auth.js';

export async function attachUser(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    req.user = null;
    return next();
  }
  req.user = await findUserBySession(hashSessionToken(token));
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Masuk terlebih dahulu untuk melanjutkan' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Masuk terlebih dahulu untuk melanjutkan' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang dapat melakukan tindakan ini' });
  }
  next();
}
