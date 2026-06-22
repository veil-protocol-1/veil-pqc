import 'dotenv/config';
import { createApp } from './app';
import { initClassifier } from './routes/ghost';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const app = createApp();

// Bind the port first so /health is reachable immediately.
// Deploy scripts can poll GET /health until classifierReady:true before routing
// live traffic — that way the 24.5 s cold-start is paid at deploy time, not on
// the first user request.
app.listen(PORT, () => {
  console.log(`[veil-api] Listening on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
  console.log(`[veil-api] Node: ${process.env.VEIL_NODE_ID ?? 'veil-api-node'}`);
  console.log(`[veil-api] Octra RPC: ${process.env.OCTRA_RPC_URL ?? 'https://octra.network/rpc'}`);
  console.log('[veil-api] Warming up classifier — DistilBERT primary, EmbeddingClassifier fallback (check /health for classifierReady)...');

  // Fire-and-forget: errors are caught inside initClassifier and the server
  // continues with regex fallback if the model fails to load.
  void initClassifier();
});