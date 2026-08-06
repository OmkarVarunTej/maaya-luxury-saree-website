# MAAYA Backend — Milestone 1: Foundation

Scaffold, database schema, and infrastructure for the MAAYA saree e-commerce backend.
No feature APIs yet (auth/catalog/cart/orders land in later milestones) — this milestone
proves the ground is solid: app boots, config is validated, DB schema is designed, Docker
stack runs, logging/error-handling/health-checks work end to end.

**Scope note:** Reviews module is intentionally excluded (client decision). Payments table
exists as a schema placeholder only — no payment logic yet; that's the last milestone.

## What's here

```
src/
  config/env.validation.ts        Zod-validated environment config (app refuses to boot on bad env)
  database/prisma.service.ts      PrismaClient wrapped for Nest DI + lifecycle
  auth/                           Better Auth instance + Nest module (register/login/session)
  users/                          GET /me — first route behind the auth guard
  common/filters/                 Global exception filter → standard { error: {...} } shape
  common/interceptors/            Pagination envelope: { data: [...], meta: {...} }
  health/                         GET /health (liveness), GET /health/ready (DB check) — public
  app.module.ts, main.ts          Bootstrap: Helmet, CORS, versioning, ValidationPipe, Pino logging
prisma/schema.prisma              Full DB schema (users/auth, catalog, cart, orders, addresses,
                                   coupons, wishlist, admin/RBAC, audit log — reviews excluded)
docker-compose.yml, Dockerfile    Postgres + Redis + app, dev and prod-ready
```

## Auth

Customer auth is [Better Auth](https://better-auth.com) mounted at `/api/auth/*` (outside the
`/api/v1` prefix on purpose — see `main.ts`). Every other route requires a session by default;
opt a route out with `@AllowAnonymous()` or `@OptionalAuth()` from `@thallesp/nestjs-better-auth`.

```bash
# Sign up (auto signs in — response sets a session cookie)
curl -i -X POST http://localhost:3000/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in
curl -i -X POST http://localhost:3000/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}' -c cookies.txt

# Call a protected route with the session cookie
curl -i http://localhost:3000/api/v1/users/me -b cookies.txt

# Sign out
curl -i -X POST http://localhost:3000/api/auth/sign-out -b cookies.txt
```

Admin/staff auth is a deliberately separate credential space (`admin_users` table, own JWT
secret) — never issued by this Better Auth instance. Lands in Milestone 8.

## Prerequisite you need to know about

Generating the Prisma client (`npx prisma generate`) downloads a query-engine binary from
`binaries.prisma.sh`. **Run this on a machine/CI with normal internet access** — it will not
work in network-locked sandboxes. Everything else in this scaffold has no such restriction.

## Getting started

```bash
npm install
cp .env.example .env          # fill in real secrets — never commit .env
docker compose up -d postgres redis
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed            # optional: seeds one category to prove the connection works
npm run start:dev
```

Then:
- `GET http://localhost:3000/api/v1/health` → `{ "status": "ok" }`
- `GET http://localhost:3000/api/v1/health/ready` → checks the DB is actually reachable

Run the test suite (needs `.env` + Postgres reachable, since `AppModule` connects Prisma on boot):
```bash
npm test
```

## Design decisions carried over from the architecture doc

- **UUID PKs**, `created_at/updated_at` everywhere, soft delete (`deleted_at`) on user-facing
  entities (users/products/addresses).
- **Money as `Decimal(10,2)`**, never float.
- **Separate admin auth surface**: `admin_users`/`roles`/`permissions` are fully separate tables
  from `users` — a customer JWT can never be valid against admin routes (enforced when the auth
  module lands in Milestone 2).
- **Stock concurrency**: `product_variants.stock` + `reserved_stock` columns are in place now so
  Milestone 6 (checkout) can do the atomic `stock >= qty` decrement described in the architecture
  doc, without a schema change later.
- **Every error response** is `{ "error": { "code", "message", "details?" } }` — enforced globally
  by `AllExceptionsFilter`, so no module can accidentally return a different shape.
- **Every list response** is `{ "data": [...], "meta": { page, perPage, total, totalPages } }` —
  enforced globally by `TransformResponseInterceptor`.

## Next milestone

**Milestone 2 — Auth (now implemented):** register/login/logout, sessions, forgot/reset
password, and (once credentials are set) Google login are live via
[Better Auth](https://better-auth.com), mounted at `/api/auth/*` (deliberately outside the
`/api/v1` prefix — see `main.ts`). `GET /api/v1/users/me` is a first protected route proving
the guard works. See `src/auth/` for the instance config and module wiring.

**Still open from Milestone 2:** phone OTP (needs an SMS provider — Milestone 7), the separate
admin/staff login (Step 6 of the architecture doc — stays on its own JWT-based surface, never
sharing a session with customer auth), and the frontend login/signup UI itself (`account.html`
currently has no auth forms at all to wire up to these endpoints).
