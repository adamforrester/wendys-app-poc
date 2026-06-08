# Architecture

App-level architecture: contexts, routing, layout. Component-level conventions live in [`component-guide.md`](./component-guide.md).

## Five Global Contexts

| Context | Purpose |
|---|---|
| `AuthContext` | Auth state, user profile, rewards points. **Defaults to authenticated** with mock user from `user.json` (Alex Johnson, 2,450 points, Gold tier). |
| `LocationContext` | Selected restaurant, fulfillment method, GPS permission state. Type re-exported from `src/data/types.ts` (canonical shape). |
| `BagContext` | Cart items, promo code, location confirmation gate |
| `DaypartContext` | Breakfast/Lunch/Dinner/Late Night |
| `FeatureFlagsContext` | Runtime A/B flag toggles from `src/config/featureFlags.ts` |

## Routing

- **Root tabs:** Home (`/`), Offers (`/offers`), Order (`/order`), Earn (`/earn`), Account (`/account`)
- **Stack within Order tab:** Location → Menu → Category → PLP → SPP → Bag → Checkout → Confirmation
- Each screen renders its own `<TopAppBar>` with the appropriate configuration
- `<BottomTabBar>` is rendered by `<AppShell>` and persists across all root screens
- `/voice` is registered **outside** `AppShell` (no tab bar) — full-screen experience

## Device Frame & Status Bar

- `DeviceFrame` renders the 390×844 phone shell with rounded corners and dark bezel; `position: relative` + `overflow: hidden` is the nearest positioned ancestor for absolutely-positioned overlays
- `StatusBar` is a **global overlay** (absolute positioned, pointer-events-none) with Dynamic Island notch, time, and indicators
- `TopAppBar` includes a 54px safe-area spacer so its background extends behind the transparent status bar
- Status bar supports `light` (white text, for dark/colored backgrounds) and `dark` (black text, for light backgrounds) modes — flipped per-screen via `StatusBarModeContext`

## Data Hooks vs. State Contexts

Data hooks (read-only access to JSON):

| Hook | Source | Key Methods |
|---|---|---|
| `useMenuData()` | `menu.json` | `getAllCategories`, `getProductById`, `getProductBySlug`, `getIngredientsForProduct`, `getAddOnGroupsForProduct`, `getProductImagePath` |
| `useLocationData()` | `locations.json` | `getAllLocations`, `getLocationById`, `getOpenLocations`, `getNearestLocations`, `getFormattedAddress` |
| `useOfferData()` | `offers.json` | `getAllOffers`, `getAvailableOffers`, `getProgressOffers`, `getActiveOffers` |
| `useUserData()` | `user.json` | `getUser`, `getRewardsPoints`, `getRewardsTier`, `getRecentOrders`, `getDefaultPayment` |
| `useNearestLocation()` | `wendys-locations.json` (lazy import) | `request`, `resolveByZip`, returns nearest store + state machine |

State contexts (mutable runtime state) are listed above. Keep them separate.

**Data quirks (validated via tests):**
- Some products are **cross-listed** across categories with different IDs (e.g., Baconator is `265` in Everyday Value and `2390` in Hamburgers). The ingredient map uses the primary ID. `getProductById` returns the first match found.
- Ingredients are keyed by **slug** in the JSON (`potato_bun`) but referenced by **ID** in `productIngredientMap` (`ing_001`). The hook builds a reverse lookup automatically — always pass IDs.
- `addOns` and `addOnGroups` objects have a `_note` key (string) that is not data — the hook filters these out.
- User recent orders use `location` (not `locationId`).
- Location phone field is `phoneNumber` (not `phone`).

**Types:** All data types are defined in `src/data/types.ts`. Import types from there, not from JSON files.

**Data scale:** 22 categories (14 all-day + 9 breakfast), 180 products (incl. 6 Jalapeño LTOs), 29 combos, 28 ingredients, 16 add-ons, 5 add-on groups, 5 mock locations + 5,629 real (lazy-loaded), 9 offers, 21 rewards store items, 1 user with 3 recent orders.

## Asset Locations

| Asset | Path | Notes |
|---|---|---|
| PRD (full spec) | `assets/wendys-prototype-prd.md` | Planning doc — Figma overrides when they differ |
| Menu System Requirements | `assets/menu-system-requirements.md` | **SPP module system** + product-type matrix — source of truth for order flow |
| Design tokens (light CSS) | `assets/tokens/css/tokens-light.css` → copied to `src/styles/tokens.css` | Source of truth for styling |
| Design tokens (dark CSS) | `assets/tokens/css/tokens.css` | Dark theme — NOT currently used |
| Design tokens (DTCG JSON) | `assets/tokens/dtcg/` | Reference only |
| Design tokens (React/TS) | `assets/tokens/react/` | Reference only — incomplete |
| Wendys Fresh font | `assets/fonts/wendys-fresh/WOFF2/` → `public/fonts/wendys-fresh/` | Display (6 weights) |
| Roboto font | `assets/fonts/roboto/woff/` → `public/fonts/roboto/` | Body/UI (3 weights) |
| SVG icons (mono) | `assets/icons/` → `public/icons/` | 134+ icons, kebab-case naming |
| SVG icons (multi-color) | Same folder | `rewards-simple.svg`, `bag-red.svg`, `*-multi-color.svg` |
| Images (logos) | `assets/images/` → `public/images/` | Wendy's wave, Rewards logo, bag icon |
| Product images | `assets/product-images/` → `public/images/product-images/` | 181 food photos, named `food_{category}_{slug}_{id}.{png\|webp}` |
| Jalapeño LTO source images | `assets/jalapeno-ltos/` (numeric Wendy's IDs) | Already copied + renamed for `lto_9001`–`lto_9006` |
| Category images | `assets/category-images/` → `public/images/category-images/` | 14 thumbnails, `category_{name}_{id}.png` |
| Content card images | `assets/images/content-cards/` → `public/images/content-cards/` | Large + small placeholder banners |
| Splash animation | `assets/splash-screen-animation/splash.json` → `src/animations/lottie/` | Lottie JSON |
| Voice ordering animation | `assets/voice-animation.json` → `src/animations/lottie/voice-animation.json` | Lottie JSON for `/voice` |
| Voice-ordering data (vendored) | `src/features/voice-ordering/data/` | `system_prompt.md`, `semantic_menu_v3.json`, `wendys-locations.json` (5,629 stores) |
| Voice-ordering data pipeline | `../Menu Images/voice-ordering/` (sibling repo) | NOT in this repo. Run via `npm run refresh-voice-data`. |

## Voice Ordering POC

AI-powered voice ordering, isolated under `src/features/voice-ordering/`. The only shared boundary is `BagContext`. **See [`src/features/voice-ordering/README.md`](../src/features/voice-ordering/README.md)** for the authoritative spec, file map, and architecture decisions.

## MCP Integrations

This project uses Figma MCP servers for design inspection:

- **claude.ai Figma** — official Figma MCP for reading designs, screenshots, Code Connect
- **figma-console** — Figma Console MCP for direct plugin API access, component search, design execution

When using figma-console:
- Use `figma_get_selection` to inspect what Adam has selected
- Use `figma_execute` with `figma.getNodeByIdAsync()` (not `getNodeById`) for async API
- Use `node.getMainComponentAsync()` (not `node.mainComponent`) for instance lookups
- Always call `figma_search_components` at the start of each session (node IDs are session-specific)
