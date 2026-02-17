# Migration Pages Checklist (Qwik/Qwik City)

Date: 2026-02-17

## Scope Rules
- Baseline layout/content source: Polish pages (`/`, `/pranie`, `/cennik`, `/sprzatanie-mieszkan-warszawa`).
- EN/RU/BY are localized mirrors built from the same component structure.
- Current production-safe mode: legacy HTML rendered by Qwik routes.
- Native Qwik migration status is tracked per page below.

## Public Pages (Primary)
| Route | Source file | Locale | Priority | Status |
|---|---|---|---|---|
| `/` | `apps/legacy-static/index.html` | pl | P0 | in_progress |
| `/pranie` | `apps/legacy-static/pranie.html` | pl | P0 | pending |
| `/cennik` | `apps/legacy-static/cennik.html` | pl | P0 | pending |
| `/sprzatanie-mieszkan-warszawa` | `apps/legacy-static/sprzatanie-mieszkan-warszawa.html` | pl | P1 | pending |
| `/rabaty` | `apps/legacy-static/rabaty.html` | pl | P2 | pending |
| `/privacy-policy` | `apps/legacy-static/privacy-policy/index.html` | pl | P1 | pending |

## Public Pages (EN)
| Route | Source file | Priority | Status |
|---|---|---|---|
| `/en/` | `apps/legacy-static/en/index.html` | P1 | pending |
| `/en/pranie` | `apps/legacy-static/en/pranie.html` | P1 | pending |
| `/en/cennik` | `apps/legacy-static/en/cennik.html` | P1 | pending |
| `/en/privacy-policy` | `apps/legacy-static/en/privacy-policy/index.html` | P2 | pending |
| `/en/404` | `apps/legacy-static/en/404.html` | P3 | pending |

## Public Pages (RU)
| Route | Source file | Priority | Status |
|---|---|---|---|
| `/ru/` | `apps/legacy-static/ru/index.html` | P1 | pending |
| `/ru/pranie` | `apps/legacy-static/ru/pranie.html` | P1 | pending |
| `/ru/cennik` | `apps/legacy-static/ru/cennik.html` | P1 | pending |
| `/ru/generalnaya-uborka` | `apps/legacy-static/ru/generalnaya-uborka.html` | P2 | pending |
| `/ru/standartnaya-uborka` | `apps/legacy-static/ru/standartnaya-uborka.html` | P2 | pending |
| `/ru/generalna` | `apps/legacy-static/ru/generalna.html` | P3 | pending |
| `/ru/doma` | `apps/legacy-static/ru/doma.html` | P3 | pending |
| `/ru/ofisy` | `apps/legacy-static/ru/ofisy.html` | P3 | pending |
| `/ru/remont` | `apps/legacy-static/ru/remont.html` | P3 | pending |
| `/ru/job` | `apps/legacy-static/ru/job.html` | P3 | pending |
| `/ru/ol_cennik` | `apps/legacy-static/ru/ol_cennik.html` | P3 | pending |
| `/ru/cennik_new` | `apps/legacy-static/ru/cennik_new.html` | P3 | pending |
| `/ru/privacy-policy` | `apps/legacy-static/ru/privacy-policy/index.html` | P2 | pending |
| `/ru/404` | `apps/legacy-static/ru/404.html` | P3 | pending |

## Public Pages (BY)
| Route | Source file | Priority | Status |
|---|---|---|---|
| `/by/` | `apps/legacy-static/by/index.html` | P1 | pending |
| `/by/pranie` | `apps/legacy-static/by/pranie.html` | P1 | pending |
| `/by/cennik` | `apps/legacy-static/by/cennik.html` | P1 | pending |
| `/by/privacy-policy` | `apps/legacy-static/by/privacy-policy/index.html` | P2 | pending |
| `/by/404` | `apps/legacy-static/by/404.html` | P3 | pending |

## Global Error
| Route | Source file | Priority | Status |
|---|---|---|---|
| `/404` | `apps/legacy-static/404.html` | P2 | pending |

## Non-Public / Technical HTML (Not migration targets)
- `apps/legacy-static/worker-app.html`
- `apps/legacy-static/icons.html`
- `apps/legacy-static/download-icons.html`
- `apps/legacy-static/hhdltqp364oinsibuxscxshytrcwbt.html`
- `apps/legacy-static/ru/index_restored.html`

## Progress Counters
- Public pages total: 31
- Native Qwik pages completed: 0
- Native Qwik pages in progress: 1 (`/`)
- Legacy-through-Qwik fallback coverage: 31/31

## Next Execution Order
1. Migrate `/` (pl) to native Qwik section-by-section with strict visual parity.
2. Migrate `/pranie` (pl) and submission flow parity.
3. Migrate `/cennik` (pl), then `/sprzatanie-mieszkan-warszawa`.
4. Roll out EN/RU/BY using shared components + locale dictionaries.
5. Migrate legal pages to modernized design.
