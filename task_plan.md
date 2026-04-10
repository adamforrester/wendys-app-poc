# Wendy's App Prototype — Phase 1: Foundation

**Goal:** Scaffold the React + TypeScript project with all dependencies, design tokens, fonts, and app shell so we can immediately start building components.

**PRD Reference:** `assets/wendys-prototype-prd.md`

---

## Phase 1A: Project Scaffolding & Dependencies
**Status:** `complete`

### Steps
1. Initialize Vite + React + TypeScript project
2. Install core dependencies:
   - `tailwindcss` (v4 — CSS-first config, no `tailwind.config.js` needed)
   - `@tailwindcss/vite` (Vite plugin)
   - `framer-motion`
   - `lottie-react`
   - `react-router-dom`
   - `react-map-gl` + `mapbox-gl` (map for location selection)
3. Install dev dependencies:
   - `storybook` + `@storybook/react-vite`
   - `@storybook/addon-viewport` (mobile viewport preset)
4. Initialize Storybook
5. Set up `.gitignore`, `.env.example` (for Mapbox token)

### Decisions Needed
- **Tailwind v3 vs v4?** — Recommend **v4** (CSS-first config, `@theme` directive, no JS config file). Tokens map cleanly to CSS custom properties which is exactly what we have. Tailwind v4 natively consumes `--var(...)` tokens.
- **Mapbox now or later?** — Install the package now, but defer map component to Phase 2 (Location Selection screen). Need a Mapbox access token from Adam or a free-tier account.

---

## Phase 1B: Design Token System
**Status:** `complete`

### Steps
1. Copy `assets/tokens/css/tokens.css` into `src/styles/tokens.css` — this is our source of truth (most complete: colors, spacing, radii, borders, shadows)
2. Import tokens.css in the app's main CSS file
3. In Tailwind v4, use `@theme` to map `--wds-*` CSS vars to Tailwind utilities:
   - Colors: `--wds-color-*` → `color-*` utilities
   - Spacing: `--wds-space-*` → spacing scale
   - Radii: `--wds-borderradius-*` / `--wds-radius-*` → border-radius scale
   - Shadows: `--wds-onlight-*` → shadow utilities
   - Borders: `--wds-border-*` → border-width scale
4. Keep the React TS token files (`colors.ts`, etc.) in `assets/` as reference but **don't import them** — CSS custom properties are the single source of truth for Tailwind

### Token Notes
- The CSS file has **both** primitive values (e.g., `--wds-color-red-500`) and semantic aliases (e.g., `--wds-color-bg-brand-primary-default`). We'll map both into Tailwind.
- The CSS file references some undefined vars (`--space-16`, `--border-1`, `--radius-none`) in the semantic spacing/radius aliases — we need to use the resolved `--wds-space-*` / `--wds-radius-*` values instead.
- Light theme is the default. Dark theme tokens exist in DTCG JSON but are lower priority.

---

## Phase 1C: Typography & Fonts
**Status:** `complete`

### Steps
1. Copy font files to `public/fonts/`:
   - `wendys-fresh/WOFF2/*.woff2` (6 weights: Rg, Md, SBd, Bd, XBd, Blk)
   - `roboto/woff/*.woff` (Regular, Medium, Bold)
2. Create `@font-face` declarations in `src/styles/fonts.css`:
   - `Wendys Fresh` — weights: 400(Rg), 500(Md), 600(SBd), 700(Bd), 800(XBd), 900(Blk)
   - `Roboto` — weights: 400(Regular), 500(Medium), 700(Bold)
3. Register font families in Tailwind theme:
   - `font-display` → Wendys Fresh (headlines)
   - `font-body` → Roboto (body/UI)

### Decision
- **Font weight mapping for Wendys Fresh:** The file names suggest Rg=400, Md=500, SBd=600, Bd=700, XBd=800, Blk=900. Confirm this is correct.

---

## Phase 1D: App Shell & Mobile Viewport
**Status:** `complete`

### Steps
1. Create mobile viewport wrapper component (`DeviceFrame`) — renders at 390x844 (iPhone 13/14), centered in browser
2. Create `AppShell` component — contains:
   - `<TopBar />` placeholder
   - `<main>` content area (routing outlet)
   - `<BottomTabBar />` placeholder
3. Set up React Router with tab-based root navigation:
   - `/` → Home
   - `/offers` → Offers
   - `/order` → Order (Location Selection entry)
   - `/earn` → Earn
   - `/account` → Account
4. Nested routes within Order tab for stack navigation
5. Create splash screen using Lottie (copy `assets/splash-screen-animation/splash.json` to `src/animations/lottie/`)

---

## Phase 1E: Context Providers & Feature Flags
**Status:** `complete`

### Steps
1. Create 5 global context providers with useReducer:
   - `AuthContext` — isAuthenticated, user profile, login/logout
   - `LocationContext` — selected location, fulfillment method, location permission state
   - `BagContext` — items, promo code, locationConfirmed flag
   - `DaypartContext` — current daypart (Breakfast/Lunch/Dinner/Late Night)
   - `FeatureFlagsContext` — reads from featureFlags.ts config
2. Create `src/config/featureFlags.ts` with initial flags:
   - `addToBagTransition: "snackbar"` (confirmed in PRD)
   - `comboBuilderStyle: "bottom-sheet-wizard"` (confirmed in PRD)
   - `locationSelectionLayout: "map-and-list"` (default)
3. Wrap app in provider tree

---

## Phase 1F: Storybook Configuration
**Status:** `complete`

### Steps
1. Configure Storybook with `@storybook/react-vite`
2. Add viewport addon with custom Wendy's mobile viewport (375x812)
3. Import tokens.css and fonts.css in Storybook preview
4. Verify Storybook runs with a placeholder story

---

## Execution Order
1. **1A** — Scaffolding (must be first)
2. **1B + 1C** — Tokens + Fonts (can be parallel, both are CSS setup)
3. **1D** — App Shell (depends on routing being installed from 1A)
4. **1E** — Context Providers (depends on app structure from 1D)
5. **1F** — Storybook (depends on tokens/fonts from 1B/1C)

---

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| (none yet) | | |
