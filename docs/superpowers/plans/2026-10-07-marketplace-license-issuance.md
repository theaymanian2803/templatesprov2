# Marketplace License Issuance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a buyer purchases a template on the marketplace, the marketplace automatically mints a license key on the (separately deployed) PetPaw license server and shows it in the buyer's account.

**Architecture:** The license server (`dogcatpro/license`, a Cloudflare Worker + D1) gains a shared-secret-protected `POST /v1/keys` endpoint. The marketplace (`templateprv2`, TanStack Start + Drizzle/Turso) calls it on order completion, stores the key in a new `license_keys` table, and displays it on the Downloads page. The marketplace only ever handles the key string; domain binding + signed grants stay on the license server.

**Tech Stack:** TypeScript, Hono + Cloudflare Workers + D1 (license server); TanStack Start server functions, Drizzle ORM, libSQL/Turso, React + TanStack Query, Vitest (marketplace).

**Spec:** `docs/superpowers/specs/2026-10-07-marketplace-license-issuance-design.md`

## Global Constraints

- Two repos, both on this machine:
  - License server + template: `C:\Users\PC\Desktop\dogcatpro`
  - Marketplace (this plan's working repo): `C:\Users\PC\Desktop\templateprv2`
- **Do not commit unless the user asks.** Treat every "Commit" step as a checkpoint.
- License server shared secret = its existing `LICENSE_ADMIN_PASSWORD`. Sent as the `x-admin-password` header (same pattern as `/v1/deactivate`).
- Product id for the template is `petpaw`.
- One key per `(user_id, template_id)`; enforced by a unique index. Re-runs are no-ops.
- Issuance is **best-effort**: the purchase must never fail because the license server is down.
- Do **not** regenerate the license signing keypair (it would invalidate the public key already baked into the template). Reuse the existing private JWK from `license/.dev.vars`.
- License server env vars, server-side only: `LICENSE_SERVER_URL`, `LICENSE_API_SECRET`. Never referenced from client code.

---

## Part A — License server (`dogcatpro/license`)

### Task 1: Extract the `keygen` helper into a shared module

**Files:**
- Create: `dogcatpro/license/src/keys.ts`
- Modify: `dogcatpro/license/src/admin.ts:10-17` (remove local `keygen`, import it)

**Interfaces:**
- Produces: `keygen(prefix: string): string` — returns `"<PREFIX>-XXXX-XXXX-XXXX"`.

- [ ] **Step 1: Create `src/keys.ts`**

```ts
/** Generates a product key like "PETPAW-7F3K-9Q2M-XB4T". Alphabet avoids look-alikes. */
export function keygen(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => alphabet[b % alphabet.length])
      .join("");
  return `${prefix}-${block()}-${block()}-${block()}`;
}
```

- [ ] **Step 2: Update `src/admin.ts`**

Delete the local `function keygen(...)` (currently lines 10-17) and add the import at the top:

```ts
import { keygen } from "./keys";
```

- [ ] **Step 3: Typecheck**

Run (in `C:\Users\PC\Desktop\dogcatpro\license`): `bun run typecheck`
Expected: no errors. Existing `/admin` key creation still calls `keygen("PETPAW")`.

### Task 2: Add `POST /v1/keys` to the license server

**Files:**
- Create: `dogcatpro/license/src/__tests__/keys.test.ts`
- Modify: `dogcatpro/license/src/app.ts` (add import + route before `app.route("/admin", …)`)
- Modify: `dogcatpro/license/README.md` (document the endpoint)

**Interfaces:**
- Consumes: `keygen` from Task 1; `deps.store.createLicense` (existing store).
- Produces: `POST /v1/keys` → `200 { key }` | `401 { error:"unauthorized" }` | `400 { error:"invalid" }`.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/keys.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createApp } from "../app";
import { memoryStore } from "../store";
import { generateKeyPair } from "../grant";
import { keygen } from "../keys";

