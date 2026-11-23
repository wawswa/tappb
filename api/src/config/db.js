import 'dotenv/config';
import pg from 'pg';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error('DATABASE_URL belum dikonfigurasi. Salin api/.env.example menjadi api/.env.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const query = (text, params) => pool.query(text, params);

export default pool;
