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
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const query = 'SELECT table_number, guest_name FROM seating_chart ORDER BY table_number;';
    const { rows } = await pool.query(query);

    const tables: string[][] = Array(17).fill(null).map(() => []);
    const seatedGuests = new Set<string>();

    for (const row of rows) {
      const tableIndex = row.table_number - 1;
      if (tables[tableIndex]) {
        tables[tableIndex].push(row.guest_name);
        seatedGuests.add(row.guest_name);
      }
    }

    return response.status(200).json({ tables, seatedGuests: Array.from(seatedGuests) });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while fetching seating chart data.' });
  }
}
