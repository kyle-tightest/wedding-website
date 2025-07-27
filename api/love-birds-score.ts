import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, score } = request.body;
  if (!name || typeof score !== 'number' || score < 0) {
    return response.status(400).json({ message: 'Missing or invalid name/score.' });
  }

  try {
    await pool.query(
      'INSERT INTO love_birds_scores (name, score, ip_address) VALUES ($1, $2, $3);',
      [name.trim(), score, request.headers['x-forwarded-for'] || request.socket.remoteAddress]
    );
    return response.status(200).json({ message: 'Score saved!' });
  } catch (err) {
    console.error('Error saving score:', err);
    return response.status(500).json({ message: 'Error saving score.' });
  }
}
