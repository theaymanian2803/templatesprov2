# templateprv2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Duplicate `templatepro` into `C:\Users\PC\Desktop\templateprv2` and replace its backend (Supabase) with TanStack Start + Turso (libSQL) + Drizzle + Better Auth, keeping Cloudflare R2 uploads and PayPal payments.

**Architecture:** TanStack Start full-stack React app. All data access moves behind `createServerFn` server functions that read the Better Auth session and query Turso via Drizzle. The 31 files that imported `@/integrations/supabase/client` are repointed to server functions; UI/components/styles/i18n are otherwise unchanged.

**Tech Stack:** TanStack Start (React 18), TanStack Router, React Query, `@libsql/client`, Drizzle ORM + drizzle-kit, Better Auth, `@aws-sdk/client-s3` (R2 presign), PayPal REST API, shadcn/ui + Tailwind, Zustand, Framer Motion, i18next, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-19-templateprv2-tanstack-turso-migration-design.md`

## Global Constraints

- Target directory: `C:\Users\PC\Desktop\templateprv2` (separate git repo, fresh `git init`).
- Money values are JS `number` stored as SQLite `real` (matches existing behavior).
- UUID columns become `text`; ids generated with `crypto.randomUUID()`.
- `text[]`/`jsonb` columns become `text` with Drizzle `{ mode: 'json' }`.
- Timestamps become `integer` with Drizzle `{ mode: 'timestamp' }` (unix ms).
- **App table columns use snake_case Drizzle keys** (`user_id`, `extended_price`, `is_active`, ...) so `db.select()` returns objects identical to the old Supabase rows and no field mapping is needed. Better Auth's own tables keep the camelCase shape Better Auth expects.
- Remove packages: `@supabase/supabase-js`, `react-router-dom`, `next-themes`.
- No AI `chat` endpoint (dropped). No realtime push; notifications are polled via React Query.
- Keep R2 + PayPal credentials from the existing `.env`; `PAYPAL_SECRET` will be added by the user.
- No comments in code unless the surrounding file already uses them.

---

### Task 1: Copy project to templateprv2 and prune Supabase

**Files:**
- Create: `C:\Users\PC\Desktop\templateprv2\` (whole tree, copied)
- Modify: `C:\Users\PC\Desktop\templateprv2\.env`
- Delete: `supabase/`, `.codex/`, `.claude/`, `node_modules/`, `dist/`, `.git/`, `bun.lock`, `bun.lockb`, `tsconfig.*.tsbuildinfo`

- [ ] **Step 1: Copy the tree**

Run in PowerShell:

```powershell
$src = "C:\Users\PC\Desktop\templatepro"
$dst = "C:\Users\PC\Desktop\templateprv2"
robocopy $src $dst /E /XD node_modules dist .git .codex .claude supabase /XF bun.lock bun.lockb tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo /NFL /NDL /NJH /NJS
```

- [ ] **Step 2: Init git**

```powershell
Set-Location "C:\Users\PC\Desktop\templateprv2"
git init
```

- [ ] **Step 3: Rewrite .env**

Replace the contents of `C:\Users\PC\Desktop\templateprv2\.env` with:

```
VITE_PAYPAL_CLIENT_ID="BAAp_xzVIhQegnj_dt3Xh3UV9nl7U40o3DanYl-VrUOUAqmEcx6-uVu6BkcNhXqT_3ZIXbMSgmyNqS2LSM"
PAYPAL_SECRET=""
PAYPAL_ENVIRONMENT="sandbox"

R2_ACCOUNT_ID="caa1f8a667f00938cd9467535aba58f5"
R2_BUCKET_NAME="templatewebsite"
R2_ACCESS_KEY_ID="7a08ce4992578180294443b041c9f351"
R2_SECRET_ACCESS_KEY="70b5c8140dab234e889a4fa0d498476645fc710d151659efbc44919dba774117"
R2_PUBLIC_DOMAIN="https://pub-3fe2b2a234a04507951dc3d5646b7a33.r2.dev"

TURSO_URL=""
TURSO_AUTH_TOKEN=""
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
ADMIN_EMAIL=""
```

(`PAYPAL_SECRET`, `TURSO_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL` are user-supplied.)

- [ ] **Step 4: Remove Supabase client dir**

```powershell
Remove-Item -LiteralPath "C:\Users\PC\Desktop\templateprv2\src\integrations" -Recurse -Force
```

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "chore: copy templatepro to templateprv2 and prune supabase"
```

---

### Task 2: Install dependencies and configure TanStack Start

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts` (rewrite)
- Modify: `tsconfig.json`
- Create: `src/router.tsx`
- Delete: `src/main.tsx`

- [ ] **Step 1: Install new deps**

```powershell
npm install @tanstack/react-start @tanstack/react-router @tanstack/react-query @libsql/client drizzle-orm better-auth @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```powershell
npm install -D @tanstack/router-plugin drizzle-kit tsx vite-tsconfig-paths
```

- [ ] **Step 2: Uninstall removed deps**

```powershell
npm uninstall @supabase/supabase-js react-router-dom next-themes
```

- [ ] **Step 3: Rewrite `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    tsConfigPaths(),
  ],
})
```

- [ ] **Step 4: Rewrite `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Delete `src/main.tsx`** (superseded by `src/entry-client.tsx` in Task 3):

```powershell
Remove-Item -LiteralPath "C:\Users\PC\Desktop\templateprv2\src\main.tsx" -Force
```

- [ ] **Step 6: Create `src/router.tsx`**

```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

- [ ] **Step 7: Verify dev server boots**

```powershell
npm run dev
```

Expected: dev server starts (routes not yet created → `routeTree.gen.ts` empty/placeholder). Stop it (`Ctrl+C`) after confirming it boots without config errors.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "chore: configure TanStack Start and dependencies"
```

---

### Task 3: Entry points and root route (providers)

**Files:**
- Create: `src/entry-client.tsx`
- Create: `src/entry-server.tsx`
- Create: `src/routes/__root.tsx`
- Modify: `index.html`
- Delete: `src/App.tsx`

**Interfaces:**
- Produces: `src/routes/__root.tsx` exports `Route` (root route) wrapping the provider tree and rendering `<Outlet />`. `src/router.tsx` (Task 2) provides `getRouter()`.

- [ ] **Step 1: Create `src/entry-client.tsx`**

```tsx
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
```

- [ ] **Step 2: Create `src/entry-server.tsx`**

```tsx
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createRouter } from './router'

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
```

- [ ] **Step 3: Create `src/routes/__root.tsx`**

Move the provider tree from `App.tsx` here, replacing `<BrowserRouter>/<Routes>` with `<Outlet />`:

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import ScrollToTop from '@/components/ScrollToTop'
import CookieConsent from '@/components/CookieConsent'
import ChatBubble from '@/components/ChatBubble'

const queryClient = new QueryClient()

function RootComponent() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ScrollToTop />
                <CookieConsent />
                <ChatBubble />
                <Outlet />
              </TooltipProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  )
}

export const Route = createRootRoute({ component: RootComponent })
```

- [ ] **Step 4: Delete `src/App.tsx`**

```powershell
Remove-Item -LiteralPath "C:\Users\PC\Desktop\templateprv2\src\App.tsx" -Force
```

- [ ] **Step 5: Update `index.html`**

Point the script entry at `src/entry-client.tsx`:

```html
<script type="module" src="/src/entry-client.tsx"></script>
```

(Remove any reference to `/src/main.tsx`.)

- [ ] **Step 6: Verify dev server boots**

```powershell
npm run dev
```

