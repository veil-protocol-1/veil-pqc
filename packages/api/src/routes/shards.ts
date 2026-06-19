import { Router } from 'express';

// TODO: replace with persistent storage (database)
const shardStore = new Map<string, { encryptedShard: string; userId: string }>();

export const shardsRouter = Router();

shardsRouter.post('/store', (req, res, next) => {
  try {
    const { shardId, encryptedShard, userId } = req.body as {
      shardId?: string;
      encryptedShard?: string;
      userId?: string;
    };

    if (!shardId || !encryptedShard || !userId) {
      res.status(400).json({ error: 'shardId, encryptedShard, and userId are required', code: 400 });
      return;
    }

    shardStore.set(shardId, { encryptedShard, userId });
    res.json({ stored: true, shardId });
  } catch (err) {
    next(err);
  }
});

shardsRouter.get('/:shardId', (req, res, next) => {
  try {
    const { shardId } = req.params;
    const entry = shardStore.get(shardId);

    if (!entry) {
      res.status(404).json({ error: 'Shard not found', code: 404 });
      return;
    }

    res.json({ shardId, encryptedShard: entry.encryptedShard });
  } catch (err) {
    next(err);
  }
});