import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const apiDirectoryCandidate = resolve(moduleDirectory, '..', '..');
const apiDirectory = basename(apiDirectoryCandidate) === 'dist'
  ? resolve(apiDirectoryCandidate, '..')
  : apiDirectoryCandidate;
dotenv.config({ path: resolve(apiDirectory, '.env') });
const rootEnvironment = dotenv.config({
  path: resolve(apiDirectory, '..', '..', '.env.local'),
}).parsed;

for (const key of ['NEON_AUTH_BASE_URL', 'NEON_AUTH_JWKS_URL'] as const) {
  if (!process.env[key]?.trim() && rootEnvironment?.[key]?.trim()) {
    process.env[key] = rootEnvironment[key];
  }
}

const positiveInteger = (fallback: number) => z
  .string()
  .optional()
  .transform((value) => value === undefined || value === '' ? fallback : Number(value))
  .pipe(z.number().safe().int().positive());

const envSchema = z.object({
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  PORT: positiveInteger(1337),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DATABASE_CLIENT: z.enum(['postgres']).default('postgres'),
  DATABASE_URL: z.string()
    .default('')
    .refine((value) => !value || /^postgres(?:ql)?:\/\//.test(value), {
      message: 'must be a PostgreSQL connection URL.',
    }),
  DATABASE_HOST: z.string().default('127.0.0.1'),
  DATABASE_PORT: positiveInteger(5432),
  DATABASE_NAME: z.string().default('biodex'),
  DATABASE_USERNAME: z.string().default('biodex'),
  DATABASE_PASSWORD: z.string().default(''),
  DATABASE_SSL: z.enum(['true', 'false']).default('false'),
  DATABASE_POOL_MAX: positiveInteger(10),
  NEON_AUTH_BASE_URL: z.string().default(''),
  NEON_AUTH_JWKS_URL: z.string().default(''),
}).safeParse(process.env);

if (!envSchema.success) {
  const details = envSchema.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid API environment configuration: ${details}`);
}

export const env = {
  host: envSchema.data.HOST,
  port: envSchema.data.PORT,
  corsOrigins: envSchema.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  databaseClient: envSchema.data.DATABASE_CLIENT,
  databaseUrl: envSchema.data.DATABASE_URL,
  databaseHost: envSchema.data.DATABASE_HOST,
  databasePort: envSchema.data.DATABASE_PORT,
  databaseName: envSchema.data.DATABASE_NAME,
  databaseUsername: envSchema.data.DATABASE_USERNAME,
  databasePassword: envSchema.data.DATABASE_PASSWORD,
  databaseSsl: envSchema.data.DATABASE_SSL === 'true',
  databasePoolMax: envSchema.data.DATABASE_POOL_MAX,
  neonAuthBaseUrl: envSchema.data.NEON_AUTH_BASE_URL,
  neonAuthJwksUrl: envSchema.data.NEON_AUTH_JWKS_URL,
};

export type ApiEnvironment = typeof env;
