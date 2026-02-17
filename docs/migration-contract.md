# Migration Contract (Qwik)

Date: 2026-02-17

Non-negotiable requirements for migration from legacy static pages to Qwik/Qwik City:

1. Preserve design 1:1 on all pages (desktop/tablet/mobile).
2. Preserve functionality 1:1 on all pages:
   - forms and submissions,
   - calculators,
   - modals,
   - language switching,
   - all existing user flows.
3. No temporary UI simplifications in production paths.
4. No iframe-based rendering as a final solution.
5. Every migrated page is accepted only after visual + functional parity check.

