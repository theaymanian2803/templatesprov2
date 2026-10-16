# Unccodestore (templateprv2)

A multilingual marketplace for premium web templates and source code. Built with
TanStack Start/Router, React 18, Drizzle + Turso (libSQL), Better Auth, and PayPal.

## Tech stack

- **TanStack Start + TanStack Router** — SSR, file-based routing, server functions
- **React 18 + TypeScript**, **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Drizzle ORM** on **Turso / libSQL**
- **Better Auth** (email/password + Google) with roles in `user_roles`
- **PayPal** (server-side orders, capture, and verification)
- **Cloudflare R2** for image/file uploads
- **i18next** — French (default), Arabic (RTL), English
- **Vitest** + Testing Library
- **framer-motion** for animation

## Getting started

```sh
npm install
cp .env.example .env   # fill in the values
npm run db:migrate     # apply migrations to your Turso database
npm run db:seed        # optional: seed sample data
npm run dev            # http://localhost:8080
```

See [`.env.example`](./.env.example) for every required variable.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (port 8080) |
| `npm run build` | Production build (client + Nitro server) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` — TypeScript check |
| `npm run test` | Vitest (run once) |
| `npm run test:watch` | Vitest (watch) |
| `npm run db:generate` | Generate a Drizzle migration from `schema.ts` |
| `npm run db:migrate` | Apply migrations to Turso |
| `npm run db:seed` | Seed the database |
| `npm run post:template` | Publish a template bundle |

> `src/routeTree.gen.ts` is generated and gitignored. It is produced by the Vite
> plugin during `dev`/`build`, so **build before typechecking** in CI (see
> `.github/workflows/ci.yml`).

## Project structure

```
src/
  routes/            File-based routes (pages + server routes like sitemap.xml, api/auth)
  components/        UI components (shop, preview, profile, admin, ui)
  server/
    functions/       Server functions (createServerFn) grouped by domain
    db/              Drizzle schema, client, seed
    auth.ts          Better Auth config
    admin.ts         isAdmin / requireAdmin / requireUser guards
    audit.ts         Audit-log helper
  contexts/          Auth, Cart, Favorites providers
  hooks/             React Query data hooks
  i18n/              i18next init + locale files (en/fr/ar)
  lib/               Utilities (router, format, seeded, site, logger)
drizzle/             Generated SQL migrations
docs/                Design specs, plans, and the operations runbook
```

## Admin

The `/admin` panel (desktop only, English) covers: Templates, Downloads, Orders,
Coupons, Reviews, Messages, Refunds, Users & roles, Newsletter, Settings, and an
Audit log. Admin is granted via the `ADMIN_EMAIL` env var on signup, or from the
Users tab by an existing admin.

## Internationalization

Three locales live in `src/i18n/locales/` (`en`, `fr`, `ar`). A parity test
(`src/test/i18n-parity.test.ts`) fails the build if the locales drift. Use
`const { t } = useTranslation()` and `t('namespace.key')`.

## Operations

See [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) for deployment, database backup, and
incident/deploy procedures.

## Verification

```sh
npm run lint && npm run typecheck && npm run test && npm run build
```
