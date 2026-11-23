import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import birdRoutes from './routes/birdRoutes.js';
import sightingRoutes from './routes/sightingRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { attachUser } from './middleware/auth.js';
import { ValidationError } from './utils/validation.js';

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/birds', birdRoutes);
app.use('/api/sightings', sightingRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body JSON tidak valid' });
  }
  if (err instanceof ValidationError || err?.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.code === '23503') {
    return res.status(400).json({ error: 'Burung yang dirujuk tidak ditemukan' });
  }
  if (err?.code === '23505') {
    return res.status(400).json({ error: 'Data duplikat: nama atau slug sudah dipakai' });
  }
  if (err?.code === '22P02') {
    return res.status(400).json({ error: 'Format data tidak valid' });
  }
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
