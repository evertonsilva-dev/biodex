import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ command, isPreview, mode }) => {
  const env = loadEnv(mode, repositoryRoot, [
    'VITE_NEON_AUTH_URL',
    'NEON_AUTH_BASE_URL',
  ]);

  return {
    define: {
      'import.meta.env.VITE_NEON_AUTH_URL': JSON.stringify(
        env.VITE_NEON_AUTH_URL || env.NEON_AUTH_BASE_URL || '',
      ),
    },
    plugins: [
      react(),
      ...(command === 'build' || isPreview === true
        ? [cloudflare({ viteEnvironment: { name: 'worker' } })]
        : []),
    ],
    environments: {
      worker: { build: { sourcemap: true } },
    },
  };
});
