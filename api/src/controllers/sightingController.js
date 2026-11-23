import * as sightingModel from '../models/sightingModel.js';
import {
  ValidationError,
  isUuid,
  parseLimit,
  parseSightingPayload,
} from '../utils/validation.js';

function canManageSighting(user, sighting) {
  return user.role === 'admin' || (sighting.user_id !== null && sighting.user_id === user.id);
}

export async function listSightings(req, res) {
  const birdId = req.query.bird_id;
  if (birdId !== undefined && !isUuid(birdId)) {
    throw new ValidationError('bird_id tidak valid');
  }
  const limit = parseLimit(req.query.limit);
  const sightings = await sightingModel.getAll({ birdId, limit });
  res.json(sightings);
}

export async function getSighting(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  const sighting = await sightingModel.getById(id);
  if (!sighting) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  res.json(sighting);
}

export async function createSighting(req, res) {
  const payload = parseSightingPayload(req.body);
  const sighting = await sightingModel.create({
    ...payload,
    user_id: req.user.id,
    observer_name: req.user.display_name,
  });
  res.status(201).json(sighting);
}

export async function updateSighting(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  const existing = await sightingModel.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  if (!canManageSighting(req.user, existing)) {
    return res
      .status(403)
      .json({ error: 'Kamu hanya dapat mengubah spotting milik sendiri' });
  }
  const payload = parseSightingPayload(req.body);
  const sighting = await sightingModel.update(id, {
    ...payload,
    observer_name: existing.observer_name,
  });
  if (!sighting) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  res.json(sighting);
}

export async function deleteSighting(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  const existing = await sightingModel.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  if (!canManageSighting(req.user, existing)) {
    return res
      .status(403)
      .json({ error: 'Kamu hanya dapat menghapus spotting milik sendiri' });
  }
  await sightingModel.remove(id);
  res.json({ message: 'Sighting deleted successfully' });
}
