import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health';
import { ghostRouter } from './routes/ghost';
import { shardsRouter } from './routes/shards';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/ghost', ghostRouter);
  app.use('/shards', shardsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}