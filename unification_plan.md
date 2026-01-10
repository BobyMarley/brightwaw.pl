# Unification Plan (Phase 7)

## 1. Button Unification
**Target:** `.btn` (Base class)
**Variants:**
*   `.btn--primary` (Gradient Blue) -> Replaces: `.zamow-btn`, `#send`, `.promo-cta`, `.land-btn`, `.reviews-button`, `.pricing-cta`
*   `.btn--secondary` (White/Outline) -> Replaces: `#cancel`, `.land-btn-white`, `.cleaning-type-btn`
*   `.btn--icon` -> Replaces: `.btn-plus`, `.btn-minus`

**Action:**
1.  Define `.btn` system in CSS.
2.  Update HTML: Add `class="btn btn--primary"` to all legacy buttons.
3.  Remove legacy CSS rules.

## 2. Card Unification
**Target:** `.card` (Base: white, radius-lg, shadow-sm, padding-lg)
**Variants:**
*   `.card--hover` (Translate Y + Shadow) -> Replaces: `.service-card`, `.feature-card`
*   `.card--glass` (Backdrop blur) -> Replaces: `.advantage-card`, `.equipment-logo`
*   `.card--3d` -> Replaces: `.benefit-card-3d`
*   `.card--flat` -> Replaces: `.pricing-card`, `.review-card`

**Action:**
1.  Define `.card` system.
2.  Update HTML strings.

## 3. Typography Standardization
**Target:** Global styling & Utility classes
*   Headings: `h1, h2, h3` get standard sizes/weights. Remove `.section-title`, `.section-heading`, `.what_cleaning h2`.
*   Subtitles: `.text-subtitle` -> Replaces `.section-subtitle`, `.section-subheading`.
*   Colors: Use `.text-primary`, `.text-dark`, `.text-muted` utilities strictly.

## 4. Modal/Form Standardization
*   Convert `#modal` styles to `.modal`.
*   Convert `#modal-container` to `.modal-overlay`.
*   Standardize `input` styles to `.input`.

## 5. Execution Strategy
**Risk:** Breaking JS selectors (e.g. `document.getElementById('send')`).
**Mitigation:** 
*   **DO NOT REMOVE IDs.** 
*   **DO ADD CLASSES.** 
*   CSS should target `.btn--primary`, not `#send`.
*   JS continues to use `#send`.

## Estimated Size Reduction
*   Current Layout/Comp CSS: ~25KB
*   New Unified CSS: ~5KB
*   Total Target: < 30KB
