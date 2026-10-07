# Marketplace License Issuance — Design

**Date:** 2026-10-07
**Status:** Approved in brainstorming; pending final spec review.
**Repos:** `templateprv2` (marketplace, this repo) + `dogcatpro` (template being sold).

## 1. Goal

When a buyer purchases a template (e.g. **Dog Cat Pro / PetPaw**) on the
marketplace, automatically issue a license key and show it in the buyer's
account, so the buyer can copy it into the deployed template's `/admin` →
**Activate** screen. No manual key creation, no email.

The template side already ships the whole licensing engine (key server +
local grant verification + Activate UI). The missing piece is the **marketplace
↔ license server bridge**. This spec covers building that bridge and deploying
the license server.

## 2. Decisions (confirmed)

| Topic | Decision |
|---|---|
| Delivery channel | **Account only.** Key shown on the Downloads page (and Dashboard). **No email.** |
| All-Access Pass ($300) | **Gets no keys.** Pass stays downloads-only. Only individual template purchases mint keys. |
| Minting mechanism | **License-server endpoint** `POST /v1/keys`, shared-secret protected. Marketplace calls it on order completion. |
| Key granularity | **One stable key per (user, template).** Re-downloads show the same key; re-purchases do not duplicate. |
| Issuance timing | On order completion (PayPal capture and free claim), **best-effort**: never fail a purchase if the license server is down. Retried when the buyer opens Downloads. |
| Templates that issue keys | Only templates with a non-null `license_product` (Dog Cat Pro = `petpaw`). |

## 3. Non-goals

- No email delivery (Resend/Postmark/etc.).
- No license keys for All-Access Pass holders.
- No mobile/app-store licensing.
- No buyer-facing license portal on the license server.
- No self-service domain moves by the buyer (seller resets bindings in the
  license admin, as designed).
- No marketplace-driven revocation/refunds workflow in v1 (seller can revoke
  from the license admin page).

## 4. Architecture

```
Buyer pays (PayPal capture / free claim)
        │
        ▼
templateprv2: order completes → order_items inserted
        │
        │  POST /v1/keys  { product, note }        (header: x-admin-password)
        ▼
dogcatpro/license Worker ── creates key ──► D1 (licenses)
        │  { key }
        ▼
templateprv2: INSERT license_keys (user_id, template_id, product, key, order_id)
        │
        ▼
Buyer opens /downloads → sees "License key: PETPAW-XXXX-XXXX-XXXX" + Copy
        │
        ▼
Buyer drops template zip → /admin → Activate → pastes key
        │  POST /v1/activate { key, domain, product }
        ▼
license Worker binds domain → Ed25519 grant → template verifies locally → admin unlocks
```

The marketplace only ever moves a **key string**. Domain binding and the signed
grant remain the license server's and template's job (unchanged from the
existing design in
`dogcatpro/docs/superpowers/specs/2026-10-05-licensing-and-pages-distribution-design.md`).

## 5. Part A — License server (`dogcatpro/license/`)

### 5.1 Phase 0: deploy (one-time, currently undeployed)

`license/wrangler.jsonc` still has `"database_id": "REPLACE_WITH_D1_ID"`, and the
template's `DEMO.LICENSE_SERVER_URL` is the placeholder
`https://petpaw-license.YOUR-SUBDOMAIN.workers.dev`. Steps:

1. `wrangler d1 create petpaw-licenses` → paste id into `license/wrangler.jsonc`.
2. `wrangler d1 execute petpaw-licenses --file=./schema.sql --remote`.
3. `wrangler secret put LICENSE_PRIVATE_KEY` (private Ed25519 JWK; a public key
   is already baked into the template) and `wrangler secret put LICENSE_ADMIN_PASSWORD`.
4. `wrangler deploy` → record `https://petpaw-license.<subdomain>.workers.dev`.
5. Bake the real URL into `dogcatpro/server/src/env.ts` `DEMO.LICENSE_SERVER_URL`
   and rebuild the buyer Pages zip (`bun run package:pages`).

The signing keypair already exists (public JWK currently baked:
`{"crv":"Ed25519","kty":"OKP","x":"q2tMoDat1ek3FhSY-mBJp9FTwRQbwNSS-n8fC32REiI"}`).

### 5.2 Phase 1: `POST /v1/keys` (new)

