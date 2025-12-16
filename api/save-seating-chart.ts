import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
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

  const { tables } = request.body;

  if (!tables || !Array.isArray(tables)) {
    return response.status(400).json({ message: 'Missing or invalid tables data.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE seating_chart;');

    for (let i = 0; i < tables.length; i++) {
      const tableNumber = i + 1;
      const guests = tables[i];
      for (const guest of guests) {
        await client.query('INSERT INTO seating_chart (table_number, guest_name) VALUES ($1, $2);', [tableNumber, guest]);
      }
    }

    await client.query('COMMIT');
    return response.status(200).json({ message: 'Seating chart saved successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while saving the seating chart.' });
  } finally {
    client.release();
  }
}
