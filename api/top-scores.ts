import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize the connection pool.
// The connection string is read from the POSTGRES_URL environment variable.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for most cloud-hosted PostgreSQL services
  },
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const query = `
      SELECT name, MAX(score) AS score
      FROM love_birds_scores
      GROUP BY name
      ORDER BY score DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(query);

    return response.status(200).json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while fetching scores.' });
  }
}
