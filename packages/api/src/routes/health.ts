import { Router } from 'express';
import { isClassifierReady } from '../classifierState';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: Date.now(),
    node: process.env.VEIL_NODE_ID ?? 'veil-api-node',
    classifierReady: isClassifierReady(),
  });
});