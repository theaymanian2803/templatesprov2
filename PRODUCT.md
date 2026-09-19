# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and designers buying digital templates, themes, and source code to ship client or side projects faster. Two audiences in practice: developers/indie founders sourcing clean, modern code, and designers/agencies sourcing UI kits, landing pages, and design assets to adapt for client work.

## Product Purpose

Unccodestore is a marketplace for ready-to-use templates, themes, and source code. It exists to give builders a curated catalog of high-quality, modern-stack templates they can buy, download, and ship from. Success means buyers find a template fast, trust its code quality, and reuse it in real projects.

## Positioning

Templates built on a modern React + TypeScript + Vite + shadcn/ui + Tailwind stack with clean, maintainable code — a contrast to the legacy PHP/jQuery themes that dominate older marketplaces like ThemeForest/Envato. Buyers get code they can actually extend, not just skin.

## Operating Context

- Browse a catalog filtered by category and sorted by featured/bestsellers/newest.
- Search across templates, themes, and source code by keyword.
- Per-template preview pages with details before purchase.
- Cart, checkout, and (optional) pro-hosting checkout.
- Authenticated account area: dashboard, downloads, favorites, profile settings.
- Admin panel for managing the catalog (uploads to R2 storage).
- All-Access Pass ($300) for unlimited downloads as an alternative to pay-per-item.
- Self-serve legal/help pages: license, refunds, privacy, terms, cookies, FAQ, contact.

## Capabilities and Constraints

- Tech stack: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, Supabase (backend/auth), React Query, React Router, Zustand, Framer Motion.
- Deployed on Vercel; SPA with client-side routing rewrites to index.html.
- Supabase drives auth, data, and storage; R2 used for file uploads.
- Admin role gated to a specific authorized email.
- Cart and favorites are session-backed via React context.

## Brand Commitments

No fixed brand commitments were confirmed. Name ("Unccodestore") and visual identity (currently orange #f97316 accent) are free to evolve in future design work.

## Evidence on Hand

- Runnable web app in this repository (React + Vite + Supabase).
- Full route map and page inventory under `src/pages`.
- Supabase schema/migrations under `supabase/`.
- Navbar and Footer define current surface structure; no DESIGN.md exists yet.

## Product Principles

1. Code quality is the product: templates must be modern, clean, and maintainable enough to extend.
2. Fast path from discovery to download: search, filter, preview, and checkout should feel effortless.
3. Trust through clarity: pricing, licensing, and ownership are transparent and self-serve.
4. One catalog, many stacks: cover the breadth developers and designers expect without diluting quality.

## Accessibility & Inclusion

No product-specific accessibility standard was established yet. Default to common web accessibility best practices until a requirement is confirmed.