import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import nodemailer from 'nodemailer';

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

  const { name, email, meal, song } = request.body;

  if (!name || !email || !meal) {
    return response.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // First, check if the name exists in the rsvp_names table (guest list).
    const guestListQuery = 'SELECT 1 FROM rsvp_names WHERE LOWER(name) = LOWER($1)';
    const guestResult = await pool.query(guestListQuery, [name.trim()]);

    if (guestResult.rowCount === 0) {
      console.log("Someone is attempting to RSVP but they're not on the guest list.", name, email, meal, song);
      // Save unauthorized RSVP attempt
      const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || null;
      try {
        await pool.query(
          `INSERT INTO unauthorized_rsvp_attempts (name, email, meal, ip_address, song) VALUES ($1, $2, $3, $4, $5);`,
          [name, email, meal, Array.isArray(ip) ? ip[0] : ip, song ?? null]
        );
      } catch (err) {
        console.error('Failed to log unauthorized RSVP attempt:', err);
      }
      // Exit early with a generic success message
      return response.status(200).json({ message: 'RSVP submitted successfully!' });
    }

    // This query inserts a new RSVP. If an RSVP with the same email already exists,
    // it updates the existing record. This is useful if a guest changes their mind.
    const query = `
      INSERT INTO rsvps (name, email, meal_preference, song) VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, meal_preference = EXCLUDED.meal_preference, song = EXCLUDED.song, submitted_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [name, email, meal, song ?? null]);

    // Send confirmation email. We wrap this in its own try/catch
    // so that if email sending fails, the API doesn't return an error.
    try {
      // --- DEBUGGING LOG ---
      // This will show up in your Vercel logs to confirm if the variable is loaded.
      console.log('GMAIL_USER is defined:', !!process.env.GMAIL_USER);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Robin & Kyle's Wedding" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your RSVP Confirmation for Robin & Kyle\'s Wedding!',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #c0392b;">Thank You for Your RSVP!</h2>
            <p>Dear ${name},</p>
            <p>We're so excited that you'll be joining us to celebrate our wedding!</p>
            <p>This email confirms we have received your RSVP with the following details:</p>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${name}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
              <li style="margin-bottom: 8px;"><strong>Meal Preference:</strong> ${meal}</li>
              ${song ? `<li style="margin-bottom: 8px;"><strong>Song Choice:</strong> ${song}</li>` : ""}
            </ul>
            <p>We can't wait to see you on <strong>February 7, 2026</strong>.</p>
            <p>If you need to change your details, you can do so by visiting our website again.</p>
            <br>
            <p>With love,</p>
            <p><strong>Robin & Kyle</strong></p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // We don't return an error to the user, as their RSVP was saved successfully.
    }

    const cookie = serialize('rsvp_submitted', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    response.setHeader('Set-Cookie', cookie);

    return response.status(200).json({ message: 'RSVP submitted successfully!' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ message: 'An error occurred while saving your RSVP.' });
  }
}