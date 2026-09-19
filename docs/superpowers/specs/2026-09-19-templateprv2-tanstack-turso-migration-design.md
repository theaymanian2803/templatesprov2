# Design: `templateprv2` — TanStack Start + Turso migration

Date: 2026-09-19
Status: Approved (pending spec review)

## 1. Goal

Duplicate the existing `templatepro` marketplace ("Unccodestore") into a new
project on the Desktop named `templateprv2`, and replace its backend stack:

| Concern | Before (`templatepro`) | After (`templateprv2`) |
|---|---|---|
| Framework | Vite SPA + `react-router-dom` | TanStack Start (full-stack) |
| Database | Supabase Postgres | Turso (libSQL) |
| ORM | Supabase JS client (RLS) | Drizzle ORM + `@libsql/client` |
| Auth | Supabase Auth | Better Auth (email/password, cookie sessions) |
| Server logic | Supabase Edge Functions (Deno) | TanStack Start server functions + API routes |
| File uploads | R2 via `r2-upload-url` edge fn | R2 via server function (same S3 presign) |
| Payments | PayPal via edge functions | PayPal via server functions |
| UI | shadcn/ui + Tailwind + Framer Motion + Zustand + React Query + i18n | unchanged |

The **frontend UI, pages, components, i18n locales, styles, and design tokens are
preserved** and reused as-is. The seam of change is the data layer: 31 files that
import `@/integrations/supabase/client` get pointed at server functions instead.

## 2. Non-goals (out of scope)

- No data migration from the live Supabase project. Turso starts empty; the seed
  script re-inserts sample templates and `site_settings`.
- No new features. Behavior parity is the target.
- No visual redesign or rebranding (name/colors stay as-is for now).

## 3. Project layout

Create `C:\Users\PC\Desktop\templateprv2` by copying the repo excluding
`node_modules`, `dist`, `.git`, `.codex`, `.claude`, `supabase/`, and Supabase
references. Fresh `git init`.

Target structure:

```
templateprv2/
  app.config.ts            # TanStack Start config (vite plugin, router)
  src/
    router.tsx             # createRouter with routes from ./routes
    routeTree.gen.ts       # generated
    routes/
      __root.tsx           # root layout: providers, nav, footer, toasters
      index.tsx            # "/"            (was pages/Index)
      templates.tsx        # "/templates"
      template.$id.tsx     # "/template/:id"
      ...                  # one route per page (see §4)
      admin.tsx            # "/admin"
      checkout.tsx
      checkout.pro-hosting.tsx
      auth.tsx, reset-password.tsx, ...
    server/
      db/
        client.ts          # drizzle + @libsql/client (uses TURSO_URL, TURSO_AUTH_TOKEN)
        schema.ts          # all tables (§5)
        migrate.ts         # drizzle-kit / run migrations
      auth.ts              # betterAuth() instance + getSession helper
      admin.ts             # isAdmin(userId) helper (replaces has_role)
      functions/
        templates.ts       # listTemplates, listTemplatesPaginated, getTemplate, categories
        orders.ts          # createOrder, capturePayPal, claimFree, removePurchased, listOrders
        reviews.ts         # listReviews, submitReview, updateReview, deleteReview
        favorites.ts       # toggleFavorite, listFavorites
        coupons.ts         # listCoupons (admin), validateCoupon
        notifications.ts   # listNotifications, markRead
        dashboard.ts       # dashboard stats
        contact.ts         # submitContact
        refunds.ts         # createRefund, listRefunds (admin)
        admin.ts           # admin catalog ops (CRUD templates, downloads, site settings)
        r2.ts              # getR2UploadUrl
        paypal.ts          # shared PayPal token/order helpers
    components/            # copied unchanged (drop supabase imports)
    contexts/              # CartContext unchanged; AuthContext/FavoritesContext rewritten
    hooks/                 # 10 hooks rewritten to call server functions
    lib/, i18n/            # copied unchanged
  drizzle/
    0000_init.sql          # initial Turso schema (port of Postgres migrations)
  drizzle.config.ts
  .env                     # TURSO_URL, TURSO_AUTH_TOKEN, BETTER_AUTH_SECRET,
                           # PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_ENVIRONMENT,
                           # R2_*, LOVABLE_API_KEY (optional)
  package.json
  vite.config.ts           # replaced by app.config.ts (TanStack Start)
  tsconfig.json
```

## 4. Framework conversion (TanStack Start)

- Install `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`.
- Move each `src/pages/*.tsx` to `src/routes/*` with file-based naming; route params
  become `template.$id.tsx`. The existing `App.tsx` providers move to `__root.tsx`
  (QueryClientProvider, AuthProvider, FavoritesProvider, CartProvider, TooltipProvider,
  Toaster/Sonner, ScrollToTop, CookieConsent, ChatBubble).
