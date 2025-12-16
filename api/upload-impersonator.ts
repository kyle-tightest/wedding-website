import { put } from '@vercel/blob';
import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

// Disable Vercel's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const data: { fields: formidable.Fields; files: formidable.Files } = await new Promise((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const imageFile = data.files.image?.[0];
    const guestName = data.fields.guestName?.[0];
    const targetImage = data.fields.targetImage?.[0];

    if (!imageFile || !guestName || !targetImage) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Read file from the temporary path
    const imageBuffer = fs.readFileSync(imageFile.filepath);

    // Upload image to Vercel Blob
    const blob = await put(`impersonator-submissions/${Date.now()}-${guestName}.jpg`, imageBuffer, {
      access: 'public',
      contentType: imageFile.mimetype || 'application/octet-stream',
    });

    // --- AI SCORING ---
    const score = Math.floor(Math.random() * 31) + 70; // Random score between 70 and 100

    // Save submission to the database
    const query = `
      INSERT INTO impersonator_submissions (guest_name, impersonated_photo_url, submission_photo_url, score)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [guestName, targetImage, blob.url, score]);

    return res.status(200).json({ score });
  } catch (error: unknown) {
    console.error('Upload Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process impersonation.';
    return res.status(500).json({ message });
  }
}