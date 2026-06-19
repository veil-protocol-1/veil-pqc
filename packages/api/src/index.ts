import 'dotenv/config';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`[veil-api] Listening on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
  console.log(`[veil-api] Node: ${process.env.VEIL_NODE_ID ?? 'veil-api-node'}`);
  console.log(`[veil-api] Octra RPC: ${process.env.OCTRA_RPC_URL ?? 'https://octra.network/rpc'}`);
});