import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Increase body size limit for image data
    },
  },
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { image } = request.body;
    if (!image) {
      return response.status(400).json({ message: 'No image data provided.' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = await put(`impersonators/impersonator-${Date.now()}.jpg`, buffer, { access: 'public' });

    return response.status(200).json(blob);
  } catch (error: any) {
    console.error('Upload Error:', error);
    return response.status(500).json({ message: error.message || 'Failed to upload image.' });
  }
}