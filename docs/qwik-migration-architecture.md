# Qwik Migration Architecture

## Goal
- Keep current static pages working (`/cennik.html`, `/pranie.html`, `/en/*`, `/by/*`, `/ru/*`).
- Move homepage (`/`) to Qwik + Qwik City.
- Use Supabase for data/auth later.
- Keep Telegram form sending via Vercel serverless (`/api/telegram_proxy`).

## Target Layout
- `apps/web-qwik/`
- `apps/web-qwik/src/routes/index/` - Qwik homepage route
- `apps/web-qwik/src/components/` - reusable UI blocks
- `apps/web-qwik/src/stores/` - global/client state
- `apps/web-qwik/src/lib/supabase/` - Supabase client/server helpers
- `apps/web-qwik/src/server/edge/` - edge-safe server helpers/actions

## Hybrid Deployment
- Static legacy pages remain in repo root for now.
- Vercel serves all static files and API endpoints.
- Next step: add Qwik build output and route `/` to Qwik app while keeping legacy static routes unchanged.

## Migration Order
1. Extract homepage sections from `index.html` into Qwik components.
2. Move homepage interactions to Qwik state/store.
3. Keep existing JS/forms for non-homepage static pages.
4. After parity, migrate each static page one-by-one.