async function harness() {
  const { privateJwk } = await generateKeyPair();
  const store = memoryStore();
  const app = createApp({ store, privateJwk, adminPassword: "pw" });
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    app.request(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  return { store, post };
}

describe("keygen", () => {
  it("formats as PREFIX-XXXX-XXXX-XXXX", () => {
    expect(keygen("PETPAW")).toMatch(/^PETPAW-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});

describe("license server /v1/keys", () => {
  it("rejects a missing/wrong admin password", async () => {
    const h = await harness();
    const res = await h.post("/v1/keys", { product: "petpaw" });
    expect(res.status).toBe(401);
    expect(await h.store.listLicenses()).toHaveLength(0);
  });

  it("rejects a missing product", async () => {
    const h = await harness();
    const res = await h.post("/v1/keys", {}, { "x-admin-password": "pw" });
    expect(res.status).toBe(400);
  });

  it("creates an active forever key with a product prefix and default max_domains=3", async () => {
    const h = await harness();
    const res = await h.post("/v1/keys", { product: "petpaw", note: "order:abc" }, { "x-admin-password": "pw" });
    expect(res.status).toBe(200);
    const { key } = (await res.json()) as { key: string };
    expect(key).toMatch(/^PETPAW-/);
    const lic = await h.store.getLicense(key);
    expect(lic?.product).toBe("petpaw");
    expect(lic?.mode).toBe("forever");
    expect(lic?.status).toBe("active");
    expect(lic?.max_domains).toBe(3);
    expect(lic?.note).toBe("order:abc");
  });

  it("honours max_domains and mode overrides", async () => {
    const h = await harness();
    const res = await h.post(
      "/v1/keys",
      { product: "petpaw", max_domains: 5, mode: "managed" },
      { "x-admin-password": "pw" },
    );
    const { key } = (await res.json()) as { key: string };
    const lic = await h.store.getLicense(key);
    expect(lic?.max_domains).toBe(5);
    expect(lic?.mode).toBe("managed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `C:\Users\PC\Desktop\dogcatpro\license`): `bun test`
Expected: FAIL — `keygen` module not found / `/v1/keys` returns 404.

- [ ] **Step 3: Implement the route in `src/app.ts`**

Add the import next to the others:

```ts
import { keygen } from "./keys";
```

Add this route immediately before the line `app.route("/admin", adminRoutes({...}));`:

```ts
  // Machine-facing key creation for the marketplace. Shared-secret protected.
  app.post("/v1/keys", async (c) => {
    if (String(c.req.header("x-admin-password") ?? "") !== deps.adminPassword) {
      return c.json({ error: "unauthorized" }, 401);
    }
    const b = await safeJson(c);
    if (!b) return c.json({ error: "invalid" }, 400);
    const product = String(b.product ?? "").trim();
    if (!product) return c.json({ error: "invalid" }, 400);
    const max_domains = Math.max(1, Number(b.max_domains ?? 3) || 3);
    const mode: LicenseMode = b.mode === "managed" ? "managed" : "forever";
    const prefix = product.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "KEY";
    const key = keygen(prefix);
    await deps.store.createLicense({
      key,
      product,
      max_domains,
      mode,
      status: "active",
      expires_at: null,
      note: String(b.note ?? "").trim() || null,
      created_at: new Date(now()).toISOString(),
    });
    return c.json({ key });
  });
```

Add the type import at the top of `src/app.ts` (alongside the existing `Store` import):

```ts
import type { LicenseMode, Store } from "./store";
```

(If your existing line is `import type { Store } from "./store";`, replace it with the line above.)

- [ ] **Step 4: Run tests to verify they pass**

Run (in `C:\Users\PC\Desktop\dogcatpro\license`): `bun test`
Expected: PASS (existing activate tests + new keys tests).

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: no errors.

- [ ] **Step 6: Update `README.md`**

In the API table, add a row:

```
| `POST /v1/keys` | `{ product, max_domains?, mode?, note? }` + `x-admin-password` header | `{ key }` or `401/400` |
```

- [ ] **Step 7: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\dogcatpro add license/src/keys.ts license/src/app.ts license/src/admin.ts license/src/__tests__/keys.test.ts license/README.md
git -C C:\Users\PC\Desktop\dogcatpro commit -m "feat(license): add shared-secret POST /v1/keys endpoint"
```

### Task 3: Deploy the license server and bake its URL everywhere

This is an operational runbook (no tests). It must be done before end-to-end verification.

**Files:**
- Modify: `dogcatpro/license/wrangler.jsonc:9` (`database_id`)
- Modify: `dogcatpro/server/src/env.ts:51` (`DEMO.LICENSE_SERVER_URL`)
- Modify: `templateprv2/.env` (add two vars)

- [ ] **Step 1: Create the D1 database**

Run (in `C:\Users\PC\Desktop\dogcatpro\license`): `npx wrangler d1 create petpaw-licenses`
Expected: prints a `database_id`. Paste it into `license/wrangler.jsonc` replacing `REPLACE_WITH_D1_ID`.

- [ ] **Step 2: Apply the schema remotely**

Run: `npx wrangler d1 execute petpaw-licenses --file=./schema.sql --remote`
Expected: `licenses` and `activations` tables created.

- [ ] **Step 3: Set secrets (reuse the existing keypair — do NOT run `genkeys`)**

Run:
```
npx wrangler secret put LICENSE_PRIVATE_KEY
npx wrangler secret put LICENSE_ADMIN_PASSWORD
```
Paste the **existing** values from `license/.dev.vars` for both prompts. Confirm the public key derived from that private JWK still matches the one baked in `server/src/env.ts` (`...x":"q2tMoDat1ek3FhSY-mBJp9FTwRQbwNSS-n8fC32REiI"`).

- [ ] **Step 4: Deploy and record the URL**

Run: `npx wrangler deploy`
Expected: prints `https://petpaw-license.<subdomain>.workers.dev`. Record it.

- [ ] **Step 5: Bake the URL into the template**

Edit `dogcatpro/server/src/env.ts` line 51, replacing the placeholder:

```ts
  LICENSE_SERVER_URL: "https://petpaw-license.<subdomain>.workers.dev",
```

- [ ] **Step 6: Smoke-test the endpoint**

Run (replace URL + password):
```
curl -s -X POST https://petpaw-license.<subdomain>.workers.dev/v1/keys -H "content-type: application/json" -H "x-admin-password: <LICENSE_ADMIN_PASSWORD>" -d "{\"product\":\"petpaw\"}"
```
Expected: `{"key":"PETPAW-...."}`. Then confirm it appears at `https://<host>/admin`.

- [ ] **Step 7: Rebuild the buyer Pages zip**

Run (in `C:\Users\PC\Desktop\dogcatpro`): `bun run package:pages`
Expected: zip regenerated; `_worker.js` contains the new URL.

- [ ] **Step 8: Add marketplace env vars**

Append to `C:\Users\PC\Desktop\templateprv2\.env`:

```
LICENSE_SERVER_URL=https://petpaw-license.<subdomain>.workers.dev
LICENSE_API_SECRET=<LICENSE_ADMIN_PASSWORD>
```

Also add both to the Vercel project env (Production + Preview) before deploying the marketplace.

---

## Part B — Marketplace (`templateprv2`)

### Task 4: Add schema — `templates.license_product` + `license_keys`

**Files:**
- Modify: `templateprv2/src/server/db/schema.ts`
- Create: `templateprv2/drizzle/0001_*.sql` (generated)

**Interfaces:**
- Produces: `templates.license_product` (nullable text); `license_keys` table with `UNIQUE(user_id, template_id)`.

- [ ] **Step 1: Add the column to `templates`**

In `src/server/db/schema.ts`, inside the `templates` table definition (after `youtube_id`), add:

```ts
  license_product: text('license_product'),
```

- [ ] **Step 2: Add the `license_keys` table**

Add after the `template_downloads` table definition:

```ts
export const license_keys = sqliteTable('license_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull(),
  product: text('product').notNull(),
  key: text('key').notNull(),
  order_id: text('order_id'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('license_keys_user_template_idx').on(t.user_id, t.template_id)])
```

- [ ] **Step 3: Generate the migration**

Run (in `C:\Users\PC\Desktop\templateprv2`): `bun run db:generate`
Expected: a new `drizzle/0001_*.sql` with `ALTER TABLE templates ADD COLUMN license_product` (libSQL may generate a table-recreate statement) and `CREATE TABLE license_keys`.

- [ ] **Step 4: Apply the migration**

Run: `bun run db:migrate`
Expected: applies cleanly against Turso.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\templateprv2 add src/server/db/schema.ts drizzle
git -C C:\Users\PC\Desktop\templateprv2 commit -m "feat(db): add templates.license_product and license_keys"
```

### Task 5: Pure planner `planKeyIssuance` (licenses-core)

**Files:**
- Create: `templateprv2/src/server/functions/licenses-core.ts`
- Test: `templateprv2/src/test/licenses.test.ts`

**Interfaces:**
- Produces: `planKeyIssuance(items, productByTemplate, existingTemplateIds): { template_id; product }[]` — the templates to mint, de-duplicated, skipping non-keyed and already-issued ones.

- [ ] **Step 1: Write the failing test**

Create `src/test/licenses.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { planKeyIssuance } from '@/server/functions/licenses-core'

describe('planKeyIssuance', () => {
  const products = new Map<string, string | null>([
    ['t-petpaw', 'petpaw'],
    ['t-plain', null],
  ])

  it('plans only keyed templates', () => {
    const plan = planKeyIssuance(
      [{ template_id: 't-petpaw' }, { template_id: 't-plain' }],
      products,
      new Set(),
    )
    expect(plan).toEqual([{ template_id: 't-petpaw', product: 'petpaw' }])
  })

  it('skips templates that already have a key', () => {
    const plan = planKeyIssuance([{ template_id: 't-petpaw' }], products, new Set(['t-petpaw']))
    expect(plan).toEqual([])
  })

  it('de-duplicates repeated line items', () => {
    const plan = planKeyIssuance(
      [{ template_id: 't-petpaw' }, { template_id: 't-petpaw' }],
      products,
      new Set(),
    )
    expect(plan).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/test/licenses.test.ts`
Expected: FAIL — cannot resolve `licenses-core`.

- [ ] **Step 3: Implement `src/server/functions/licenses-core.ts`**

```ts
export type KeyPlanItem = { template_id: string; product: string }

/** Which keyed templates still need a key minted for this order. Pure. */
export function planKeyIssuance(
  items: { template_id: string }[],
  productByTemplate: Map<string, string | null>,
  existingTemplateIds: Set<string>,
): KeyPlanItem[] {
  const plan: KeyPlanItem[] = []
  const queued = new Set<string>()
  for (const item of items) {
    const product = productByTemplate.get(item.template_id)
    if (!product) continue
    if (existingTemplateIds.has(item.template_id)) continue
    if (queued.has(item.template_id)) continue
    queued.add(item.template_id)
    plan.push({ template_id: item.template_id, product })
  }
  return plan
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/test/licenses.test.ts`
Expected: PASS.

### Task 6: `mintKey` fetch wrapper (licenses-core)

**Files:**
- Modify: `templateprv2/src/server/functions/licenses-core.ts`
- Modify: `templateprv2/src/test/licenses.test.ts`

**Interfaces:**
- Produces: `mintKey(product: string, note: string, fetchImpl?: typeof fetch): Promise<string | null>` — never throws; `null` on any failure or missing env.

- [ ] **Step 1: Add failing tests**

Append to `src/test/licenses.test.ts`:

```ts
import { mintKey } from '@/server/functions/licenses-core'

describe('mintKey', () => {
  it('returns the key on 200', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    const fake = (async () => new Response(JSON.stringify({ key: 'PETPAW-AAAA-BBBB-CCCC' }), { status: 200 })) as unknown as typeof fetch
    expect(await mintKey('petpaw', 'order:1', fake)).toBe('PETPAW-AAAA-BBBB-CCCC')
  })

  it('sends the shared secret and product', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    let seen: { url: string; init?: RequestInit } | null = null
    const fake = (async (url: string, init?: RequestInit) => {
      seen = { url, init }
      return new Response(JSON.stringify({ key: 'K' }), { status: 200 })
    }) as unknown as typeof fetch
    await mintKey('petpaw', 'order:9', fake)
    expect(seen!.url).toBe('https://lic.example.com/v1/keys')
    expect((seen!.init!.headers as Record<string, string>)['x-admin-password']).toBe('pw')
    expect(JSON.parse(String(seen!.init!.body))).toEqual({ product: 'petpaw', note: 'order:9' })
  })

  it('returns null on a non-200', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    const fake = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch
    expect(await mintKey('petpaw', 'order:1', fake)).toBeNull()
  })

  it('returns null when env is missing', async () => {
    delete process.env.LICENSE_SERVER_URL
    delete process.env.LICENSE_API_SECRET
    expect(await mintKey('petpaw', 'order:1')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/test/licenses.test.ts`
Expected: FAIL — `mintKey` is not exported.

- [ ] **Step 3: Implement `mintKey`**

Append to `src/server/functions/licenses-core.ts`:

```ts
/** Calls the license server to mint a key. Never throws; null means "try again later". */
export async function mintKey(
  product: string,
  note: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const url = process.env.LICENSE_SERVER_URL
  const secret = process.env.LICENSE_API_SECRET
  if (!url || !secret) {
    console.warn('[licenses] LICENSE_SERVER_URL / LICENSE_API_SECRET not set; skipping key mint')
    return null
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/v1/keys`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-password': secret },
      body: JSON.stringify({ product, note }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as { key?: string }
    return data.key ?? null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/test/licenses.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\templateprv2 add src/server/functions/licenses-core.ts src/test/licenses.test.ts
git -C C:\Users\PC\Desktop\templateprv2 commit -m "feat(licenses): pure key planner + mintKey wrapper"
```

### Task 7: Server functions + hook into order completion

**Files:**
- Create: `templateprv2/src/server/functions/licenses.ts`
- Modify: `templateprv2/src/server/functions/orders.ts` (import + call after completion)

**Interfaces:**
- Consumes: `planKeyIssuance`, `mintKey` (Tasks 5-6); `license_keys`, `templates`, `orders`, `order_items` (Task 4).
- Produces: `issueKeysForOrder(orderId: string): Promise<void>`; `getMyLicenses()`; `claimMyLicenses()`.

- [ ] **Step 1: Create `src/server/functions/licenses.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { orders, order_items, templates, license_keys } from '../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { requireUser } from '../admin'
import { planKeyIssuance, mintKey } from './licenses-core'

/** Mints + stores any missing keys for a completed order. Best-effort; never throws. */
export async function issueKeysForOrder(orderId: string): Promise<void> {
  try {
    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0]
    if (!order) return
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))
    if (!items.length) return

    const templateIds = [...new Set(items.map((i) => i.template_id))]
    const tpls = await db.select().from(templates).where(inArray(templates.id, templateIds))
    const productByTemplate = new Map(tpls.map((t) => [t.id, t.license_product ?? null]))

    const existing = await db
      .select()
      .from(license_keys)
      .where(and(eq(license_keys.user_id, order.user_id), inArray(license_keys.template_id, templateIds)))
    const existingIds = new Set(existing.map((k) => k.template_id))

    for (const plan of planKeyIssuance(items, productByTemplate, existingIds)) {
      const key = await mintKey(plan.product, `order:${orderId}`)
      if (!key) continue
      await db
        .insert(license_keys)
        .values({
          user_id: order.user_id,
          template_id: plan.template_id,
          product: plan.product,
          key,
          order_id: orderId,
        })
        .onConflictDoNothing()
    }
  } catch (e) {
    console.error('[licenses] issueKeysForOrder failed', e)
  }
}

export const getMyLicenses = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select().from(license_keys).where(eq(license_keys.user_id, user.id))
  const ids = [...new Set(rows.map((r) => r.template_id))]
  const tpls = ids.length ? await db.select().from(templates).where(inArray(templates.id, ids)) : []
  const titleMap = new Map(tpls.map((t) => [t.id, t.title]))
  return rows.map((r) => ({ ...r, template_title: titleMap.get(r.template_id) ?? 'Template' }))
})

export const claimMyLicenses = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  const completed = await db
    .select()
    .from(orders)
    .where(and(eq(orders.user_id, user.id), eq(orders.status, 'completed')))
  for (const order of completed) await issueKeysForOrder(order.id)
  return { success: true }
})
```

- [ ] **Step 2: Hook into `capturePayPalOrder`**

In `src/server/functions/orders.ts`, add the import:

```ts
import { issueKeysForOrder } from './licenses'
```

In `capturePayPalOrder`, immediately after the line that inserts `order_items` for the cart branch (the `else { await db.insert(order_items)...; for (const v of verified) await incrementSales(v.id) }` block, after the `for` loop), add:

```ts
      await issueKeysForOrder(order.id)
```

- [ ] **Step 3: Hook into `claimFreeOrder`**

In `claimFreeOrder`, after `for (const v of verified) await incrementSales(v.id)` and immediately before `return { success: true, orderId: order.id, free: true }`, add:

```ts
    await issueKeysForOrder(order.id)
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\templateprv2 add src/server/functions/licenses.ts src/server/functions/orders.ts
git -C C:\Users\PC\Desktop\templateprv2 commit -m "feat(licenses): issue keys on order completion"
```

### Task 8: Buyer UI — Licenses section on Downloads

**Files:**
- Create: `templateprv2/src/hooks/useLicenses.ts`
- Create: `templateprv2/src/components/BuyerLicenses.tsx`
- Modify: `templateprv2/src/routes/downloads.tsx` (render `<BuyerLicenses />`)

**Interfaces:**
- Consumes: `getMyLicenses`, `claimMyLicenses` (Task 7).
- Produces: `useMyLicenses()` hook; `<BuyerLicenses />` component.

- [ ] **Step 1: Create `src/hooks/useLicenses.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getMyLicenses } from '@/server/functions/licenses'

export interface MyLicense {
  id: string
  template_id: string
  template_title: string
  product: string
  key: string
  order_id: string | null
  created_at: string
}

export const useMyLicenses = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['licenses', user?.id],
    queryFn: async () => (user ? getMyLicenses() : []),
    enabled: !!user,
  })
}
```

- [ ] **Step 2: Create `src/components/BuyerLicenses.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useMyLicenses } from '@/hooks/useLicenses'
import { claimMyLicenses } from '@/server/functions/licenses'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Copy, Loader2 } from 'lucide-react'

const BuyerLicenses = () => {
  const { data: licenses, isLoading } = useMyLicenses()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    let active = true
    setClaiming(true)
    claimMyLicenses()
      .then(() => active && queryClient.invalidateQueries({ queryKey: ['licenses'] }))
      .catch(() => {})
      .finally(() => active && setClaiming(false))
    return () => {
      active = false
    }
  }, [queryClient])

  if (isLoading || (claiming && !licenses?.length)) {
    return (
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your licenses…
      </div>
    )
  }
  if (!licenses?.length) return null

  const copy = async (key: string) => {
    await navigator.clipboard.writeText(key)
    toast({ title: 'License key copied', description: 'Paste it into your site’s /admin → Activate.' })
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary" /> Your license keys
      </h2>
      <div className="space-y-3">
        {licenses.map((lic) => (
          <Card key={lic.id} className="border-border/50">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{lic.template_title}</p>
                <code className="text-xs font-mono text-muted-foreground break-all">{lic.key}</code>
              </div>
              <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => copy(lic.key)}>
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Paste your key into your deployed template’s <code>/admin</code> → <strong>Activate</strong> screen.
      </p>
    </div>
  )
}

export default BuyerLicenses
```

- [ ] **Step 3: Render it in `src/routes/downloads.tsx`**

Add the import:

```tsx
import BuyerLicenses from '@/components/BuyerLicenses'
```

Then, immediately after the closing `</div>` of the header block (after the `<p className="text-muted-foreground mt-1">…</p></div>` around line 97) and before the All-Access banner, insert:

```tsx
          <BuyerLicenses />
```

- [ ] **Step 4: Build**

Run: `bun run build`
Expected: builds successfully.

- [ ] **Step 5: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\templateprv2 add src/hooks/useLicenses.ts src/components/BuyerLicenses.tsx src/routes/downloads.tsx
git -C C:\Users\PC\Desktop\templateprv2 commit -m "feat(licenses): show buyer license keys on Downloads"
```

### Task 9: Admin — set a template's license product

**Files:**
- Modify: `templateprv2/src/server/functions/admin.ts` (create + update)
- Modify: `templateprv2/src/components/admin/TemplateForm.tsx`
- Modify: `templateprv2/src/hooks/useTemplates.ts` (`Template` interface)

**Interfaces:**
- Consumes: `templates.license_product` (Task 4).
- Produces: admin can set/clear `license_product` on a template.

- [ ] **Step 1: Persist it in `src/server/functions/admin.ts`**

In `adminSaveTemplate`, add to the **update** `.set({...})` object:

```ts
          license_product: data.license_product?.trim() || null,
```

And to the **insert** `.values({...})` object:

```ts
        license_product: data.license_product?.trim() || null,
```

- [ ] **Step 2: Add the field to the `Template` type**

In `src/hooks/useTemplates.ts`, add to the `Template` interface (after `youtube_id`):

```ts
  license_product?: string | null
```

- [ ] **Step 3: Add the input to `src/components/admin/TemplateForm.tsx`**

Add state (near `sourceFileUrl`):

```tsx
  const [licenseProduct, setLicenseProduct] = useState('')
```

Populate it when editing (in the `if (template)` block):

```tsx
      setLicenseProduct(template.license_product || '')
```

Include it in the `onSubmit` payload (in `handleSubmit`'s `onSubmit({ ... })`):

```tsx
      license_product: licenseProduct.trim() || null,
```

Add the input UI — place this block just above the `{/* Source File Upload (R2) or manual URL */}` comment:

```tsx
        {/* License product */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="licenseProduct">License product</Label>
          <Input
            id="licenseProduct"
            value={licenseProduct}
            onChange={(e) => setLicenseProduct(e.target.value)}
            placeholder="e.g. petpaw (leave blank if this template ships no key)"
          />
          <p className="text-xs text-muted-foreground">
            When set, buyers of this template automatically get a matching license key.
          </p>
        </div>
```

- [ ] **Step 4: Build**

Run: `bun run build`
Expected: builds successfully.

- [ ] **Step 5: Set Dog Cat Pro**

In the admin UI, edit the Dog Cat Pro template and set **License product** = `petpaw`, then save. (Or run SQL against Turso: `UPDATE templates SET license_product = 'petpaw' WHERE title LIKE '%Dog%Cat%';`.)

- [ ] **Step 6: Commit (checkpoint — only if the user asks)**

```bash
git -C C:\Users\PC\Desktop\templateprv2 add src/server/functions/admin.ts src/components/admin/TemplateForm.tsx src/hooks/useTemplates.ts
git -C C:\Users\PC\Desktop\templateprv2 commit -m "feat(admin): license product field on templates"
```

### Task 10: Full test run + end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Run every test suite**

```
cd C:\Users\PC\Desktop\dogcatpro\license && bun test && bun run typecheck
cd C:\Users\PC\Desktop\dogcatpro && bun --cwd server test && bun --cwd server run typecheck
cd C:\Users\PC\Desktop\templateprv2 && bun run test && bun run build
```
Expected: all PASS.

- [ ] **Step 2: End-to-end (real click-through)**

1. Start the marketplace (`bun run dev`) and the license server (`bun run dev` in `dogcatpro/license`).
2. Buy Dog Cat Pro with a $0 test coupon (free claim path) or PayPal sandbox.
3. Open `/downloads` → the **Your license keys** card shows a `PETPAW-…` key.
4. Deploy/run the PetPaw template (or `wrangler pages dev dist-pages`) → `/admin` shows the Activate screen → paste the key → admin unlocks.
5. At `https://<license-host>/admin`, confirm the key is listed with `1 / 3` domains and the bound domain.

- [ ] **Step 3: Failure-path check**

Temporarily stop the license server, place a new test order, and confirm:
- the order still completes,
- Downloads shows no key yet (no crash),
- restarting the server and reloading Downloads backfills the key via `claimMyLicenses`.

## Self-Review

- **Spec coverage:** §5.1 deploy → Task 3; §5.2 endpoint → Tasks 1-2; §6 schema → Task 4; §7.1 issuance → Tasks 5-7; §7.2 hooks → Task 7; §7.3 config → Tasks 3, 10; §8.1 Downloads UI → Task 8; §8.3 admin field → Task 9; §9 failure behavior → Tasks 6, 10; §11 testing → Tasks 2, 5, 6, 10.
- **Type consistency:** `planKeyIssuance(items, productByTemplate, existingTemplateIds)` and `mintKey(product, note, fetchImpl?)` defined in Tasks 5-6 and consumed unchanged in Task 7; `license_keys` columns match between schema (Task 4) and inserts (Task 7); `keygen(prefix)` (Task 1) reused in Task 2.
- **Placeholders:** none — all code is literal; `<subdomain>` / `<LICENSE_ADMIN_PASSWORD>` are deploy-time values the operator supplies in Task 3.
