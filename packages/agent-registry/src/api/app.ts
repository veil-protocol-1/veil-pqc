import express, { type Express, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { signPayment, verifyPayment, ghostQuery, encryptPayload } from '../core/handlers.js';
import {
  SignPaymentInputSchema,
  VerifyPaymentInputSchema,
  GhostQueryInputSchema,
  EncryptPayloadInputSchema,
} from '../types.js';
import { veilFunctions } from '../openai/functions.js';

function route<TSchema extends { parse: (input: unknown) => unknown }>(
  schema: TSchema,
  handler: (input: ReturnType<TSchema['parse']>) => unknown | Promise<unknown>,
) {
  return async (req: Request, res: Response) => {
    try {
      const input = schema.parse(req.body) as ReturnType<TSchema['parse']>;
      const result = await handler(input);
      res.json({ success: true, result });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, error: err.issues });
        return;
      }
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  };
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tools', (_req, res) => {
    res.json({ tools: veilFunctions });
  });

  app.post('/tools/sign-payment', route(SignPaymentInputSchema, signPayment));
  app.post('/tools/verify-payment', route(VerifyPaymentInputSchema, verifyPayment));
  app.post('/tools/ghost-query', route(GhostQueryInputSchema, ghostQuery));
  app.post('/tools/encrypt-payload', route(EncryptPayloadInputSchema, encryptPayload));

  return app;
}