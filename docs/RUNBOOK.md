# Operations Runbook

Operational procedures for the Unccodestore marketplace. Keep this current — it is
the first place to look during a deploy or incident.

## Environments

| Env | Notes |
| --- | --- |
| Local | `npm run dev`, hits configured `.env` (can point at a dev Turso DB) |
| Production | Vercel + Turso (libSQL). Env vars set in the Vercel project |

Secrets live only in `.env` (local) and the Vercel dashboard (production). `.env`
is gitignored; never commit real values. `.env.example` is the source of truth for
which variables are required.

## Deploy

1. Ensure `main` is green (CI: lint · typecheck · test · build).
2. **Apply pending DB migrations first** (see below) if the release includes a
   schema change, so the deployed code always finds the schema it expects.
3. Merge / push to `main`; Vercel builds and deploys automatically.
4. Smoke-test after deploy:
   - `/` loads and hero renders
   - `/templates` lists and paginates
   - `/template/<id>` loads; free + paid actions behave
   - `/checkout` opens PayPal (sandbox vs live per `PAYPAL_ENVIRONMENT`)
   - `/sitemap.xml` and `/robots.txt` respond
   - `/admin` reachable by an admin account

## Database migrations (Turso)

Migrations are generated from `src/server/db/schema.ts`.

```sh
npm run db:generate     # writes drizzle/XXXX_*.sql — review it before applying
npm run db:migrate      # applies pending migrations to the DB in TURSO_URL
```

Guidelines:
- Always **review the generated SQL**. Prefer additive migrations (new tables /
  indexes). Table rebuilds (FK changes) copy data but are riskier — take a backup
  first.
- Migrations are append-only. Never edit an already-applied migration file.

## Database backup & restore (Turso)

Back up before any risky change (schema rebuilds, bulk data edits, incidents).

```sh
# Dump the remote DB to a local file
turso db shell <db-name> .dump > backup-$(date +%F-%H%M).sql

# Restore into a fresh database
turso db create <db-name>-restore
turso db shell <db-name>-restore < backup-YYYY-MM-DD-HHMM.sql
```

Also use Turso's built-in point-in-time restore where available:
```sh
turso db show <db-name>            # note the URL + current timestamp
turso db shell <db-name>           # inspect / repair
```

Retain at least one off-site copy of each dump.

## Rollback

- **Code:** revert the offending commit on `main` (Vercel redeploys the previous
  build). Or use Vercel's "Instant Rollback" to a previous deployment.
- **Schema:** migrations are forward-only. To undo, write a new migration that
  reverses the change (drop table / column / index) rather than editing history.

## Incident checklist

1. Identify blast radius (which routes / server functions).
2. Check Vercel deployment logs and runtime logs; the app logs route errors via
   `src/lib/logger.ts` and the route-level error boundary.
3. If data integrity is at risk, take a Turso dump **immediately**.
4. Mitigate (rollback code, disable a feature flag / env var, fix forward).
5. Record a blameless postmortem; add a regression test where possible.

## Scheduled / manual maintenance

- **Rotate secrets** periodically: `BETTER_AUTH_SECRET`, PayPal secret, R2 keys,
  `LICENSE_API_SECRET`. Rotating `BETTER_AUTH_SECRET` invalidates sessions.
- **Newsletter / contacts** data is stored in the DB and viewable in `/admin`.
- **Audit log** (`audit_log`) records admin actions; review it after any incident.

## Environment variables

See [`.env.example`](../.env.example). Categories: app/auth, database, Google
OAuth, PayPal, Cloudflare R2, license server, and public (`VITE_`) values.

## Known follow-ups

### Referential-integrity foreign keys (not yet applied)

Several `user_id` columns (and `favorites.template_id`) lack database-level
`FOREIGN KEY` constraints. Adding them is desirable for integrity, **but**
`drizzle-kit` emits `ALTER TABLE ... ALTER COLUMN ... REFERENCES` for the SQLite
dialect, which SQLite/Turso do **not** support — that migration fails.

To add them safely, either:

1. Hand-write a migration using SQLite's official 12-step table-recreation
   procedure (create new table with the FK → copy rows → drop old → rename), for
   each affected table (`profiles`, `user_roles`, `favorites`, `orders`,
   `all_access_passes`, `downloads`, `license_keys`, `refund_requests`, `reviews`,
   `notifications`); or
2. Move to a Postgres-backed deployment where `ALTER TABLE ADD CONSTRAINT` works.

Note that SQLite only enforces FKs when `PRAGMA foreign_keys = ON` is set per
connection — enable it in `src/server/db/client.ts` when the constraints exist.

`order_items.template_id` is intentionally left without a FK so that deleting a
template does not erase purchase history.

### Other

- Pending: monitoring/error reporting (e.g. Sentry), image optimization/CDN pass.

