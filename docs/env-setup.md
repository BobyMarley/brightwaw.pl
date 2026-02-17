# Env Setup (Supabase + Stripe + Edge)

## Local
1. Copy `.env.example` to `.env.local`.
2. Fill values for your project.

## Vercel CLI
Run from repo root:

```powershell
npx vercel env add PUBLIC_SITE_URL production
npx vercel env add PUBLIC_API_BASE_URL production
npx vercel env add PUBLIC_SUPABASE_URL production
npx vercel env add PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add PUBLIC_STRIPE_PUBLISHABLE_KEY production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
npx vercel env add STRIPE_SECRET_KEY production
npx vercel env add STRIPE_WEBHOOK_SECRET production
npx vercel env add TELEGRAM_BOT_TOKEN production
npx vercel env add TELEGRAM_CHAT_ID production
npx vercel env add ALLOWED_ORIGIN production
npx vercel env add EDGE_REGION production
npx vercel env add EDGE_MODE_ENABLED production
```

Repeat for `preview` and `development`.

## Notes
- `PUBLIC_*` values can be exposed to browser.
- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN` are server-only.
- `TELEGRAM_CHAT_ID` supports comma-separated ids.
