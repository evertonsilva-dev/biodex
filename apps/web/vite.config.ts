import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig(({ command, isPreview }) => ({
  plugins: [
    react(),
    ...(command === 'build' || isPreview === true
      ? [cloudflare({ viteEnvironment: { name: 'worker' } })]
      : []),
  ],
  environments: {
    worker: { build: { sourcemap: true } },
  },
}));
