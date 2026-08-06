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
  common/filters/                 Global exception filter → standard { error: {...} } shape
  common/interceptors/            Pagination envelope: { data: [...], meta: {...} }
  health/                         GET /health (liveness), GET /health/ready (DB check)
  app.module.ts, main.ts          Bootstrap: Helmet, CORS, versioning, ValidationPipe, Pino logging
prisma/schema.prisma              Full DB schema (users, catalog, cart, orders, addresses,
                                   coupons, wishlist, admin/RBAC, audit log — reviews excluded)
docker-compose.yml, Dockerfile    Postgres + Redis + app, dev and prod-ready
```

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

**Milestone 2 — Auth**: register/login/refresh, forgot/reset password, OTP, Google login, and
the separate admin login — built on top of the `User`/`AuthIdentity`/`RefreshToken`/`OtpCode`/
`AdminUser` tables already defined in this schema.
