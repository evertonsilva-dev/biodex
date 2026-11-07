import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));
const cloudflareAuthUrls = {
  production: 'https://ep-soft-meadow-b6ntj7xr.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth',
  preview: 'https://ep-twilight-sky-b63t5aul.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth',
};

export default defineConfig(({ command, isPreview, mode }) => {
  const env = loadEnv(mode, repositoryRoot, [
    'VITE_NEON_AUTH_URL',
    'VITE_GOOGLE_LOGIN_ENABLED',
    'NEON_AUTH_BASE_URL',
  ]);
  const cloudflareBranch = process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH;
  const isHostedBuild =
    process.env.WORKERS_CI === '1' || process.env.CF_PAGES_BRANCH !== undefined;

  if (isHostedBuild && !cloudflareBranch?.trim()) {
    throw new Error('Cloudflare build did not provide its branch name.');
  }

  const authUrl = isHostedBuild
    ? cloudflareBranch === 'main'
      ? cloudflareAuthUrls.production
      : cloudflareAuthUrls.preview
    : env.VITE_NEON_AUTH_URL || env.NEON_AUTH_BASE_URL || '';
  const googleLoginEnabled = isHostedBuild
    ? 'true'
    : env.VITE_GOOGLE_LOGIN_ENABLED || 'true';

  return {
    define: {
      'import.meta.env.VITE_NEON_AUTH_URL': JSON.stringify(authUrl),
      'import.meta.env.VITE_GOOGLE_LOGIN_ENABLED': JSON.stringify(googleLoginEnabled),
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
