
import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'No image data provided.' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = await put(`pov-photos/${Date.now()}.jpg`, buffer, { access: 'public' });

    return res.status(200).json(blob);
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to upload image.' });
  }
}
