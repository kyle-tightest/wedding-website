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
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, meal } = request.body;

  if (!name || !email || !meal) {
    return response.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // This query inserts a new RSVP. If an RSVP with the same email already exists,
    // it updates the existing record. This is useful if a guest changes their mind.
    const query = `
      INSERT INTO rsvps (name, email, meal_preference) VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, meal_preference = EXCLUDED.meal_preference, submitted_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [name, email, meal]);
    return response.status(200).json({ message: 'RSVP submitted successfully!' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while saving your RSVP.' });
  }
}