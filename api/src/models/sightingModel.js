import { query } from '../config/db.js';

const SIGHTING_SELECT = `
  SELECT s.id, s.bird_id, s.user_id, s.observer_name, s.location_name, s.latitude, s.longitude,
         s.spotted_at, s.notes, s.created_at,
         b.name AS bird_name,
         b.image_url AS bird_image_url,
         b.scientific_name AS bird_scientific_name
  FROM sightings s
  JOIN birds b ON b.id = s.bird_id
`;

function normalizeSighting(row) {
  if (!row) return null;
  return {
    ...row,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    spotted_at: row.spotted_at instanceof Date ? row.spotted_at.toISOString() : row.spotted_at,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function getAll({ birdId, limit }) {
  const params = [];
  let where = '';
  if (birdId) {
    params.push(birdId);
    where = 'WHERE s.bird_id = $1';
  }
  params.push(limit);
  const result = await query(
    `${SIGHTING_SELECT} ${where} ORDER BY s.spotted_at DESC, s.created_at DESC LIMIT $${params.length}`,
    params,
  );
  return result.rows.map(normalizeSighting);
}

export async function getById(id) {
  const result = await query(`${SIGHTING_SELECT} WHERE s.id = $1`, [id]);
  return normalizeSighting(result.rows[0]);
}

export async function create(sighting) {
  const result = await query(
    `INSERT INTO sightings
       (bird_id, user_id, observer_name, location_name, latitude, longitude, spotted_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      sighting.bird_id,
      sighting.user_id,
      sighting.observer_name,
      sighting.location_name,
      sighting.latitude,
      sighting.longitude,
      sighting.spotted_at,
      sighting.notes,
    ],
  );
  return getById(result.rows[0].id);
}

export async function update(id, sighting) {
  const result = await query(
    `UPDATE sightings SET
       bird_id = $2, observer_name = $3, location_name = $4, latitude = $5,
       longitude = $6, spotted_at = $7, notes = $8
     WHERE id = $1
     RETURNING id`,
    [
      id,
      sighting.bird_id,
      sighting.observer_name,
      sighting.location_name,
      sighting.latitude,
      sighting.longitude,
      sighting.spotted_at,
      sighting.notes,
    ],
  );
  if (result.rowCount === 0) return null;
  return getById(id);
}

export async function remove(id) {
  const result = await query('DELETE FROM sightings WHERE id = $1', [id]);
  return result.rowCount > 0;
}
