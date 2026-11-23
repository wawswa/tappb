import { query } from '../config/db.js';

export const publicUserColumns = 'u.id, u.username, u.display_name, u.role, u.created_at';

export async function findUserByUsername(username) {
  const result = await query(
    `SELECT id, username, display_name, password_hash, role, created_at
     FROM users WHERE lower(username) = lower($1)`,
    [username],
  );
  return result.rows[0] ?? null;
}

export async function createSession(userId, tokenHash, expiresAt) {
  await query('DELETE FROM sessions WHERE expires_at <= now()');
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export async function findUserBySession(tokenHash) {
  const result = await query(
    `SELECT ${publicUserColumns}
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash],
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(tokenHash) {
  await query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}
