import 'dotenv/config';
import pool, { query } from '../src/config/db.js';
import { hashPassword } from '../src/utils/auth.js';

const [username, displayName, role, password] = process.argv.slice(2);

if (!username || !displayName || !role || !password) {
  console.error(
    'Usage: node scripts/create-user.js <username> <display_name> <admin|user> <password>',
  );
  process.exit(1);
}
if (!['admin', 'user'].includes(role)) {
  console.error('Role harus admin atau user');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password minimal 8 karakter');
  process.exit(1);
}

try {
  const result = await query(
    `INSERT INTO users (username, display_name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role
     RETURNING username, display_name, role`,
    [username, displayName, hashPassword(password), role],
  );
  console.log(
    `User ${result.rows[0].username} (${result.rows[0].role}) siap: ${result.rows[0].display_name}`,
  );
} finally {
  await pool.end();
}