Machine-facing key creation, guarded by the same shared secret the server
already uses for `/v1/deactivate`.

**Request**
```
POST /v1/keys
x-admin-password: <LICENSE_ADMIN_PASSWORD>
{ "product": "petpaw", "max_domains": 3, "mode": "forever", "note": "order:abc123" }
```
**Responses**
- `200 { "key": "PETPAW-XXXX-XXXX-XXXX" }`
- `401 { "error": "unauthorized" }` — missing/wrong `x-admin-password`
- `400 { "error": "invalid" }` — missing `product`

**Behavior**
- Reject unless `x-admin-password` matches `LICENSE_ADMIN_PASSWORD`.
- Normalize/validate `product`; `max_domains` default `3`; `mode` default `forever`.
- Generate the key with the existing `keygen()` helper (prefix from the product,
  e.g. `PETPAW`; alphabet excludes look-alike characters). `keygen` currently
  lives inside `license/src/admin.ts` and hardcodes `PETPAW`; extract it to a
  shared module and make the prefix a parameter before reusing it here.
- Insert via the existing store (`createLicense`) with `status: "active"`,
  `expires_at: null`, `created_at: now`.
- Return the generated key.

**Idempotency:** the endpoint always creates a fresh key. Duplicate prevention is
the marketplace's responsibility (§7.1) using its own `UNIQUE(user_id, template_id)`.

**Tests** (`license/src/__tests__/keys.test.ts`, in-memory store):
- correct password → `200`, key returned, row in store with right product/mode/max.
- wrong/missing password → `401`; nothing created.
- missing product → `400`.
- default `max_domains` = 3; key prefix matches product.

## 6. Part B — Marketplace schema (`templateprv2`)

### 6.1 `templates.license_product`

Add a nullable text column to `templates`:
```
license_product TEXT          -- e.g. "petpaw"; NULL = template ships no key
```
Only Dog Cat Pro is set to `petpaw` in v1.

### 6.2 New `license_keys` table

```
license_keys (
  id          TEXT PRIMARY KEY,          -- uuid
  user_id     TEXT NOT NULL,
  template_id TEXT NOT NULL,
  product     TEXT NOT NULL,
  key         TEXT NOT NULL,
  order_id    TEXT,                      -- orders.id of the first issuing order
  created_at  INTEGER NOT NULL,          -- timestamp
  UNIQUE (user_id, template_id)
)
```
Drizzle: `sqliteTable('license_keys', …)` in `src/server/db/schema.ts`; migration
via `bun run db:generate` then `bun run db:migrate`.

## 7. Part C — Issuance (`templateprv2` server)

### 7.1 New `src/server/functions/licenses.ts`

Interfaces:
- `mintKey(product: string, note: string): Promise<string | null>`
  — `fetch(`${LICENSE_SERVER_URL}/v1/keys`)` with header
  `x-admin-password: ${LICENSE_API_SECRET}` and a ~5s timeout; returns `data.key`
  or `null` on any error (never throws).
- `issueKeysForOrder(orderId: string): Promise<void>`
  — load the order + its items; for each item whose template has a non-null
  `license_product`, if no `license_keys` row exists for `(user_id, template_id)`,
  call `mintKey` and insert. Per-item try/catch: one failure never blocks others
  or the purchase.
- `getMyLicenses` (`createServerFn` GET)
  — `requireUser`; return the user's `license_keys` joined with template titles.
- `claimMyLicenses` (`createServerFn` POST)
  — `requireUser`; for the user's completed orders, re-run `issueKeysForOrder`
  for any missing keys (the retry path).

### 7.2 Hooks

- `src/server/functions/orders.ts` → `capturePayPalOrder`: after
  `orders.status = 'completed'` and `order_items` insert, `await issueKeysForOrder(order.id)` (wrapped so failure is logged, not thrown).
- `orders.ts` → `claimFreeOrder`: same call after items insert.

### 7.3 Config

Server-only env (`.env` / Vercel):
- `LICENSE_SERVER_URL` — e.g. `https://petpaw-license.<sub>.workers.dev`
- `LICENSE_API_SECRET` — the license server's `LICENSE_ADMIN_PASSWORD`

Never referenced from client code; never shipped in the browser bundle.

## 8. Part D — Buyer UI + admin

### 8.1 Downloads page (`src/routes/downloads.tsx`)

