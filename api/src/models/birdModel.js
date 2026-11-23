import { query } from '../config/db.js';

const BIRD_SELECT = `
  SELECT b.id, b.slug, b.name, b.scientific_name, b.family, b.description,
         b.habitat, b.diet, b.size_cm, b.conservation_status, b.image_url,
         b.image_credit, b.image_source_url, b.created_at,
         COUNT(s.id)::int AS sighting_count
  FROM birds b
  LEFT JOIN sightings s ON s.bird_id = b.id
`;

function normalizeBird(row) {
  if (!row) return null;
  return {
    ...row,
    size_cm: row.size_cm === null ? null : Number(row.size_cm),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    sighting_count: Number(row.sighting_count),
  };
}

export async function getAll() {
  const result = await query(`${BIRD_SELECT} GROUP BY b.id ORDER BY b.name ASC`);
  return result.rows.map(normalizeBird);
}

export async function getById(id) {
  const result = await query(`${BIRD_SELECT} WHERE b.id = $1 GROUP BY b.id`, [id]);
  return normalizeBird(result.rows[0]);
}

export async function create(bird) {
  const result = await query(
    `INSERT INTO birds
       (slug, name, scientific_name, family, description, habitat, diet,
        size_cm, conservation_status, image_url, image_credit, image_source_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      bird.slug,
      bird.name,
      bird.scientific_name,
      bird.family,
      bird.description,
      bird.habitat,
      bird.diet,
      bird.size_cm,
      bird.conservation_status,
      bird.image_url,
      bird.image_credit,
      bird.image_source_url,
    ],
  );
  return getById(result.rows[0].id);
}

export async function update(id, bird) {
  const result = await query(
    `UPDATE birds SET
       slug = $2, name = $3, scientific_name = $4, family = $5, description = $6,
       habitat = $7, diet = $8, size_cm = $9, conservation_status = $10,
       image_url = $11, image_credit = $12, image_source_url = $13
     WHERE id = $1
     RETURNING id`,
    [
      id,
      bird.slug,
      bird.name,
      bird.scientific_name,
      bird.family,
      bird.description,
      bird.habitat,
      bird.diet,
      bird.size_cm,
      bird.conservation_status,
      bird.image_url,
      bird.image_credit,
      bird.image_source_url,
    ],
  );
  if (result.rowCount === 0) return null;
  return getById(id);
}

export async function remove(id) {
  const result = await query('DELETE FROM birds WHERE id = $1', [id]);
  return result.rowCount > 0;
}
