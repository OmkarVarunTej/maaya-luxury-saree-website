import { z } from 'zod';

/**
 * Every env var the app depends on is declared here. If one is missing or
 * malformed, the app refuses to boot with a clear error instead of failing
 * confusingly at first use deep inside a request handler.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default(''),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // ---- Customer auth (Better Auth — Milestone 2) ----
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 chars'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a full URL, e.g. http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Staff/admin auth is a deliberately separate credential space (Step 6 of
  // the architecture doc) — never issued by the customer-facing Better Auth
  // instance above. Wired up in Milestone 8.
  JWT_ADMIN_ACCESS_SECRET: z.string().min(16, 'JWT_ADMIN_ACCESS_SECRET must be at least 16 chars'),
  JWT_ADMIN_EXPIRES_IN: z.string().default('15m'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
