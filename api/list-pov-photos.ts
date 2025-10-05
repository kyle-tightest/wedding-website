import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // List all blobs in the "pov-photos" folder
    const blobs = await list({ prefix: "pov-photos/" });

    // Only include image files
    const photos = blobs.blobs
      .filter(blob => blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(blob => ({
        url: blob.url,
        name: blob.pathname.replace(/^pov-photos\//, '')
      }));

    res.status(200).json(photos);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list photos" });
  }
}