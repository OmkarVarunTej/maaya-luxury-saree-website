# MAAYA Backend — Milestone 3: Catalog

Milestone 1 (Foundation) + Milestone 3 (Catalog). Auth (Milestone 2) has not landed yet, so
customer-facing catalog reads are fully public and admin catalog writes sit behind a
standalone JWT check (`AdminAuthGuard`) that verifies `JWT_ADMIN_ACCESS_SECRET` — the same
secret Milestone 2's admin login will sign tokens with. No login endpoint exists yet to issue
those tokens; until Milestone 2 lands, mint a test token yourself (see "Admin auth, for now"
below) to exercise the admin routes.

**Scope note:** Reviews module is intentionally excluded (client decision). Payments table
exists as a schema placeholder only — no payment logic yet; that's the last milestone.

## What's here

```
src/
  config/env.validation.ts        Zod-validated environment config (app refuses to boot on bad env)
  database/prisma.service.ts      PrismaClient wrapped for Nest DI + lifecycle
  common/filters/                 Global exception filter → standard { error: {...} } shape
  common/interceptors/            Pagination envelope: { data: [...], meta: {...} }
  common/guards/admin-auth.guard.ts   Verifies admin JWTs on admin/* catalog routes
  common/utils/                   slugify() + clampPagination() shared by catalog services
  health/                         GET /health (liveness), GET /health/ready (DB check)
  catalog/
    categories/                   GET /categories (public, Redis-cached)
    products/                     GET /products, GET /products/:slug, GET /products/:slug/related
    admin/                        Admin CRUD for categories/products/variants/images + CSV bulk import
    dto/                          class-validator DTOs for every catalog write
  app.module.ts, main.ts          Bootstrap: Helmet, CORS, versioning, ValidationPipe, Pino logging
prisma/schema.prisma              Full DB schema (users, catalog, cart, orders, addresses,
                                   coupons, wishlist, admin/RBAC, audit log — reviews excluded)
prisma/seed.ts                    6 categories + 5 sample products (2 variants + image each),
                                   mirroring the frontend's js/config.js mock data
docker-compose.yml, Dockerfile    Postgres + Redis + app, dev and prod-ready
```

## Catalog API

**Public** (cached via Redis — see TTLs in each controller):
- `GET /api/v1/categories` — flat, sorted list with live product counts
- `GET /api/v1/products?category=&fabric=&occasion=&minPrice=&maxPrice=&search=&sort=&page=&perPage=` —
  paginated, filtered, ILIKE search across name/description/fabric/occasion (move to
  Postgres tsvector/trigram or an external index once the catalog grows past a few
  thousand SKUs — see the comment in `products.service.ts`)
- `GET /api/v1/products/:slug` — full detail (variants, images, category)
- `GET /api/v1/products/:slug/related` — same-category products, excluding itself

**Admin** (`Authorization: Bearer <admin JWT>` required on every route):
- `GET/POST /api/v1/admin/categories`, `PATCH/DELETE /api/v1/admin/categories/:id`
- `GET/POST /api/v1/admin/products`, `GET/PATCH/DELETE /api/v1/admin/products/:id` (soft delete)
- `POST /api/v1/admin/products/:id/variants`, `PATCH/DELETE /api/v1/admin/variants/:variantId`
- `POST /api/v1/admin/products/:id/images`, `DELETE /api/v1/admin/images/:imageId`
- `POST /api/v1/admin/products/bulk-import` — multipart CSV upload (`file` field), one row per
  variant, rows sharing a `slug`/`name` are grouped into one product — see the header format
  documented at the top of `bulk-import.service.ts`

### Admin auth, for now

Until Milestone 2 ships a real admin login, mint a test token against the same secret the
guard checks:

```bash
node -e "console.log(require('jsonwebtoken').sign(
  { sub: 'test-admin', email: 'admin@example.com', permissions: [] },
  process.env.JWT_ADMIN_ACCESS_SECRET,
  { expiresIn: '1h' }
))"
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
npx prisma db seed            # seeds 6 categories + 5 sample products with variants/images
npm run start:dev
```

Then:
- `GET http://localhost:3000/api/v1/health` → `{ "status": "ok" }`
- `GET http://localhost:3000/api/v1/health/ready` → checks the DB is actually reachable
- `GET http://localhost:3000/api/v1/categories` → the 6 seeded categories
- `GET http://localhost:3000/api/v1/products` → the 5 seeded products, paginated

Run the test suite (needs `.env` + Postgres + Redis reachable, since `AppModule` connects on
boot):
```bash
npm test
```
`test/unit/` covers pure logic (`slugify`, `clampPagination`) with no DB dependency and always
runs; the `*.e2e-spec.ts` files at the top level need live Postgres/Redis like the existing
health check does.

## Design decisions carried over from the architecture doc

- **UUID PKs**, `created_at/updated_at` everywhere, soft delete (`deleted_at`) on user-facing
  entities (users/products/addresses).
- **Money as `Decimal(10,2)`**, never float.
- **Separate admin auth surface**: `admin_users`/`roles`/`permissions` are fully separate tables
  from `users` — a customer JWT can never be valid against admin routes (enforced now by
  `AdminAuthGuard` checking a distinct secret, `JWT_ADMIN_ACCESS_SECRET`).
- **Stock concurrency**: `product_variants.stock` + `reserved_stock` columns are in place now so
  Milestone 6 (checkout) can do the atomic `stock >= qty` decrement described in the architecture
  doc, without a schema change later.
- **Every error response** is `{ "error": { "code", "message", "details?" } }` — enforced globally
  by `AllExceptionsFilter`, so no module can accidentally return a different shape.
- **Every list response** is `{ "data": [...], "meta": { page, perPage, total, totalPages } }` —
  enforced globally by `TransformResponseInterceptor`.
- **Hot public reads are Redis-cached** (categories 10 min, product list 90s, product
  detail/related 5 min) — cache key is the full request URL including query string, which is
  exactly "cache by normalized query-string hash" from the architecture doc's Step 9.

## Next milestone

**Milestone 2 — Auth**: register/login/refresh, forgot/reset password, OTP, Google login, and
the separate admin login — built on top of the `User`/`AuthIdentity`/`RefreshToken`/`OtpCode`/
`AdminUser` tables already defined in this schema. This is what will start actually issuing the
admin JWTs `AdminAuthGuard` checks, and what customer-facing cart/checkout (Milestones 4–6) will
build on for guest-to-user cart merging.
