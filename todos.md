# Todos

## Done this session
- Hero redesign: websites + iOS/Android apps concept, interactive floating phone + website card, responsive breakpoints end-to-end.
- Google sign-in added (primary) with email/password kept as secondary.
- Turso DB migrated (all 18 tables) + seeded.
- `BETTER_AUTH_SECRET` rotated to a strong 32-byte value.
- Cleanup: removed dead hero CSS (`.hero-content`, `.hero-arch*`, `.template-visual`, `.visual-*`, `.template-meta`) in `src/index.css`.
- Fixed fr/ar hero copy nitpick (ar `popular` → `الأكثر رواجاً`); fr copy verified accurate.
- Navbar admin detection now via `useAdminRole()` (DB `user_roles` table) — removed hardcoded email check.
- Navbar mega menus (browse/company/legal) switch from click to hover (120ms close delay).
- Admin dashboard made realistic/real-time: `seed.ts` + live DB reset to `sales = 0, rating = 0, review_count = 0` (0 real orders exist).
- Admin dashboard fully converted to English-only (no i18n): `admin.tsx` + all `src/components/admin/*` (Sidebar, TemplateList, TemplateForm, OrderList, OrderDetails, CouponList, ReviewList, ContactList, RefundRequestList, R2ImageUpload, R2FileUpload).
- Build passes after admin English conversion.
- Google sign-in fixed and working (console updated to `redirect_uri: http://localhost:8080/api/auth/callback/google`).

## Pending
- (none currently — Google sign-in resolved)

## Config reference
- Credentials live in `.env` (gitignored): `BETTER_AUTH_URL=http://localhost:8080`, Google OAuth client ID/secret, Turso DB URL/token.