Expected: root route renders (child routes 404 until Task 4). Stop after confirming.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: TanStack Start entry points and root route"
```

---

### Task 4: Convert pages to file routes

**Files:**
- Create: `src/routes/*.tsx` (one per page below)
- Modify: `src/components/ScrollToTopOnNavigate.tsx` (drop react-router) or delete
- Modify: `src/components/NavLink.tsx` (drop react-router)
- Delete: `src/pages/` after conversion

**Interfaces:**
- Consumes: `__root.tsx` (Task 3).
- Produces: file routes matching the spec's route map; `routeTree.gen.ts` regenerated by the router plugin.

Route map (`src/pages/X.tsx` → `src/routes/...`):

| page | route path | file |
|---|---|---|
| Index | `/` | `index.tsx` |
| Templates | `/templates` | `templates.tsx` |
| AboutUs | `/about` | `about.tsx` |
| FAQ | `/faq` | `faq.tsx` |
| Contact | `/contact` | `contact.tsx` |
| Cart | `/cart` | `cart.tsx` |
| Checkout | `/checkout` | `checkout.tsx` |
| Auth | `/auth` | `auth.tsx` |
| ResetPassword | `/reset-password` | `reset-password.tsx` |
| Favorites | `/favorites` | `favorites.tsx` |
| Profile | `/profile` | `profile.tsx` |
| Admin | `/admin` | `admin.tsx` |
| TemplatePreview | `/template/:id` | `template.$id.tsx` |
| Privacy | `/privacy` | `privacy.tsx` |
| Terms | `/terms` | `terms.tsx` |
| Cookies | `/cookies` | `cookies.tsx` |
| License | `/license` | `license.tsx` |
| Refunds | `/refunds` | `refunds.tsx` |
| Dashboard | `/dashboard` | `dashboard.tsx` |
| Downloads | `/downloads` | `downloads.tsx` |
| ProHostingCheckout | `/checkout/pro-hosting` | `checkout.pro-hosting.tsx` |
| NotFound | `*` | `$.tsx` |

- [ ] **Step 1: Find router imports to convert**

```powershell
rg -n "react-router-dom" src/pages src/components
```

Expected: `useParams` in TemplatePreview, `useNavigate`/`useLocation`/`Link` across pages/components.

- [ ] **Step 2: Convert a leaf page (template for the rest) — `src/routes/about.tsx`**

Copy `src/pages/AboutUs.tsx`, changing the export to a file route:

```tsx
import { createFileRoute } from '@tanstack/react-router'

function AboutUs() {
  // ... existing component body unchanged ...
}

export const Route = createFileRoute('/about')({ component: AboutUs })
```

The component body (JSX, hooks, imports) stays identical. Repeat for every page, mapping `default export Component` → `createFileRoute('<path>')({ component: Component })`.

- [ ] **Step 3: Handle router hook swaps**

Replace in converted files:

| react-router-dom | TanStack Router |
|---|---|
| `useParams()` | `Route.useParams()` (typed) |
| `useNavigate()` | `useNavigate()` from `@tanstack/react-router` |
| `useLocation()` | `useLocation()` from `@tanstack/react-router` |
| `<Link to>` | `<Link to>` from `@tanstack/react-router` |
| `<NavLink>` | TanStack Router `<Link>` with `activeProps` |

Update `src/components/NavLink.tsx`:

```tsx
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function NavLink(props: LinkProps & { children: ReactNode }) {
  return <Link {...props} activeProps={{ className: 'text-[#e85a2d]' }} />
}
```

`src/components/ScrollToTopOnNavigate.tsx`: `scrollRestoration: true` (set in `router.tsx`) replaces its pathname effect. If it has no other purpose, delete it and drop its import from `__root.tsx`.

- [ ] **Step 4: Convert remaining pages**

Repeat Steps 2-3 for all remaining pages. TemplatePreview (`template.$id.tsx`) reads `id` via `Route.useParams()`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

function TemplatePreview() {
  const { id } = Route.useParams()
  // ... existing body, using `id` where `useParams().id` was used ...
}

export const Route = createFileRoute('/template/$id')({ component: TemplatePreview })
```

NotFound becomes `src/routes/$.tsx` with `createFileRoute('/$')`.

- [ ] **Step 5: Delete `src/pages/`**

```powershell
Remove-Item -LiteralPath "C:\Users\PC\Desktop\templateprv2\src\pages" -Recurse -Force
```

- [ ] **Step 6: Verify build**

```powershell
npm run build
```

Expected: routing compiles. Type errors from remaining Supabase imports in hooks/contexts/components are expected (fixed in Tasks 6-10); fix router-only errors now.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: convert pages to TanStack file routes"
```

---

### Task 5: Turso + Drizzle schema, client, migrations, seed

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/server/db/schema.ts`
- Create: `src/server/db/client.ts`
- Create: `src/server/db/seed.ts`
- Create: `drizzle/0000_init.sql` (generated)

**Interfaces:**
- Produces: `db` (drizzle instance) from `client.ts`; `schema.ts` table definitions; `seed.ts` inserts sample templates + site_settings. Consumed by Tasks 6-10.

- [ ] **Step 1: Create `drizzle.config.ts`**

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})
```

- [ ] **Step 2: Create `src/server/db/client.ts`**

```ts
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN

export const client = createClient({ url: url!, authToken })
export const db = drizzle(client, { schema })
```

- [ ] **Step 3: Create `src/server/db/schema.ts`**

App tables use snake_case keys (identical to old Supabase rows). Better Auth tables keep camelCase (Better Auth's expected shape).

```ts
import { sqliteTable, text, integer, real, check, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const user_roles = sqliteTable('user_roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  role: text('role', { enum: ['admin', 'moderator', 'user'] }).notNull().default('user'),
}, (t) => [uniqueIndex('user_roles_user_role_idx').on(t.user_id, t.role)])

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('favorites_user_template_idx').on(t.user_id, t.template_id)])

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: real('price').notNull().default(0),
  extended_price: real('extended_price'),
  image_url: text('image_url').notNull(),
  gallery_images: text('gallery_images', { mode: 'json' }).$type<string[]>().notNull().default([]),
  rating: real('rating').default(0),
  sales: integer('sales').default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  tech_stack: text('tech_stack', { mode: 'json' }).$type<string[]>().notNull().default([]),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull().default([]),
  demo_url: text('demo_url'),
  youtube_id: text('youtube_id'),
  review_count: integer('review_count').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  user_email: text('user_email').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'] }).notNull().default('pending'),
  total_amount: real('total_amount').notNull().default(0),
  paypal_order_id: text('paypal_order_id').unique(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const order_items = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  template_id: text('template_id').notNull(),
  template_title: text('template_title').notNull(),
  license_type: text('license_type').notNull().default('regular'),
  price: real('price').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const all_access_passes = sqliteTable('all_access_passes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  order_id: text('order_id').references(() => orders.id),
  price: real('price').notNull().default(300),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  discount_type: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull().default('percentage'),
  discount_value: real('discount_value').notNull().default(0),
  min_order_amount: real('min_order_amount').default(0),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  template_id: text('template_id').references(() => templates.id, { onDelete: 'set null' }),
  template_title: text('template_title'),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: text('status', { enum: ['pending', 'approved'] }).notNull().default('pending'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex('reviews_user_template_idx').on(t.user_id, t.template_id),
  check('reviews_rating_check', t.rating >= 1 && t.rating <= 5),
])

export const template_downloads = sqliteTable('template_downloads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  template_id: text('template_id').notNull().unique().references(() => templates.id, { onDelete: 'cascade' }),
  source_file_url: text('source_file_url').notNull(),
})

export const refund_requests = sqliteTable('refund_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'),
  admin_notes: text('admin_notes'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const site_settings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Better Auth core tables (camelCase, as Better Auth expects)
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
```

- [ ] **Step 4: Generate the migration**

```powershell
npx drizzle-kit generate
```

Expected: `drizzle/0000_*.sql` is created containing `CREATE TABLE` statements for all tables above.

- [ ] **Step 5: Create `src/server/db/seed.ts`**

Insert the 6 sample templates (original `20260127230923` data) and the `hero_banner` site setting (original `20260308073916` data):

```ts
import { db } from './client'
import { templates, site_settings } from './schema'

export async function seed() {
  await db.insert(templates).values([
    { title: 'Starter - SaaS Dashboard Template', description: 'A complete SaaS dashboard solution with analytics, user management, and billing integration.', category: 'SaaS', price: 49, extended_price: 149, image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', rating: 4.9, sales: 2340, featured: true, tech_stack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'], features: ['Responsive Dashboard', 'User Analytics', 'Dark Mode Support', 'API Integration'] },
    { title: 'Storefront - E-Commerce Pro Kit', description: 'Professional e-commerce template with cart, checkout, and inventory management.', category: 'E-Commerce', price: 79, extended_price: 249, image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', rating: 4.8, sales: 1856, featured: true, tech_stack: ['React', 'TypeScript', 'Stripe', 'Tailwind CSS'], features: ['Shopping Cart', 'Payment Integration', 'Product Gallery', 'Inventory System'] },
    { title: 'Portfolio Pro - Creative Showcase', description: 'Stunning portfolio template for designers and creatives.', category: 'Portfolio', price: 39, extended_price: 119, image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', rating: 4.9, sales: 3210, featured: true, tech_stack: ['React', 'Framer Motion', 'Tailwind CSS'], features: ['Animated Sections', 'Project Gallery', 'Contact Form', 'Blog Integration'] },
    { title: 'Corporate - Business Landing Page', description: 'Professional business landing page with team and services sections.', category: 'Business', price: 59, extended_price: 179, image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80', rating: 4.7, sales: 1542, featured: false, tech_stack: ['React', 'TypeScript', 'Tailwind CSS'], features: ['Team Section', 'Services Grid', 'Testimonials', 'Newsletter Signup'] },
    { title: 'Minimal - Blog & Magazine Theme', description: 'Clean and minimal blog template with rich text support.', category: 'Blog', price: 45, extended_price: 139, image_url: 'https://images.unsplash.com/photo-1522542550221-31fd8575f4ca?w=800&q=80', rating: 4.8, sales: 2890, featured: false, tech_stack: ['React', 'MDX', 'Tailwind CSS'], features: ['Rich Text Editor', 'Categories', 'Search', 'RSS Feed'] },
    { title: 'Agency Plus - Creative Studio Kit', description: 'Complete agency website template with portfolio and case studies.', category: 'Agency', price: 69, extended_price: 219, image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', rating: 4.9, sales: 1987, featured: true, tech_stack: ['React', 'TypeScript', 'GSAP', 'Tailwind CSS'], features: ['Case Studies', 'Team Profiles', 'Service Pages', 'Client Portal'] },
  ])

  await db.insert(site_settings).values({
    key: 'hero_banner',
    value: {
      badge_text: '#1 Template Marketplace — 50K+ Creators',
      headline_line1_prefix: 'Build ',
      headline_line1_highlight: 'Stunning',
      headline_line2_prefix: 'Websites ',
      headline_line2_highlight: 'Instantly',
      subheadline: 'Premium, pixel-perfect templates that launch in minutes. Stop coding from scratch — start shipping faster.',
      cta_primary_text: 'Explore Templates',
      cta_primary_link: '/templates',
      cta_secondary_text: 'Watch Demo',
      cta_secondary_link: '/contact',
      stats: [
        { value: '12K+', label: 'Templates', icon: '' },
        { value: '50K+', label: 'Happy Creators', icon: '' },
        { value: '4.9★', label: 'Average Rating', icon: '' },
        { value: '24/7', label: 'Expert Support', icon: '' },
      ],
    },
  }).onConflictDoNothing()
}
```

- [ ] **Step 6: Apply migration + seed (requires TURSO_URL/TURSO_AUTH_TOKEN in .env)**

```powershell
npx drizzle-kit migrate
npx tsx src/server/db/seed.ts
```

(If Turso credentials aren't available yet, defer this step until setup; code paths must not fail at import time without a DB.)

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: Turso + Drizzle schema, client, migrations, seed"
```

---

### Task 6: Better Auth (instance, API route, client, AuthContext, admin helpers)

**Files:**
- Create: `src/server/auth.ts`
- Create: `src/server/admin.ts`
- Create: `src/routes/api/auth.$.ts`
- Create: `src/lib/auth-client.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/hooks/useAdminRole.ts`

**Interfaces:**
- Consumes: `db` + `schema` from Task 5.
- Produces: `auth` (better-auth instance), `getSession()`; `authClient` (client); `isAdmin(userId)`, `requireUser()`, `requireAdmin()` (in `admin.ts`); AuthContext exposing `{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword }` with `user.id`, `user.email`, `user.name`; `useAdminRole()` returning boolean.

- [ ] **Step 1: Create `src/server/auth.ts`**

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getWebRequest } from '@tanstack/react-start/server'
import { db } from './db/client'
import * as schema from './db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
})

export async function getSession() {
  const request = getWebRequest()
  if (!request) return null
  const { session } = await auth.api.getSession({ headers: request.headers })
  return session
}
```

- [ ] **Step 2: Create `src/server/admin.ts`**

```ts
import { db } from './db/client'
import { user_roles } from './db/schema'
import { eq, and } from 'drizzle-orm'

export async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db.select().from(user_roles)
    .where(and(eq(user_roles.user_id, userId), eq(user_roles.role, 'admin')))
    .limit(1)
  return rows.length > 0
}
```

- [ ] **Step 3: Create `src/routes/api/auth.$.ts`**

```ts
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '../../server/auth'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: ({ request }) => auth.handler(request),
  POST: ({ request }) => auth.handler(request),
})
```

- [ ] **Step 4: Create `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()
```

- [ ] **Step 5: Rewrite `src/contexts/AuthContext.tsx`**

Keep the same interface shape. `user` is Better Auth's user (`{ id, email, name, image, emailVerified, createdAt, updatedAt }`); `session` is Better Auth's session.

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import type { Session } from 'better-auth'

interface User {
  id: string
  email: string
  name: string
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data, error }) => {
      setSession(data?.session ?? null)
      setUser(data?.user ?? null)
      setLoading(false)
    })
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await authClient.signUp.email({ email, password, name: displayName ?? '' })
    return { error: error ? new Error(error.message ?? 'Sign up failed') : null }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (!error && data) {
      setSession(data.session)
      setUser(data.user)
    }
    return { error: error ? new Error(error.message ?? 'Sign in failed') : null }
  }

  const signOut = async () => {
    await authClient.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await authClient.forgetPassword({ email, redirectTo: `${window.location.origin}/reset-password` })
    return { error: error ? new Error(error.message ?? 'Reset failed') : null }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await authClient.changePassword({ newPassword })
    return { error: error ? new Error(error.message ?? 'Update failed') : null }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

- [ ] **Step 6: Rewrite `src/hooks/useAdminRole.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getIsAdmin } from '@/server/functions/admin'

export const useAdminRole = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => (user?.id ? getIsAdmin() : false),
    enabled: !!user?.id,
  })
}
```

(`getIsAdmin` is defined in Task 7.)

- [ ] **Step 7: Verify auth compiles and page loads**

```powershell
npm run dev
```

Expected: app boots; `/auth` sign-in form renders (sign-in itself needs DB creds). Stop after confirming.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: Better Auth integration and AuthContext rewrite"
```

---

### Task 7: Server functions — catalog, favorites, coupons, notifications, dashboard, admin data

**Files:**
- Create: `src/server/functions/templates.ts`
- Create: `src/server/functions/favorites.ts`
- Create: `src/server/functions/coupons.ts`
- Create: `src/server/functions/notifications.ts`
- Create: `src/server/functions/dashboard.ts`
- Create: `src/server/functions/admin.ts`
- Create: `src/server/functions/contact.ts`
- Create: `src/server/functions/reviews.ts`
- Create: `src/server/functions/refunds.ts`
- Modify: `src/server/admin.ts` (add `requireUser`/`requireAdmin`)

**Interfaces:**
- Consumes: `db`, `schema` (Task 5), `getSession`/`auth` (Task 6), `isAdmin` (Task 6).
- Produces: named exports used by Tasks 9-10. Signatures below are authoritative.

Every mutation uses `createServerFn({ method: 'POST' })`; reads use `{ method: 'GET' }`. Server functions read the session via `getSession()`/`requireUser()`; ownership checks compare `session.userId` to `user_id` columns.

- [ ] **Step 1: Extend `src/server/admin.ts`**

```ts
import { getSession } from './auth'

export async function requireUser(): Promise<{ id: string; email: string }> {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')
  return { id: session.userId, email: session.user.email }
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!(await isAdmin(user.id))) throw new Error('Not authorized')
  return user
}
```

- [ ] **Step 2: Create `src/server/functions/templates.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates } from '../db/schema'
import { eq, desc, count } from 'drizzle-orm'

type ListOptions = { featured?: boolean; category?: string; limit?: number }

export const listTemplates = createServerFn({ method: 'GET' })
  .validator((o: ListOptions) => o)
  .handler(async ({ data }) => {
    let q = db.select().from(templates)
    if (data.featured) q = q.where(eq(templates.featured, true))
    if (data.category) q = q.where(eq(templates.category, data.category))
    return q.orderBy(desc(templates.sales)).limit(data.limit ?? 100)
  })

export const listTemplatesPaginated = createServerFn({ method: 'GET' })
  .validator((o: ListOptions & { page: number; pageSize: number }) => o)
  .handler(async ({ data }) => {
    const page = data.page || 1
    const pageSize = data.pageSize || 9
    const where = data.featured
      ? eq(templates.featured, true)
      : data.category ? eq(templates.category, data.category) : undefined
    const [{ value: total }] = await db.select({ value: count() }).from(templates).where(where)
    const rows = await db.select().from(templates).where(where)
      .orderBy(desc(templates.sales))
      .limit(pageSize).offset((page - 1) * pageSize)
    return { data: rows, count: total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  })

export const getTemplate = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const rows = await db.select().from(templates).where(eq(templates.id, data)).limit(1)
    return rows[0] ?? null
  })

export const getCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select({ category: templates.category }).from(templates)
  return [...new Set(rows.map((r) => r.category))]
})
```

- [ ] **Step 3: Create `src/server/functions/favorites.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { favorites } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listFavorites = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select({ template_id: favorites.template_id }).from(favorites).where(eq(favorites.user_id, user.id))
  return rows.map((r) => r.template_id)
})

export const toggleFavorite = createServerFn({ method: 'POST' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    const existing = await db.select().from(favorites)
      .where(and(eq(favorites.user_id, user.id), eq(favorites.template_id, templateId))).limit(1)
    if (existing.length > 0) {
      await db.delete(favorites).where(and(eq(favorites.user_id, user.id), eq(favorites.template_id, templateId)))
      return { isFavorite: false }
    }
    await db.insert(favorites).values({ user_id: user.id, template_id: templateId })
    return { isFavorite: true }
  })
```

- [ ] **Step 4: Create `src/server/functions/coupons.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { coupons } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'

export const listCoupons = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(coupons).orderBy(desc(coupons.created_at))
})

export const createCoupon = createServerFn({ method: 'POST' })
  .validator((c: { code: string; discount_type?: string; discount_value?: number; min_order_amount?: number; max_uses?: number | null; is_active?: boolean; expires_at?: string | null }) => c)
  .handler(async ({ data }) => {
    await requireAdmin()
    const [row] = await db.insert(coupons).values({
      code: data.code.toUpperCase().trim(),
      discount_type: (data.discount_type as any) || 'percentage',
      discount_value: data.discount_value || 0,
      min_order_amount: data.min_order_amount || 0,
      max_uses: data.max_uses || null,
      is_active: data.is_active ?? true,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
    }).returning()
    return row
  })

export const deleteCoupon = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.delete(coupons).where(eq(coupons.id, id)); return { success: true } })

export const toggleCoupon = createServerFn({ method: 'POST' })
  .validator((v: { id: string; is_active: boolean }) => v)
  .handler(async ({ data }) => { await requireAdmin(); await db.update(coupons).set({ is_active: data.is_active }).where(eq(coupons.id, data.id)); return { success: true } })

export const validateCoupon = createServerFn({ method: 'POST' })
  .validator((v: { code: string; orderTotal: number }) => v)
  .handler(async ({ data }) => {
    const rows = await db.select().from(coupons).where(eq(coupons.code, data.code.toUpperCase().trim())).limit(1)
    const coupon = rows[0]
    if (!coupon || !coupon.is_active) throw new Error('Coupon not found or inactive')
    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) throw new Error('Coupon has expired')
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) throw new Error('Coupon usage limit reached')
    if (coupon.min_order_amount != null && data.orderTotal < coupon.min_order_amount) throw new Error('Order does not meet minimum amount')
    const discount = coupon.discount_type === 'percentage'
      ? (data.orderTotal * coupon.discount_value) / 100
      : coupon.discount_value
    return {
      coupon: { code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value },
      discount: Math.round(discount * 100) / 100,
    }
  })
```

- [ ] **Step 5: Create `src/server/functions/notifications.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { notifications } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return db.select().from(notifications).where(eq(notifications.user_id, user.id)).orderBy(desc(notifications.created_at)).limit(20)
})

export const markAsRead = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireUser(); await db.update(notifications).set({ is_read: true }).where(eq(notifications.id, id)); return { success: true } })

export const markAllAsRead = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  await db.update(notifications).set({ is_read: true }).where(eq(notifications.user_id, user.id))
  return { success: true }
})
```

- [ ] **Step 6: Create `src/server/functions/reviews.ts`** (with review-count recalc and buyer gate)

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { reviews, profiles, order_items, orders, all_access_passes, templates } from '../db/schema'
import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listReviews = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const rows = await db.select().from(reviews)
      .where(and(eq(reviews.template_id, templateId), eq(reviews.status, 'approved')))
      .orderBy(desc(reviews.created_at))
    const userIds = [...new Set(rows.map((r) => r.user_id))]
    const profileRows = userIds.length ? await db.select().from(profiles).where(inArray(profiles.user_id, userIds)) : []
    const profileMap = new Map(profileRows.map((p) => [p.user_id, p]))
    return rows.map((r) => ({
      ...r,
      display_name: profileMap.get(r.user_id)?.display_name || 'Anonymous',
      avatar_url: profileMap.get(r.user_id)?.avatar_url || null,
    }))
  })

async function recalcReviewCount(templateId: string) {
  const [{ value: c }] = await db.select({ value: count() }).from(reviews).where(and(eq(reviews.template_id, templateId), eq(reviews.status, 'approved')))
  await db.update(templates).set({ review_count: c }).where(eq(templates.id, templateId))
}

async function hasPurchasedInternal(userId: string, templateId: string) {
  const pass = await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, userId)).limit(1)
  if (pass.length > 0) return true
  const items = await db.select({ order_id: order_items.order_id }).from(order_items).where(eq(order_items.template_id, templateId))
  if (items.length === 0) return false
  const orderIds = items.map((i) => i.order_id)
  const completed = await db.select().from(orders).where(and(inArray(orders.id, orderIds), eq(orders.user_id, userId), eq(orders.status, 'completed'))).limit(1)
  return completed.length > 0
}

export const getUserReview = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    const rows = await db.select().from(reviews).where(and(eq(reviews.template_id, templateId), eq(reviews.user_id, user.id))).limit(1)
    return rows[0] ?? null
  })

export const hasPurchased = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    return hasPurchasedInternal(user.id, templateId)
  })

export const submitReview = createServerFn({ method: 'POST' })
  .validator((v: { templateId: string; rating: number; comment: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!(await hasPurchasedInternal(user.id, data.templateId))) throw new Error('You must purchase this template before reviewing')
    const existing = await db.select().from(reviews).where(and(eq(reviews.template_id, data.templateId), eq(reviews.user_id, user.id))).limit(1)
    if (existing.length > 0) {
      await db.update(reviews).set({ rating: data.rating, comment: data.comment.trim() || null, status: 'pending', updated_at: new Date() }).where(eq(reviews.id, existing[0].id))
    } else {
      await db.insert(reviews).values({ user_id: user.id, template_id: data.templateId, rating: data.rating, comment: data.comment.trim() || null, status: 'pending' })
    }
    await recalcReviewCount(data.templateId)
    return { success: true }
  })

export const deleteReview = createServerFn({ method: 'POST' })
  .validator((v: { reviewId: string; templateId: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db.delete(reviews).where(and(eq(reviews.id, data.reviewId), eq(reviews.user_id, user.id)))
    await recalcReviewCount(data.templateId)
    return { success: true }
  })
```

- [ ] **Step 7: Create `src/server/functions/dashboard.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { orders, order_items, reviews, templates, template_downloads, all_access_passes } from '../db/schema'
import { eq, and, desc, inArray, count } from 'drizzle-orm'
import { requireUser } from '../admin'

export const getPurchasedTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const reviewRows = await db.select({ template_id: reviews.template_id }).from(reviews).where(eq(reviews.user_id, user.id))
  const reviewedSet = new Set(reviewRows.map((r) => r.template_id))
  const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1))[0]

  if (pass) {
    const all = await db.select().from(templates)
    const downloads = await db.select().from(template_downloads)
    const fileMap = new Map(downloads.map((d) => [d.template_id, d.source_file_url]))
    return all.map((t) => ({
      id: `pass-${t.id}`, template_id: t.id, template_title: t.title, license_type: 'pass', price: 0,
      purchased_at: pass.created_at.toISOString(), order_id: `pass-${pass.id}`, order_status: 'completed',
      source_file_url: fileMap.get(t.id) ?? null, has_review: reviewedSet.has(t.id),
    }))
  }

  const completedOrders = await db.select().from(orders).where(and(eq(orders.user_id, user.id), eq(orders.status, 'completed'))).orderBy(desc(orders.created_at))
  if (completedOrders.length === 0) return []
  const orderIds = completedOrders.map((o) => o.id)
  const items = await db.select().from(order_items).where(inArray(order_items.order_id, orderIds))
  const templateIds = [...new Set(items.map((i) => i.template_id))]
  const downloads = templateIds.length ? await db.select().from(template_downloads).where(inArray(template_downloads.template_id, templateIds)) : []
  const fileMap = new Map(downloads.map((d) => [d.template_id, d.source_file_url]))
  const orderMap = new Map(completedOrders.map((o) => [o.id, o]))
  return items.map((item) => ({
    id: item.id, template_id: item.template_id, template_title: item.template_title, license_type: item.license_type, price: item.price,
    purchased_at: orderMap.get(item.order_id)?.created_at.toISOString() ?? item.created_at.toISOString(),
    order_id: item.order_id, order_status: orderMap.get(item.order_id)?.status ?? 'completed',
    source_file_url: fileMap.get(item.template_id) ?? null, has_review: reviewedSet.has(item.template_id),
  }))
})

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const orderRows = await db.select().from(orders).where(eq(orders.user_id, user.id))
  const completed = orderRows.filter((o) => o.status === 'completed')
  const totalSpent = completed.reduce((s, o) => s + Number(o.total_amount), 0)
  const completedIds = completed.map((o) => o.id)
  const itemRows = completedIds.length ? await db.select().from(order_items).where(inArray(order_items.order_id, completedIds)) : []
  const purchasedIds = new Set(itemRows.map((i) => i.template_id))
  const reviewRows = await db.select({ template_id: reviews.template_id }).from(reviews).where(eq(reviews.user_id, user.id))
  const reviewedIds = new Set(reviewRows.map((r) => r.template_id))
  const pendingReviews = [...purchasedIds].filter((id) => !reviewedIds.has(id)).length
  const [{ value: catalogCount }] = await db.select({ value: count() }).from(templates)
  const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1))[0]
  return {
    totalOrders: orderRows.length,
    totalSpent,
    totalDownloads: pass ? (catalogCount ?? 0) : purchasedIds.size,
    pendingReviews: pass ? 0 : pendingReviews,
  }
})
```

- [ ] **Step 8: Create `src/server/functions/contact.ts` and `src/server/functions/refunds.ts`**

`contact.ts`:

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { contacts } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'

export const submitContact = createServerFn({ method: 'POST' })
  .validator((v: { name: string; email: string; subject: string; message: string; templateId?: string; templateTitle?: string }) => v)
  .handler(async ({ data }) => {
    if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.message.trim()) throw new Error('All fields are required')
    await db.insert(contacts).values({ name: data.name, email: data.email, subject: data.subject, message: data.message, template_id: data.templateId ?? null, template_title: data.templateTitle ?? null })
    return { success: true }
  })

export const listContacts = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(contacts).orderBy(desc(contacts.created_at))
})

export const markContactRead = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.update(contacts).set({ is_read: true }).where(eq(contacts.id, id)); return { success: true } })

export const deleteContact = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.delete(contacts).where(eq(contacts.id, id)); return { success: true } })
```

`refunds.ts`:

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { refund_requests, orders } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAdmin, requireUser, isAdmin } from '../admin'

export const createRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: { orderId: string; reason: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const order = (await db.select().from(orders).where(and(eq(orders.id, data.orderId), eq(orders.user_id, user.id))).limit(1))[0]
    if (!order || order.status !== 'completed') throw new Error('Order not found or not completed')
    await db.insert(refund_requests).values({ order_id: data.orderId, user_id: user.id, reason: data.reason })
    return { success: true }
  })

export const listRefundRequests = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  if (await isAdmin(user.id)) return db.select().from(refund_requests).orderBy(desc(refund_requests.created_at))
  return db.select().from(refund_requests).where(eq(refund_requests.user_id, user.id)).orderBy(desc(refund_requests.created_at))
})

export const updateRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: { id: string; status: string; adminNotes?: string }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(refund_requests).set({ status: data.status, admin_notes: data.adminNotes ?? null, updated_at: new Date() }).where(eq(refund_requests.id, data.id))
    return { success: true }
  })
```

- [ ] **Step 9: Create `src/server/functions/admin.ts`** (catalog/admin CRUD + `getIsAdmin` + `updateProfile`)

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates, template_downloads, site_settings, orders, order_items, reviews, profiles } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin, isAdmin, requireUser } from '../admin'

export const getIsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return isAdmin(user.id)
})

export const adminListTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(templates).orderBy(desc(templates.created_at))
})

export const adminSaveTemplate = createServerFn({ method: 'POST' })
  .validator((t: any) => t)
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.id) {
      await db.update(templates).set({
        title: data.title, description: data.description, category: data.category,
        price: data.price, extended_price: data.extended_price ?? null, image_url: data.image_url,
        gallery_images: data.gallery_images ?? [], tech_stack: data.tech_stack ?? [], features: data.features ?? [],
        demo_url: data.demo_url ?? null, youtube_id: data.youtube_id ?? null, updated_at: new Date(),
      }).where(eq(templates.id, data.id))
      if (data.source_file_url) {
        await db.insert(template_downloads).values({ template_id: data.id, source_file_url: data.source_file_url })
          .onConflictDoUpdate({ target: template_downloads.template_id, set: { source_file_url: data.source_file_url } })
      }
      return { success: true }
    }
    const [row] = await db.insert(templates).values({
      title: data.title, description: data.description, category: data.category,
      price: data.price, extended_price: data.extended_price ?? null, image_url: data.image_url,
      gallery_images: data.gallery_images ?? [], tech_stack: data.tech_stack ?? [], features: data.features ?? [],
      demo_url: data.demo_url ?? null, youtube_id: data.youtube_id ?? null,
    }).returning()
    if (data.source_file_url) await db.insert(template_downloads).values({ template_id: row.id, source_file_url: data.source_file_url })
    return { success: true }
  })

export const adminDeleteTemplate = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.delete(templates).where(eq(templates.id, id)); return { success: true } })

export const adminListOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(orders).orderBy(desc(orders.created_at))
})

export const adminUpdateOrderStatus = createServerFn({ method: 'POST' })
  .validator((v: { orderId: string; status: string }) => v)
  .handler(async ({ data }) => { await requireAdmin(); await db.update(orders).set({ status: data.status as any, updated_at: new Date() }).where(eq(orders.id, data.orderId)); return { success: true } })

export const adminDeleteOrder = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.delete(orders).where(eq(orders.id, id)); return { success: true } })

export const adminListReviews = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(reviews).orderBy(desc(reviews.created_at))
})

export const adminUpdateReviewStatus = createServerFn({ method: 'POST' })
  .validator((v: { id: string; status: string }) => v)
  .handler(async ({ data }) => { await requireAdmin(); await db.update(reviews).set({ status: data.status as any, updated_at: new Date() }).where(eq(reviews.id, data.id)); return { success: true } })

export const adminDeleteReview = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => { await requireAdmin(); await db.delete(reviews).where(eq(reviews.id, id)); return { success: true } })

export const getSiteSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select().from(site_settings)
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
})

export const saveSiteSetting = createServerFn({ method: 'POST' })
  .validator((v: { key: string; value: Record<string, unknown> }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.insert(site_settings).values({ key: data.key, value: data.value, updated_at: new Date() })
      .onConflictDoUpdate({ target: site_settings.key, set: { value: data.value, updated_at: new Date() } })
    return { success: true }
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((v: { displayName?: string; avatarUrl?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db.update(profiles).set({ display_name: data.displayName ?? null, avatar_url: data.avatarUrl ?? null, updated_at: new Date() }).where(eq(profiles.user_id, user.id))
    return { success: true }
  })
```

- [ ] **Step 10: Verify typecheck**

```powershell
npm run build
```

Expected: server functions typecheck (consumer hooks in Tasks 9-10 will resolve remaining errors).

- [ ] **Step 11: Commit**

```powershell
git add -A
git commit -m "feat: server functions for catalog, favorites, coupons, notifications, dashboard, admin, contact, reviews, refunds"
```

---

### Task 8: Server functions — orders, PayPal, R2, claim-free, remove-purchased

**Files:**
- Create: `src/server/functions/paypal.ts`
- Create: `src/server/functions/r2.ts`
- Create: `src/server/functions/orders.ts`

**Interfaces:**
- Consumes: `db`, `schema` (Task 5), `requireUser`/`requireAdmin` (Task 7).
- Produces: `createPayPalOrder`, `capturePayPalOrder`, `claimFreeOrder`, `removePurchasedTemplate`, `getMyOrders`, `getOrderWithItems`, `hasAllAccessPass`, `getR2UploadUrl`.

- [ ] **Step 1: Create `src/server/functions/paypal.ts`**

```ts
const PAYPAL_API = process.env.PAYPAL_ENVIRONMENT === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export async function paypalAccessToken(): Promise<string> {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) throw new Error('PayPal credentials not configured')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal Auth Error: ${data.error_description || data.error}`)
  return data.access_token
}
```

- [ ] **Step 2: Create `src/server/functions/r2.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireUser } from '../admin'

export const getR2UploadUrl = createServerFn({ method: 'POST' })
  .validator((v: { fileName: string; contentType: string; folder?: string }) => v)
  .handler(async ({ data }) => {
    await requireUser()
    const sanitizedFolder = data.folder ? data.folder.replace(/^\/+|\/+$/g, '') : ''
    const objectKey = sanitizedFolder ? `${sanitizedFolder}/${data.fileName}` : data.fileName
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
    const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: objectKey, ContentType: data.contentType })
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${data.fileName}`
    return { uploadUrl, publicUrl }
  })
```

- [ ] **Step 3: Create `src/server/functions/orders.ts`**

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates, orders, order_items, all_access_passes, coupons, contacts, notifications, site_settings } from '../db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { requireUser } from '../admin'
import { paypalAccessToken } from './paypal'

const ALL_ACCESS_PRICE = 300
const PAYPAL_API = process.env.PAYPAL_ENVIRONMENT === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

interface CartItem { id: string; license: string }

async function computeTotal(items: CartItem[]) {
  const ids = items.map((i) => i.id)
  const rows = await db.select().from(templates).where(inArray(templates.id, ids))
  const map = new Map(rows.map((t) => [t.id, t]))
  let total = 0
  const verified: { id: string; title: string; license: string; price: number }[] = []
  for (const item of items) {
    const t = map.get(item.id)
    if (!t) throw new Error(`Template not found: ${item.id}`)
    const price = item.license === 'extended' && t.extended_price ? t.extended_price : t.price
    total += price
    verified.push({ id: t.id, title: t.title, license: item.license || 'regular', price })
  }
  return { total, verified }
}

async function applyCoupon(code: string | undefined, total: number) {
  if (!code) return { discount: 0, coupon: null as any }
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase().trim())).limit(1)
  const coupon = rows[0]
  if (!coupon || !coupon.is_active) return { discount: 0, coupon: null }
  if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) return { discount: 0, coupon: null }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return { discount: 0, coupon: null }
  if (coupon.min_order_amount != null && total < coupon.min_order_amount) return { discount: 0, coupon: null }
  const discount = coupon.discount_type === 'percentage' ? (total * coupon.discount_value) / 100 : coupon.discount_value
  return { discount, coupon }
}

export const createPayPalOrder = createServerFn({ method: 'POST' })
  .validator((v: { items: CartItem[]; isAllAccess?: boolean; couponCode?: string; isProHosting?: boolean; templateTitle?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    let serverTotal = 0
    let paypalItems: any[] = []
    if (data.isProHosting) {
      const setting = (await db.select().from(site_settings).where(eq(site_settings.key, 'hosting_platforms')).limit(1))[0]
      const proPrice = (setting?.value as any)?.pro_service?.price ?? 0
      serverTotal = proPrice
      paypalItems = [{ name: ('Pro Hosting Service' + (data.templateTitle ? ` - ${data.templateTitle}` : '')).substring(0, 120), quantity: '1', unit_amount: { currency_code: 'USD', value: proPrice.toFixed(2) }, category: 'DIGITAL_GOODS' }]
    } else if (data.isAllAccess) {
      serverTotal = ALL_ACCESS_PRICE
      paypalItems = [{ name: 'All Access Pass', quantity: '1', unit_amount: { currency_code: 'USD', value: ALL_ACCESS_PRICE.toFixed(2) }, category: 'DIGITAL_GOODS' }]
    } else {
      if (!data.items?.length) throw new Error('Cart is empty')
      const { total, verified } = await computeTotal(data.items)
      serverTotal = total
      paypalItems = verified.map((v) => ({ name: v.title.substring(0, 120), quantity: '1', unit_amount: { currency_code: 'USD', value: '' }, category: 'DIGITAL_GOODS' }))
    }
    if (data.couponCode && !data.isProHosting) {
      const { discount } = await applyCoupon(data.couponCode, serverTotal)
      serverTotal = Math.max(0, serverTotal - discount)
    }
    if (serverTotal <= 0) throw new Error('Order total is $0.00. No payment required.')
    const perItemValue = (serverTotal / paypalItems.length).toFixed(2)
    let runningTotal = 0
    for (let i = 0; i < paypalItems.length; i++) {
      if (i === paypalItems.length - 1) paypalItems[i].unit_amount.value = (serverTotal - runningTotal).toFixed(2)
      else { paypalItems[i].unit_amount.value = perItemValue; runningTotal += parseFloat(perItemValue) }
    }
    const token = await paypalAccessToken()
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: serverTotal.toFixed(2), breakdown: { item_total: { currency_code: 'USD', value: serverTotal.toFixed(2) } } }, items: paypalItems }],
        application_context: { brand_name: 'Template Marketplace', shipping_preference: 'NO_SHIPPING' },
      }),
    })
    const orderData = await res.json()
    if (!res.ok) throw new Error(`PayPal Order Rejected: ${orderData.details?.[0]?.issue || orderData.message}`)
    return { orderId: orderData.id, userId: user.id, userEmail: user.email }
  })

export const capturePayPalOrder = createServerFn({ method: 'POST' })
  .validator((v: { paypalOrderId: string; items: CartItem[]; isAllAccess?: boolean; couponCode?: string; isProHosting?: boolean; templateTitle?: string; proHostingNotes?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const existing = (await db.select().from(orders).where(eq(orders.paypal_order_id, data.paypalOrderId)).limit(1))[0]
    if (existing) return { success: true, orderId: existing.id, paypalOrderId: data.paypalOrderId, alreadyProcessed: true }

    let serverTotal = 0
    let verified: { id: string; title: string; license: string; price: number }[] = []
    if (data.isProHosting) {
      const setting = (await db.select().from(site_settings).where(eq(site_settings.key, 'hosting_platforms')).limit(1))[0]
      serverTotal = (setting?.value as any)?.pro_service?.price ?? 0
    } else if (data.isAllAccess) {
      serverTotal = ALL_ACCESS_PRICE
    } else {
      if (!data.items?.length) throw new Error('Cart is empty')
      const r = await computeTotal(data.items)
      serverTotal = r.total
      verified = r.verified
    }
    let discount = 0, couponData: any = null
    if (data.couponCode && !data.isProHosting) {
      const r = await applyCoupon(data.couponCode, serverTotal)
      discount = r.discount
      couponData = r.coupon
    }
    const totalAfterDiscount = Math.max(0, serverTotal - discount)

    const token = await paypalAccessToken()
    const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${data.paypalOrderId}`, { headers: { Authorization: `Bearer ${token}` } })
    const verifyData = await verifyRes.json()
    if (!verifyRes.ok) throw new Error(`PayPal Verify Error: ${verifyData.message}`)
    const paypalAmount = parseFloat(verifyData.purchase_units?.[0]?.amount?.value || '0')
    if (Math.abs(paypalAmount - parseFloat(totalAfterDiscount.toFixed(2))) > 0.01) throw new Error(`Amount mismatch. PayPal: ${paypalAmount}, Server: ${totalAfterDiscount.toFixed(2)}`)

    const [order] = await db.insert(orders).values({ user_id: user.id, user_email: user.email, total_amount: totalAfterDiscount, status: 'pending', paypal_order_id: data.paypalOrderId }).returning()

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${data.paypalOrderId}/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
    const captureData = await captureRes.json()
    if (!captureRes.ok) {
      await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, order.id))
      throw new Error(`PayPal Capture Rejected: ${captureData.details?.[0]?.issue || captureData.message}`)
    }

    if (couponData && discount > 0) await db.update(coupons).set({ used_count: couponData.used_count + 1 }).where(eq(coupons.id, couponData.id))
    await db.update(orders).set({ status: 'completed' }).where(eq(orders.id, order.id))

    if (data.isProHosting) {
      const contactMessage = `Pro Hosting Service purchased.\n\nTemplate: ${data.templateTitle || 'Not specified'}\nUser Notes: ${data.proHostingNotes || 'None'}\nOrder ID: ${order.id}\nAmount Paid: $${totalAfterDiscount}`
      await db.insert(contacts).values({ name: user.email, email: user.email, subject: `Pro Hosting Request${data.templateTitle ? ` - ${data.templateTitle}` : ''}`, message: contactMessage })
      await db.insert(notifications).values({ user_id: user.id, type: 'pro_hosting', title: 'Pro Hosting Request Received', message: "We've received your pro hosting request and will contact you within 24 hours.", metadata: { order_id: order.id, template_title: data.templateTitle } })
    } else if (data.isAllAccess) {
      await db.insert(all_access_passes).values({ user_id: user.id, order_id: order.id, price: totalAfterDiscount })
    } else {
      await db.insert(order_items).values(verified.map((item) => ({ order_id: order.id, template_id: item.id, template_title: item.title, license_type: item.license, price: item.price })))
      for (const v of verified) {
        const [t] = await db.select().from(templates).where(eq(templates.id, v.id)).limit(1)
        await db.update(templates).set({ sales: (t?.sales ?? 0) + 1 }).where(eq(templates.id, v.id))
      }
    }
    return { success: true, orderId: order.id, paypalOrderId: captureData.id }
  })

export const claimFreeOrder = createServerFn({ method: 'POST' })
  .validator((v: { items: CartItem[]; couponCode?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!data.items?.length) throw new Error('Cart is empty')
    const { total, verified } = await computeTotal(data.items)
    let discount = 0, couponData: any = null
    if (data.couponCode) { const r = await applyCoupon(data.couponCode, total); discount = r.discount; couponData = r.coupon }
    const totalAfterDiscount = Math.max(0, total - discount)
    if (totalAfterDiscount > 0) throw new Error('This endpoint only accepts free ($0.00) orders. Paid orders must go through PayPal.')
    const [order] = await db.insert(orders).values({ user_id: user.id, user_email: user.email, total_amount: totalAfterDiscount, status: 'completed', paypal_order_id: null }).returning()
    if (couponData && discount > 0) await db.update(coupons).set({ used_count: couponData.used_count + 1 }).where(eq(coupons.id, couponData.id))
    await db.insert(order_items).values(verified.map((item) => ({ order_id: order.id, template_id: item.id, template_title: item.title, license_type: item.license, price: item.price })))
    for (const v of verified) {
      const [t] = await db.select().from(templates).where(eq(templates.id, v.id)).limit(1)
      await db.update(templates).set({ sales: (t?.sales ?? 0) + 1 }).where(eq(templates.id, v.id))
    }
    return { success: true, orderId: order.id, free: true }
  })

export const removePurchasedTemplate = createServerFn({ method: 'POST' })
  .validator((itemId: string) => itemId)
  .handler(async ({ data: itemId }) => {
    const user = await requireUser()
    const item = (await db.select().from(order_items).where(eq(order_items.id, itemId)).limit(1))[0]
    if (!item) throw new Error('Order item not found')
    const order = (await db.select().from(orders).where(eq(orders.id, item.order_id)).limit(1))[0]
    if (!order || order.user_id !== user.id) throw new Error('You do not own this order item')
    await db.delete(order_items).where(eq(order_items.id, itemId))
    return { success: true }
  })

export const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return db.select().from(orders).where(eq(orders.user_id, user.id)).orderBy(desc(orders.created_at))
})

export const getOrderWithItems = createServerFn({ method: 'GET' })
  .validator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    await requireUser()
    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0]
    if (!order) throw new Error('Order not found')
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))
    return { ...order, items }
  })

export const hasAllAccessPass = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1)
  return rows[0] ?? null
})
```

- [ ] **Step 4: Verify typecheck**

```powershell
npm run build
```

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: order, PayPal, and R2 server functions"
```

---

### Task 9: Rewrite the 10 data hooks

**Files:**
- Modify: `src/hooks/useTemplates.ts`
- Modify: `src/hooks/useOrders.ts`
- Modify: `src/hooks/useReviews.ts`
- Modify: `src/hooks/useCoupons.ts`
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `src/hooks/useAllAccessPass.ts`
- Modify: `src/contexts/FavoritesContext.tsx`
- Verify: `src/hooks/useAdminRole.ts` (Task 6)

**Interfaces:**
- Consumes: server functions from Tasks 7-8.
- Produces: unchanged hook return shapes (same names + return types), so components stay untouched.

- [ ] **Step 1: Rewrite `src/hooks/useTemplates.ts`**

```ts
import { useQuery } from "@tanstack/react-query"
import { listTemplates, listTemplatesPaginated, getTemplate, getCategories } from "@/server/functions/templates"

export interface Template {
  id: string; title: string; description: string | null; category: string
  price: number; extended_price: number | null; image_url: string
  gallery_images: string[]; rating: number; sales: number; review_count?: number
  featured: boolean; tech_stack: string[]; features: string[]; demo_url: string | null
  source_file_url?: string | null; youtube_id: string | null; created_at: string; updated_at: string
}

interface UseTemplatesOptions { featured?: boolean; category?: string; limit?: number; page?: number; pageSize?: number }

export const useTemplates = (options?: UseTemplatesOptions) => {
  return useQuery({
    queryKey: ["templates", options],
    queryFn: async () => listTemplates({ data: { featured: options?.featured, category: options?.category, limit: options?.limit } }),
  })
}

export const useTemplatesPaginated = (options?: UseTemplatesOptions) => {
  return useQuery({
    queryKey: ["templates-paginated", options],
    queryFn: async () => listTemplatesPaginated({ data: { featured: options?.featured, category: options?.category, page: options?.page || 1, pageSize: options?.pageSize || 9 } }),
  })
}

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => getTemplate({ data: id }),
    enabled: !!id,
  })
}

export const useCategories = () => {
  return useQuery({ queryKey: ["template-categories"], queryFn: async () => getCategories() })
}
```

- [ ] **Step 2: Rewrite `src/hooks/useOrders.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMyOrders, getOrderWithItems } from "@/server/functions/orders"
import { adminUpdateOrderStatus, adminDeleteOrder } from "@/server/functions/admin"

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"
export interface OrderItem { id: string; order_id: string; template_id: string; template_title: string; license_type: string; price: number; created_at: string }
export interface Order { id: string; user_id: string; user_email: string; status: OrderStatus; total_amount: number; paypal_order_id: string | null; created_at: string; updated_at: string; items?: OrderItem[] }

export const useOrders = () => {
  return useQuery({ queryKey: ["orders"], queryFn: async () => getMyOrders() as unknown as Order[] })
}

export const useMyOrders = useOrders

export const useOrderWithItems = (orderId: string) => {
  return useQuery({ queryKey: ["order", orderId], queryFn: async () => getOrderWithItems({ data: orderId }) as unknown as Order, enabled: !!orderId })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => { await adminUpdateOrderStatus({ data: { orderId, status } }) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: string) => { await adminDeleteOrder({ data: orderId }) },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  })
}
```

- [ ] **Step 3: Rewrite `src/hooks/useReviews.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { listReviews, getUserReview, hasPurchased, submitReview, deleteReview } from "@/server/functions/reviews"

export interface Review { id: string; user_id: string; template_id: string; rating: number; comment: string | null; created_at: string; updated_at: string; display_name?: string; avatar_url?: string | null }

export const useReviews = (templateId: string) => {
  return useQuery({ queryKey: ["reviews", templateId], queryFn: async () => listReviews({ data: templateId }), enabled: !!templateId })
}

export const useUserReview = (templateId: string) => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["user-review", templateId, user?.id], queryFn: async () => (user ? getUserReview({ data: templateId }) : null), enabled: !!templateId && !!user })
}

export const useHasPurchased = (templateId: string) => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["has-purchased", templateId, user?.id], queryFn: async () => (user ? hasPurchased({ data: templateId }) : false), enabled: !!templateId && !!user })
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ templateId, rating, comment }: { templateId: string; rating: number; comment: string }) => { await submitReview({ data: { templateId, rating, comment } }) },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reviewId, templateId }: { reviewId: string; templateId: string }) => { await deleteReview({ data: { reviewId, templateId } }) },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] })
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
  })
}
```

- [ ] **Step 4: Rewrite `src/hooks/useCoupons.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listCoupons, createCoupon, deleteCoupon, toggleCoupon, validateCoupon } from "@/server/functions/coupons"

export interface Coupon { id: string; code: string; discount_type: "percentage" | "fixed"; discount_value: number; min_order_amount: number; max_uses: number | null; used_count: number; is_active: boolean; expires_at: string | null; created_at: string }

export const useCoupons = () => useQuery({ queryKey: ["coupons"], queryFn: async () => listCoupons() })

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async (coupon: Partial<Coupon>) => { await createCoupon({ data: coupon }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async (id: string) => { await deleteCoupon({ data: id }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useToggleCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { await toggleCoupon({ data: { id, is_active } }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useValidateCoupon = () => {
  return useMutation({ mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => validateCoupon({ data: { code, orderTotal } }) })
}
```

- [ ] **Step 5: Rewrite `src/hooks/useNotifications.ts`**

Remove the realtime subscription (no Supabase). Keep polling via React Query:

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { listNotifications, markAsRead, markAllAsRead } from "@/server/functions/notifications"

export interface Notification { id: string; user_id: string; type: string; title: string; message: string; is_read: boolean; metadata: Record<string, any>; created_at: string }

export const useNotifications = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["notifications", user?.id], queryFn: async () => listNotifications(), enabled: !!user, refetchInterval: 30000 })
}

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications()
  return notifications?.filter((n) => !n.is_read).length ?? 0
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({ mutationFn: async (id: string) => { await markAsRead({ data: id }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({ mutationFn: async () => { await markAllAsRead() }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) })
}
```

- [ ] **Step 6: Rewrite `src/hooks/useDashboard.ts`**

```ts
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getPurchasedTemplates, getDashboardStats } from "@/server/functions/dashboard"

export interface PurchasedTemplate { id: string; template_id: string; template_title: string; license_type: string; price: number; purchased_at: string; order_id: string; order_status: string; source_file_url: string | null; has_review: boolean }

export const usePurchasedTemplates = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["purchased-templates", user?.id], queryFn: async () => (user ? getPurchasedTemplates() : []), enabled: !!user })
}

export const useDashboardStats = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["dashboard-stats", user?.id], queryFn: async () => (user ? getDashboardStats() : { totalOrders: 0, totalSpent: 0, totalDownloads: 0, pendingReviews: 0 }), enabled: !!user })
}
```

- [ ] **Step 7: Rewrite `src/hooks/useAllAccessPass.ts`**

```ts
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { hasAllAccessPass } from "@/server/functions/orders"

export const ALL_ACCESS_PRICE = 300

export const useAllAccessPass = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["all-access-pass", user?.id], queryFn: async () => hasAllAccessPass(), enabled: !!user })
}
```

- [ ] **Step 8: Rewrite `src/contexts/FavoritesContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { listFavorites, toggleFavorite as toggleFavoriteFn } from "@/server/functions/favorites"

interface FavoritesContextType {
  favorites: string[]
  loading: boolean
  toggleFavorite: (templateId: string) => Promise<void>
  isFavorite: (templateId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setLoading(true)
      listFavorites().then((ids) => { setFavorites(ids); setLoading(false) }).catch(() => setLoading(false))
    } else {
      setFavorites([])
    }
  }, [user])

  const toggleFavorite = async (templateId: string) => {
    if (!user) return
    const res = await toggleFavoriteFn({ data: templateId })
    if (res.isFavorite) setFavorites((prev) => [...prev, templateId])
    else setFavorites((prev) => prev.filter((id) => id !== templateId))
  }

  const isFavorite = (templateId: string) => favorites.includes(templateId)

  return <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) throw new Error("useFavorites must be used within a FavoritesProvider")
  return context
}
```

- [ ] **Step 9: Verify typecheck**

```powershell
npm run build
```

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m "feat: rewrite data hooks against server functions"
```

---

### Task 10: Rewrite direct Supabase call sites (pages + components + admin)

**Files:** (grep-verified; these still import `@/integrations/supabase/client` after Tasks 6 & 9)

- `src/routes/checkout.tsx`
- `src/routes/checkout.pro-hosting.tsx`
- `src/routes/downloads.tsx`
- `src/routes/contact.tsx`
- `src/routes/profile.tsx`
- `src/routes/template.$id.tsx`
- `src/routes/admin.tsx`
- `src/components/admin/TemplateList.tsx`
- `src/components/admin/TemplateForm.tsx`
- `src/components/admin/ReviewList.tsx`
- `src/components/admin/RefundRequestList.tsx`
- `src/components/admin/OrderList.tsx`
- `src/components/admin/OrderDetails.tsx`
- `src/components/admin/CouponList.tsx`
- `src/components/admin/ContactList.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/R2ImageUpload.tsx`
- `src/components/admin/R2FileUpload.tsx`
- `src/components/NavbarSearch.tsx`
- `src/components/ReviewsSection.tsx`
- `src/components/SpaThemes.tsx`
- `src/components/PricingSection.tsx`
- `src/components/preview/ContactModal.tsx`
- `src/components/profile/RefundButton.tsx`
- `src/components/profile/OrderItemsList.tsx`

**Interfaces:**
- Consumes: server functions from Tasks 7-8.

- [ ] **Step 1: Repoint the R2 upload components**

`src/components/admin/R2FileUpload.tsx` — replace the `supabase.functions.invoke('r2-upload-url', ...)` call:

```tsx
import { getR2UploadUrl } from '@/server/functions/r2'
// ...
const { uploadUrl, publicUrl } = await getR2UploadUrl({ data: { fileName, contentType, folder: 'sources' } })
```

Same for `src/components/admin/R2ImageUpload.tsx` (keep its existing image folder).

- [ ] **Step 2: Repoint checkout/PayPal flows**

`src/routes/checkout.tsx`: replace the three `supabase.functions.invoke(...)` calls:

- `claim-free-order` → `await claimFreeOrder({ data: { items, couponCode } })`
- `create-paypal-order` → `await createPayPalOrder({ data: { items, couponCode, isAllAccess } })`
- `capture-paypal-order` → `await capturePayPalOrder({ data: { paypalOrderId, items, couponCode, isAllAccess } })`

`src/routes/checkout.pro-hosting.tsx`: replace `create-paypal-order`/`capture-paypal-order` with `createPayPalOrder({ data: { isProHosting: true, templateTitle, ... } })` and `capturePayPalOrder({ data: { paypalOrderId, isProHosting: true, templateTitle, proHostingNotes, ... } })`.

`src/routes/downloads.tsx`: `remove-purchased-template` → `await removePurchasedTemplate({ data: itemId })`.

- [ ] **Step 3: Repoint the remaining direct call sites**

For each remaining file, replace its `supabase.from('<table>')`/`supabase.rpc(...)` usage with the corresponding server function from Tasks 7-8, preserving local variable names and UI. Mapping:

| old supabase call | new server function |
|---|---|
| `from('templates')...` (public read) | `listTemplates` / `getTemplate` / `getCategories` |
| `from('reviews')...` (public approved) | `listReviews` |
| `from('contacts').insert(...)` | `submitContact` |
| `from('contacts')` (admin) | `listContacts` / `markContactRead` / `deleteContact` |
| `from('templates')` (admin CRUD) | `adminListTemplates` / `adminSaveTemplate` / `adminDeleteTemplate` |
| `from('template_downloads')` (admin) | via `adminSaveTemplate` |
| `from('reviews')` (admin) | `adminListReviews` / `adminUpdateReviewStatus` / `adminDeleteReview` |
| `from('refund_requests')` | `createRefundRequest` / `listRefundRequests` / `updateRefundRequest` |
| `from('orders')` (admin) | `adminListOrders` / `adminUpdateOrderStatus` / `adminDeleteOrder` |
| `from('order_items')` | `getOrderWithItems` |
| `from('coupons')` (admin) | `listCoupons` / `createCoupon` / `deleteCoupon` / `toggleCoupon` |
| `from('site_settings')` | `getSiteSettings` / `saveSiteSetting` |
| `from('favorites')` | `listFavorites` / `toggleFavorite` |
| `from('profiles')` (update) | `updateProfile` |
| `rpc('validate_coupon')` | `validateCoupon` |

Note: admin components that previously got rows via `useQuery` should call the matching server function in their `queryFn`. Where a component did a one-off `supabase.auth.getUser()` + query, fold that into the server function call (the session is read server-side).

- [ ] **Step 4: Remove leftover Supabase imports**

After all files are repointed, verify none remain:

```powershell
rg -n "integrations/supabase|@supabase/supabase-js|supabase\." src
```

Expected: no matches.

- [ ] **Step 5: Verify typecheck + build**

```powershell
npm run build
```

Expected: full build passes. Fix any type errors surfaced by the repointing.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: repoint all direct Supabase call sites to server functions"
```

---

### Task 11: Cleanup, env plumbing, and verification

**Files:**
- Modify: `package.json` (scripts)
- Modify: `src/test/example.test.ts` (drop Supabase reference)
- Modify: `.gitignore` (if needed)

- [ ] **Step 1: Final grep for removed libs**

```powershell
rg -n "next-themes|react-router-dom|supabase|lovable" src package.json
```

Expected: no matches.

- [ ] **Step 2: Update `package.json` scripts**

```json
{
  "dev": "vite dev",
  "build": "vite build",
  "start": "vite preview",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:seed": "tsx src/server/db/seed.ts"
}
```

- [ ] **Step 3: Fix `src/test/example.test.ts`**

Replace the example test with a smoke test against pure functions (no DB):

```ts
import { describe, it, expect } from 'vitest'
import { seededRandom, seededShuffle } from '@/lib/seeded'

describe('seeded helpers', () => {
  it('seededShuffle is deterministic', () => {
    const a = seededShuffle(['a', 'b', 'c', 'd'], 'seed')
    const b = seededShuffle(['a', 'b', 'c', 'd'], 'seed')
    expect(a).toEqual(b)
  })
  it('seededRandom returns values in [0,1)', () => {
    const rand = seededRandom('x')
    for (let i = 0; i < 100; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
```

- [ ] **Step 4: Run full verification**

```powershell
npm run lint
npm run test
npm run build
```

Expected: all three pass.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "chore: cleanup and final verification"
```

---

## Final smoke test (manual, after env is populated)

1. Populate `.env` with `TURSO_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, `PAYPAL_SECRET`.
2. `npx drizzle-kit migrate` then `npm run db:seed`.
3. `npm run dev`, then verify: browse catalog, search, template detail, cart → PayPal sandbox create/capture, free claim, favorites toggle, signup/login, admin (R2 image + file upload, template CRUD, coupons, orders, reviews, contacts, refunds, site settings), notifications, refund request, downloads.
