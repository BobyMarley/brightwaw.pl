# web-qwik

Scaffold for incremental migration to Qwik + Qwik City.

## Architecture baseline
- `src/routes/*` - route entrypoints + SSR loaders (`routeLoader$`)
- `src/features/*` - feature modules (types, content, state, components)
- `src/lib/*` - shared integrations (Supabase, Stripe, env adapters)
- `src/server/*` - server-only helpers and env contracts

## Home page migration flow
1. Route (`src/routes/index/index.tsx`) resolves locale and loads typed page data on server.
2. Feature loader (`src/features/home/loaders.ts`) maps pathname -> locale -> content model.
3. Feature composition (`src/features/home/components/home-page.tsx`) assembles sections.
4. Local UI state (menu toggles, active tabs, calculators) lives in feature state modules.

## Scaling rules
- Keep static content in typed `content/*` files until Supabase CMS is connected.
- Move interaction-heavy blocks into isolated section components.
- Keep SSR-safe data fetching inside `routeLoader$` and server helpers only.
