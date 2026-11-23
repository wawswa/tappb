import * as sightingModel from '../models/sightingModel.js';
import {
  ValidationError,
  isUuid,
  parseLimit,
  parseSightingPayload,
} from '../utils/validation.js';

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
  payload.observer_name = req.user.display_name;
  const sighting = await sightingModel.create(payload);
  res.status(201).json(sighting);
}

export async function updateSighting(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  const payload = parseSightingPayload(req.body);
  const sighting = await sightingModel.update(id, payload);
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
  const removed = await sightingModel.remove(id);
  if (!removed) {
    return res.status(404).json({ error: 'Spotting tidak ditemukan' });
  }
  res.json({ message: 'Sighting deleted successfully' });
}
