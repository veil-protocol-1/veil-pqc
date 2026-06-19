import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/langchain/tools.ts',
    'src/openai/functions.ts',
    'src/mcp/server.ts',
    'src/api/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  treeshake: true,
});