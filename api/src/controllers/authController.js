import * as authModel from '../models/authModel.js';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from '../utils/auth.js';
import { ValidationError } from '../utils/validation.js';

function cookieOptions(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export async function login(req, res) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Body harus berupa objek JSON');
  }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!username || !password) {
    throw new ValidationError('Username dan password wajib diisi');
  }

  const user = await authModel.findUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await authModel.createSession(user.id, hashSessionToken(token), expiresAt);

  res.cookie(SESSION_COOKIE, token, cookieOptions(req));
  res.json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
      created_at: user.created_at,
    },
  });
}

export async function logout(req, res) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await authModel.deleteSession(hashSessionToken(token));
  }
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
  });
  res.json({ user: null });
}

export async function me(req, res) {
  res.json({ user: req.user ?? null });
}
