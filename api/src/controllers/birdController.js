import * as birdModel from '../models/birdModel.js';
import { isUuid, parseBirdPayload } from '../utils/validation.js';

export async function listBirds(req, res) {
  const birds = await birdModel.getAll();
  res.json(birds);
}

export async function getBird(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  const bird = await birdModel.getById(id);
  if (!bird) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  res.json(bird);
}

export async function createBird(req, res) {
  const payload = parseBirdPayload(req.body);
  const bird = await birdModel.create(payload);
  res.status(201).json(bird);
}

export async function updateBird(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  const payload = parseBirdPayload(req.body);
  const bird = await birdModel.update(id, payload);
  if (!bird) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  res.json(bird);
}

export async function deleteBird(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  const removed = await birdModel.remove(id);
  if (!removed) {
    return res.status(404).json({ error: 'Burung tidak ditemukan' });
  }
  res.json({ message: 'Bird deleted successfully' });
}
