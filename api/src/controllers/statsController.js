import * as statsModel from '../models/statsModel.js';

export async function getStats(req, res) {
  const stats = await statsModel.getStats();
  res.json(stats);
}
