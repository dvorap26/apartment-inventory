import { Router, Request, Response } from 'express';
import { listBlobs, uploadBlob, deleteBlob } from '../services/blobStorage';

const router = Router();

// GET /api/items - list all inventory items (blobs)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await listBlobs();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list items' });
  }
});

// POST /api/items - upload a new item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, data, contentType } = req.body as {
      name: string;
      data: string;
      contentType: string;
    };
    if (!name || !data) {
      res.status(400).json({ error: 'name and data are required' });
      return;
    }
    const buffer = Buffer.from(data, 'base64');
    const url = await uploadBlob(name, buffer, contentType || 'application/octet-stream');
    res.status(201).json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload item' });
  }
});

// DELETE /api/items/:name - delete an item
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const blobName = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    await deleteBlob(blobName);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
