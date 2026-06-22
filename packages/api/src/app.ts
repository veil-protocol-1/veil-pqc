import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health';
import { ghostRouter } from './routes/ghost';
import { shardsRouter } from './routes/shards';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error';

// A2A Agent Card — autonomous agent discovery via A2A protocol (/.well-known/agent.json)
const AGENT_CARD = {
  name: 'Veil Ghost',
  description:
    'Quantum-resistant AI inference and payment infrastructure for Web3 — private, sovereign, post-quantum secured via ML-DSA-65 + ML-KEM-768. Payments on Base mainnet (x402PQCPayments).',
  url: 'https://api.veilprotocol.net',
  version: '0.1.0',
  provider: {
    organization: 'Veil Protocol',
    url: 'https://veilprotocol.net',
  },
  documentationUrl: 'https://api.veilprotocol.net/.well-known/x402-bazaar.json',
  capabilities: {
    streaming: false,
    pushNotifications: false,
  },
  // x402-pqc: ML-DSA-65 signed payment header required on all /ghost/* endpoints
  authentication: {
    schemes: ['x402-pqc'],
    credentials: 'See paymentDetails URL for scheme spec, pricing, and contract address.',
  },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  network: 'base', // Base mainnet, chainId 8453
  paymentScheme: 'x402-pqc',
  paymentDetails: 'https://api.veilprotocol.net/.well-known/x402-bazaar.json',
  skills: [
    {
      id: 'ghost-query',
      name: 'Ghost Query',
      description:
        'Submit an ML-KEM-768 encrypted query for private AI inference. ' +
        'POST /ghost/query with { encryptedQuery: hex, publicKey?: hex, sessionId?: string, complexity?: "simple"|"standard"|"complex" }. ' +
        'Returns { encryptedResult, sessionId, timestamp }. ' +
        'Requires x402-pqc payment header. Tiered pricing: $0.002 simple / $0.01 standard / $0.05 complex.',
      tags: ['ai', 'inference', 'pqc', 'encrypted', 'web3'],
      examples: ["POST /ghost/query — { encryptedQuery: 'deadbeef...', publicKey: 'aabb...' }"],
      inputModes: ['application/json'],
      outputModes: ['application/json'],
    },
    {
      id: 'ghost-intent',
      name: 'Ghost Intent',
      description:
        'Parse a natural-language Web3 intent (swap, send, earn, stake, balance query, history) ' +
        'and return a structured { intent, ghostResponse, confidence, raw }. ' +
        'POST /ghost/intent with { message: string }. Requires x402-pqc payment header. ' +
        'Tiered pricing auto-classified from message: $0.002 simple (swap/send/balance/price) / ' +
        '$0.01 standard (yield/staking/DeFi) / $0.05 complex (Aave/rebalancing/multi-step).',
      tags: ['intent', 'web3', 'nlp', 'swap', 'defi', 'pqc'],
      examples: [
        "POST /ghost/intent — { message: 'swap 50 USDC to ETH' }",
        "POST /ghost/intent — { message: 'what is my ETH balance' }",
      ],
      inputModes: ['application/json'],
      outputModes: ['application/json'],
    },
  ],
};

// Bazaar discovery manifest — x402-pqc payment service metadata for agent/SDK discovery
const BAZAAR_MANIFEST = {
  service: 'Veil Ghost',
  description: 'Quantum-resistant AI inference for Web3 — private, sovereign, post-quantum secured via ML-DSA-65 + ML-KEM-768',
  endpoint: 'https://api.veilprotocol.net/ghost/query',
  scheme: 'x402-pqc',
  network: 'base', // Base mainnet, chainId 8453
  contract: '0x8F446afA9877C79F3CCb5eaA5b6503752817223f',
  recipient: '0x77761912b6435287f2b4DaAe93c02611351e7750',
  pricing: {
    tiers: {
      simple: '0.002',    // swap, send, balance check, price query
      standard: '0.01',   // yield, staking, basic DeFi queries
      complex: '0.05',    // Aave loans, portfolio rebalancing, multi-step strategies
    },
    currency: 'USD',
    default: 'simple',
  },
  version: 'x402-pqc-v0.1.0',
};

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.get('/.well-known/agent.json', (_req, res) => {
    res.json(AGENT_CARD);
  });

  app.get('/.well-known/x402-bazaar.json', (_req, res) => {
    res.json(BAZAAR_MANIFEST);
  });

  app.use('/health', healthRouter);
  app.use('/ghost', ghostRouter);
  app.use('/shards', shardsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}