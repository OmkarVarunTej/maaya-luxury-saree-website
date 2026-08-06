import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '@prisma/client';

/** The slice of EnvConfig this module actually needs — keeps auth.module.ts's
 * factory explicit about what it's passing through, and avoids depending on
 * the full env schema type here. */
export interface AuthEnv {
  NODE_ENV: string;
  CORS_ORIGINS: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

/**
 * Builds the Better Auth server instance.
 *
 * Kept as a plain factory (not a Nest provider) because Better Auth's own
 * types are simplest to work with outside Nest's DI graph — `AuthModule`
 * (see auth.module.ts) is what hands this to Nest and wires up the guard,
 * the `/api/v1/auth/*` routes, and the `@Session()` decorator.
 *
 * Everything here is customer-facing auth (register/login/session/password
 * reset). Admin/staff auth stays a separate concern (Step 6 of the
 * architecture doc / Milestone 8) — do not reuse this instance for admins.
 */
export function createAuth(prisma: PrismaClient, env: AuthEnv) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    // Deliberately outside the /api/v1 prefix (see main.ts's setGlobalPrefix
    // exclude list) — Nest's global versioning prefix and Better Auth's own
    // internal route mounting don't compose cleanly, so auth gets its own
    // top-level namespace: /api/auth/* rather than /api/v1/auth/*.
    basePath: '/api/auth',

    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),

    // CSRF/origin allowlist — same list the API already CORS-allows.
    trustedOrigins: env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
      // Wire to the notifications module (Milestone 7) when it lands —
      // until then, reset requests are logged rather than emailed.
      sendResetPassword: async ({ user, url }) => {
        // eslint-disable-next-line no-console
        console.log(`[auth] password reset link for ${user.email}: ${url}`);
      },
    },

    emailVerification: {
      sendOnSignUp: false, // flip on once the email provider (Milestone 7) is wired
      sendVerificationEmail: async ({ user, url }) => {
        // eslint-disable-next-line no-console
        console.log(`[auth] verification link for ${user.email}: ${url}`);
      },
    },

    // Google OAuth (Step 2 of the architecture doc) — set the two env vars
    // to turn this on; left disabled (undefined) until credentials exist.
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          },
        }
      : {}),

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh the expiry once per day of activity
      cookieCache: { enabled: true, maxAge: 60 }, // avoid a DB hit on every request
    },

    advanced: {
      useSecureCookies: env.NODE_ENV === 'production',
      cookiePrefix: 'maaya',
    },

    // User model carries extra business fields (phone, status) beyond what
    // Better Auth manages itself; exposing them here makes them readable/
    // settable through the auth API's user object.
    user: {
      additionalFields: {
        phone: { type: 'string', required: false, input: true },
        status: { type: 'string', required: false, input: false },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
