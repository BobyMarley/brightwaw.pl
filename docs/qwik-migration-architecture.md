# Qwik Migration Architecture

Date: 2026-02-17

## 1. Product Contract
- Preserve design **1:1** on every page and breakpoint.
- Preserve behavior **1:1** (forms, calculators, modals, language switch, SEO output).
- Keep encoding UTF-8 everywhere.
- Do not ship iframe-based UI as final solution.

## 2. Current Runtime Model
- Runtime shell: `Qwik + Qwik City` in `apps/web-qwik`.
- Legacy pages are currently rendered through Qwik routes for backward compatibility.
- API for Telegram sending runs in Qwik route: `/api/telegram_proxy`.

## 3. Page Inventory (Migration Scope)
Primary public pages:
- `/`, `/cennik`, `/pranie`, `/sprzatanie-mieszkan-warszawa`
- `/en/*`, `/ru/*`, `/by/*`

Supporting/legacy pages:
- `404`, `rabaty`, `privacy-policy`, language-specific privacy pages
- RU extra service pages (`generalnaya-uborka`, `remont`, `ofisy`, etc.)

Rule:
- PL structure is baseline template for EN/RU/BY localizations.

## 4. Target Folder Architecture
- `apps/web-qwik/src/features/home/*`
- `apps/web-qwik/src/features/pranie/*`
- `apps/web-qwik/src/features/pricing/*`
- `apps/web-qwik/src/features/leads/*`
- `apps/web-qwik/src/features/auth/*`
- `apps/web-qwik/src/features/dashboard/*`
- `apps/web-qwik/src/lib/seo/*`
- `apps/web-qwik/src/lib/supabase/*`
- `apps/web-qwik/src/server/edge/*`
- `apps/web-qwik/src/stores/*`

## 5. Data and State Strategy
Server state:
- `routeLoader$` for page data.
- `routeAction$` / server routes for mutations.

Client/UI state:
- `useSignal/useStore` in feature boundaries.
- minimal global store (`locale`, auth snapshot, region flags).

I18n:
- locale dictionaries with PL as canonical content map.
- shared locale resolver by pathname.

## 6. Supabase Plan
Core tables:
- `profiles`, `roles`, `leads`, `orders`, `services`, `service_prices`, `reviews`, `localized_content`

Security:
- RLS by role (`client`, `manager`, `admin`)
- service role key only in server runtime

## 7. Edge and API Plan
- Edge-safe helpers in `src/server/edge/*`
- idempotency key for lead submissions
- unified payload parsing and error envelopes
- Telegram proxy remains single outbound gateway for forms

## 8. Auth and Dashboard Plan
Auth:
- Supabase Auth (email magic link/OAuth for internal staff)
- role checks in protected route loaders

Dashboard:
- `/dashboard` for manager/admin
- leads queue, statuses, conversion counters, response-time KPI

## 9. SEO Strategy
- route-level `DocumentHead`
- canonical + hreflang for every localized route
- OG/Twitter tags
- JSON-LD (`LocalBusiness`, `FAQPage`, `Service`, `BreadcrumbList`)
- clean redirects and stable URL structure

## 10. Performance Strategy
- critical CSS and deferred non-critical JS
- image optimization (`srcset`, dimensions, lazy loading)
- edge caching for read-heavy endpoints
- monitor Core Web Vitals (LCP/CLS/INP) on key pages

## 11. Migration Stages
1. Stabilize architecture and contracts (this document + scaffolds).
2. Migrate `PL /` to native Qwik components (remove legacy render for `/`).
3. Migrate `PL /pranie`.
4. Migrate `PL /cennik` and service pages.
5. Roll out EN/RU/BY on same component structure.
6. Redesign and migrate legal pages (`privacy-policy`, agreements).
7. Remove legacy-render fallback after full parity checks.

## 12. Acceptance Criteria Per Page
- Visual parity desktop/tablet/mobile.
- Functional parity of all forms, modals, calculators.
- Correct locale content and links.
- Correct metadata and structured data.
- No regressions in API submissions.
