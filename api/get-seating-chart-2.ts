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
    const seatingQuery = 'SELECT table_number, guest_name, x, y FROM seating_chart_2 ORDER BY table_number;';
    const rsvpQuery = 'SELECT name FROM rsvps;';

    const [seatingResult, rsvpResult] = await Promise.all([
      pool.query(seatingQuery),
      pool.query(rsvpQuery)
    ]);

    const tables: { guests: string[], x: number, y: number }[] = Array(17).fill(null).map(() => ({ guests: [], x: 0, y: 0 }));
    const seatedGuests = new Set<string>();

    for (const row of seatingResult.rows) {
      const tableIndex = row.table_number - 1;
      if (tables[tableIndex]) {
        tables[tableIndex].guests.push(row.guest_name);
        tables[tableIndex].x = row.x || 0;
        tables[tableIndex].y = row.y || 0;
        seatedGuests.add(row.guest_name);
      }
    }

    const unseatedNames = rsvpResult.rows
      .map(row => row.name)
      .filter(name => !seatedGuests.has(name));

    return response.status(200).json({
      tables,
      names: unseatedNames
    });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while fetching seating chart data.' });
  }
}
