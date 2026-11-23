import { query } from '../config/db.js';

export async function getStats() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM birds) AS bird_count,
      (SELECT COUNT(*)::int FROM sightings) AS sighting_count,
      (SELECT COUNT(DISTINCT bird_id)::int FROM sightings) AS species_spotted
  `);
  return result.rows[0];
}
