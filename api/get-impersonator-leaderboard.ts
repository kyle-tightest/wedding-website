import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const query = `
      SELECT guest_name, submission_photo_url, score
      FROM impersonator_submissions
      ORDER BY score DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(query);

    return res.status(200).json(rows);
  } catch (error: unknown) {
    console.error('Database Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard.';
    return res.status(500).json({ message });
  }
}