- Remove `BrowserRouter`/`Routes`/`Route` (react-router) entirely. `NavLink` and
  `ScrollToTopOnNavigate`/`ScrollToHash` are rewritten against TanStack Router's
  `Link`/`useLocation`/`useNavigate`.
- Lazy loading via TanStack Router's `createLazyRoute` or default component exports.
- Drop `next-themes` (no dark-mode requirement).

## 5. Data layer: Turso + Drizzle

### 5.1 Schema (port of Postgres migrations)

Type conventions for SQLite:

- `uuid` → `text` (ids generated in app code via `crypto.randomUUID()`).
- `timestamp with time zone` → `integer` with Drizzle `{ mode: 'timestamp' }` (unix ms).
- `numeric`/`decimal` (money) → `real` (JS `number`). Acceptable for this marketplace;
  all money math stays server-side and matches the current JS `number` behavior.
- `text[]` arrays → `text` with Drizzle `{ mode: 'json' }` (JSON-encoded array).
- `jsonb` → `text` with Drizzle `{ mode: 'json' }`.
- Postgres enums (`app_role`, `order_status`) → `text` + `check` constraint.
- `boolean` → `integer` with Drizzle `{ mode: 'boolean' }`.

Tables (14 app tables + Better Auth's own tables):

1. `profiles` — id, user_id, display_name, avatar_url, created_at, updated_at
2. `user_roles` — id, user_id, role (`admin|moderator|user`), unique(user_id, role)
3. `favorites` — id, user_id, template_id (text), created_at, unique(user_id, template_id)
4. `templates` — id, title, description, category, price, extended_price, image_url,
   gallery_images(json), rating, sales, featured, tech_stack(json), features(json),
   demo_url, youtube_id, review_count, created_at, updated_at
5. `orders` — id, user_id, user_email, status (`pending|processing|completed|cancelled|refunded`),
   total_amount, paypal_order_id (unique), created_at, updated_at
6. `order_items` — id, order_id, template_id, template_title, license_type, price, created_at
7. `all_access_passes` — id, user_id, order_id, price, created_at
8. `coupons` — id, code (unique), discount_type (`percentage|fixed`), discount_value,
   min_order_amount, max_uses, used_count, is_active, expires_at, created_at
9. `contacts` — id, name, email, subject, message, template_id, template_title,
   is_read, created_at
10. `reviews` — id, user_id, template_id, rating (check 1..5), comment, status
    (`pending|approved`), created_at, updated_at, unique(user_id, template_id)
11. `template_downloads` — id, template_id (unique), source_file_url
12. `refund_requests` — id, order_id, user_id, reason, status, admin_notes, created_at, updated_at
13. `notifications` — id, user_id, type, title, message, is_read, metadata(json), created_at
14. `site_settings` — key (pk), value(json), updated_at

Better Auth tables: `user`, `session`, `account`, `verification` (generated by
Better Auth + Turso adapter via `drizzle-adapter`).

### 5.2 Triggers → app code

Postgres triggers/functions are re-implemented in server functions (no DB triggers):

- `handle_new_user` → Better Auth `databaseHooks.user.create.after` creates profile + role.
- `update_updated_at_column` → explicit `updatedAt` set in Drizzle updates.
- `enforce_pending_order_total` → moot; orders are only created server-side.
- `notify_order_status_change` / `notify_new_template` → server functions insert
  notifications after status change / template insert.
- `update_template_review_count` → recalc `templates.review_count` in review
  create/update/delete server functions.
- `increment_template_sales` → `UPDATE templates SET sales = sales + 1 WHERE id = ?`
  (atomic in SQLite).
- `validate_coupon` → server function `validateCoupon(code, total)`.

### 5.3 RLS → server-side authorization

There is no direct client→DB access. Every query goes through a server function
that reads the Better Auth session and enforces ownership/role:

- `requireUser()` / `requireAdmin()` helpers in `server/auth.ts`.
- Ownership checks (favorites, orders, order_items, reviews, notifications,
  refund requests) are `WHERE user_id = session.userId` or explicit equality checks.
- Admin-only ops (templates CRUD, downloads, coupons, contacts, site settings)
  gate on `isAdmin(session.userId)` (role row in `user_roles`, seeded for the
  configured admin email).

## 6. Auth: Better Auth

- `better-auth` with the Turso/Drizzle adapter, email+password provider.
- Cookie-based sessions; `getSession()` reads `request.headers` (or TanStack Start
  `getWebRequest()`).
- `AuthContext` rewritten: `signUp`, `signIn`, `signOut`, `resetPassword`,
  `updatePassword` call `authClient` methods; `useAuth()` still exposes
  `{ user, session, loading, ... }` so consumers change minimally.
- Admin gating unchanged in spirit: after signup, the admin email gets an
  `admin` role row (seed or `databaseHooks`), and `isAdmin()` checks it.
- `VITE_SUPABASE_*` env vars removed.

## 7. Server functions / API routes (replace edge functions)

| Old (Supabase edge fn / RPC) | New |
|---|---|
| `create-paypal-order` | `server/functions/orders.ts` `createPayPalOrder` |
| `capture-paypal-order` | `server/functions/orders.ts` `capturePayPalOrder` |
| `claim-free-order` | `server/functions/orders.ts` `claimFreeOrder` |
| `remove-purchased-template` | `server/functions/orders.ts` `removePurchasedTemplate` |
| `r2-upload-url` | `server/functions/r2.ts` `getR2UploadUrl` |
| `increment_template_sales` (RPC) | inline in order server functions |
| `validate_coupon` (RPC) | `server/functions/coupons.ts` `validateCoupon` |

The PayPal functions reuse the exact pricing/coupon/verification logic from the
edge functions, with `PAYPAL_CLIENT_ID` + `PAYPAL_SECRET` server-side (secret moves
out of `VITE_*`). R2 uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` on
the server with the existing `R2_*` env vars.

The data hooks (below) become TanStack Start server functions invoked from the
client via `createServerFn`.

## 8. Frontend data-flow changes

The 10 hooks + AuthContext + FavoritesContext are the seam. Each `queryFn`/`mutate`
switches from `supabase.from(...)` to a server function call, keeping the same
return shapes so components are untouched:

- `useTemplates` → `templates.list({featured, category, limit})`,
  `templates.listPaginated(...)`, `templates.get(id)`, `templates.categories()`
- `useOrders` → `orders.list()`
- `useReviews` → `reviews.list(templateId)`, `reviews.submit`, `reviews.update`, `reviews.delete`
- `useFavorites` (context) → `favorites.list`, `favorites.toggle`
- `useCoupons` → `coupons.list` (admin), `coupons.validate`
- `useNotifications` → `notifications.list`, `notifications.markRead`
- `useDashboard` → `dashboard.stats`
- `useAllAccessPass` → `orders.hasAllAccess` / fold into dashboard
- `useAdminRole` → `auth.isAdmin` (server fn)

Direct `supabase` calls inside pages/components (`Checkout`, `Downloads`,
`ProHostingCheckout`, `Contact`, `Profile`, `TemplatePreview`, `Admin`, admin
components, `NavbarSearch`, `ReviewsSection`, `SpaThemes`, `PricingSection`,
`ContactModal`, `RefundButton`, `OrderItemsList`, `R2ImageUpload`, `R2FileUpload`)
are replaced with the corresponding server-function calls.

## 9. Environment / config

`.env` (server + client split via TanStack Start conventions):

- `TURSO_URL`, `TURSO_AUTH_TOKEN` (server)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (server)
- `PAYPAL_CLIENT_ID` (client), `PAYPAL_SECRET` (server), `PAYPAL_ENVIRONMENT`
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_PUBLIC_DOMAIN` (server)
- `ADMIN_EMAIL` (server, used to seed admin role)

`PAYPAL_SECRET` is **not** in the existing `.env` (only the client ID is). The user
will supply it during setup; PayPal flows will 500 until it is added.

## 10. Verification

- `npm run build` (TanStack Start build) passes.
- `npm run lint` passes.
- `npm run test` (vitest) passes; existing `src/test` kept, `example.test.ts` updated
  to not reference Supabase.
- Manual smoke: browse catalog, search, template detail, cart → PayPal (sandbox)
  create/capture, free claim, favorites, auth signup/login, admin upload (R2), reviews,
  notifications, refund request.

## 11. Risks / notes

- **TanStack Start + Vite plugin** replaces `vite.config.ts`; some Vite/TS config
  (aliases `@/`, path resolution) must be re-applied in `app.config.ts`/`tsconfig.json`.
- **Money as REAL** is a known simplification; safe for this app but documented.
- **`PAYPAL_SECRET` missing** from current `.env` — the user confirmed they will add it.
- **AI `chat` endpoint is dropped** (no frontend caller; only WhatsApp is wired).
- **Realtime notifications** (Supabase publication) are dropped; notifications become
  request-time reads (poll via React Query), not push. Acceptable for parity.

## 12. Decisions

1. `PAYPAL_SECRET` will be supplied by the user after scaffolding.
2. AI `chat` endpoint: **removed**.
3. `next-themes` (dark mode): **removed**.
