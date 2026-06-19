import { createApp } from './app.js';

const PORT = parseInt(process.env.AGENT_REGISTRY_PORT ?? '3001', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`[veil-agent-registry] REST API listening on port ${PORT}`);
});