Add a **Licenses** card/section listing the buyer's keyed templates:
- Template title, key (`font-mono`) with a **Copy** button, and one line:
  *"Paste this into your site's `/admin` → Activate."*
- On load, call `claimMyLicenses` to fill any missing keys; if a keyed purchase
  has no key yet, show *"Generating your key…"* with a refresh action.

### 8.2 Dashboard (optional)

A small count/badge ("Licenses: N") linking to Downloads. Optional; not required.

### 8.3 Admin → Template form

Add a **"License product"** text input; persist to `templates.license_product` in
`src/server/functions/admin.ts` (`createTemplate` / `updateTemplate`) and
`src/components/admin/TemplateForm.tsx`. Set Dog Cat Pro to `petpaw`.

### 8.4 Hook

New `src/hooks/useLicenses.ts` mirroring `useDashboard.ts`:
`useMyLicenses()` → `useQuery(["licenses", user?.id], getMyLicenses)`.

## 9. Failure behavior

- **License server unreachable/down at purchase** → purchase still completes;
  `mintKey` returns `null`; no key row. Buyer sees "Generating your key…";
  retried via `claimMyLicenses` when Downloads opens.
- **Duplicate issuance** → unique index + existing-key check; a retry is a no-op.
- **Unset env** → `mintKey` returns `null` (logs a warning); store still works,
  keys simply do not appear until env is configured.
- **Refund/chargeback** → out of scope for v1; seller revokes the key in the
  license admin page if needed.

## 10. Security

- The shared secret is **server-side only** (Vercel env), never in the client
  bundle or the buyer zip.
- Keys are unguessable (`keygen` uses a restricted alphabet + `crypto.getRandomValues`).
- Keys are only returned to the authenticated owner (`requireUser`).
- The license server's private signing key never leaves the license Worker.
- Accepted limitation (unchanged): a buyer can strip the local grant check from
  their own deployed template — this is a deterrent + paper trail, not DRM.

## 11. Testing

- **License server** (`license/src/__tests__/keys.test.ts`): §5.2 cases.
- **Marketplace issuance** (`src/test/licenses.test.ts`): mocks the license-server
  fetch — `issueKeysForOrder` mints one key per keyed item, skips non-keyed
  items, is idempotent on re-run, and does not throw when the fetch fails.
- **Manual E2E**: buy Dog Cat Pro → key appears on Downloads → paste into the
  deployed template `/admin` → admin unlocks; wrong/missing key shows the
  template's Activate error.

Commands: `bun --cwd server test` (dogcatpro server), `bun test` in `license/`,
`bun run test` (templateprv2), `bun run build`.

## 12. Files touched (summary)

**dogcatpro**
- `license/src/app.ts` — add `POST /v1/keys`.
- `license/src/__tests__/keys.test.ts` — new tests.
- `license/wrangler.jsonc` — real D1 id.
- `license/README.md` — document `/v1/keys`.
- `server/src/env.ts` — real `LICENSE_SERVER_URL`; rebuild Pages zip.

**templateprv2**
- `src/server/db/schema.ts` — `templates.license_product`, `license_keys`.
- `drizzle/` — migration.
- `src/server/functions/licenses.ts` — new (mint / issue / get / claim).
- `src/server/functions/orders.ts` — hook on capture + free claim.
- `src/server/functions/admin.ts` + `src/components/admin/TemplateForm.tsx` — field.
- `src/routes/downloads.tsx` — Licenses section.
- `src/hooks/useLicenses.ts` — new.
- `.env` (and Vercel) — `LICENSE_SERVER_URL`, `LICENSE_API_SECRET`.

## 13. Rollout phases

0. Deploy the license server; bake its URL into the template; repackage the zip.
1. `POST /v1/keys` + tests.
2. Marketplace schema + migration.
3. Issuance on purchase + retry path.
4. Buyer UI (Downloads) + admin field.
5. End-to-end verification (buy → key → activate).

## 14. Open items

- Confirm the final license Worker hostname (`*.workers.dev` vs custom domain).
- Decide whether issuance runs synchronously within `capturePayPalOrder`
  (adds one network call to checkout) or is deferred — v1 proposes synchronous
  with a ~5s timeout and best-effort failure, so checkout UX is unaffected.
- Existing orders: `todos.md` records 0 real orders, so no backfill needed in v1.
- Future: map `extended` license type → larger/unlimited `max_domains`.
