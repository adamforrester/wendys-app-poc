# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is a living document — update it as decisions are made and lessons are learned.

## Project Overview

Wendy's mobile app prototype — a web-based interactive prototype for exploring and validating UX/UI ideas, independent of the production Flutter app. Purpose is rapid UX/UI iteration and stakeholder demos.

The canonical specification is `/assets/wendys-prototype-prd.md` — read it before building anything new.

## Tech Stack

- **React 19** (functional components + hooks) with **TypeScript**
- **Vite 8** — build tool and dev server
- **Tailwind CSS v4** — CSS-first config via `@theme` directive (no `tailwind.config.js`)
- **Framer Motion** — all animations and micro-interactions
- **Lottie React** — designer-authored animations (splash, success states)
- **React Router DOM** — client-side routing (tab-based root nav, stack-based within tabs)
- **React Context + useReducer** — state management (no Redux/Zustand)
- **Mapbox GL JS** (`react-map-gl`) — location map (free tier); Leaflet + OSM as fallback
- **Storybook 10** — component QA and isolated development
- Mobile viewport: **390×844** logical pixels (iPhone 13/14), rendered in a device frame

## Commands

```bash
npm run dev          # Vite dev server on :5173
npm run storybook    # Storybook on :6006
npm run build        # Production build (tsc + vite build)
```

---

## Critical Rules

### Figma Is the Source of Truth

**Always follow Figma specs over the PRD when they differ.** The PRD is a planning document; Figma reflects the actual design decisions. When inspecting a Figma component:
1. Use `figma_get_selection` or `figma_execute` to pull variant properties, layout, and colors
2. Extract `boundVariables` to get token names — use those, not raw color values
3. Take a screenshot to visually verify your understanding
4. If something is ambiguous or undefined in Figma, **ask Adam before proceeding** — do not make design decisions autonomously

### Token-Only Styling — No Hardcoded Values

Every color, spacing, radius, border-width, and shadow must reference design tokens via CSS custom properties. Never hardcode hex values, pixel values for spacing, or rgb() colors in components.

- **Colors:** Use `var(--color-*)` from `tokens.css` or Tailwind utilities mapped in `@theme`
- **Spacing:** Use `p-wds-16`, `gap-wds-12`, etc. (mapped from `--space-*` tokens)
- **Radii:** Use `rounded-wds-m`, `rounded-wds-full`, etc.
- **Shadows:** Use `shadow-wds-s`, `shadow-wds-m`, etc.

If a value doesn't exist in the token system, flag it rather than hardcoding.

### Tailwind v4 — No Dynamic Class Interpolation

**Tailwind v4's JIT scanner requires full static class strings in source code.** Template literals with interpolated segments (e.g., `` `bg-[var(--color-bg-brand-${brand}-default)]` ``) will NOT be detected and will produce no CSS output.

Instead, use explicit conditional returns with full static strings:
```typescript
// ✅ CORRECT — full strings visible to scanner
if (cs === 'primary') return 'bg-[var(--color-bg-brand-primary-default)]';
return 'bg-[var(--color-bg-brand-secondary-default)]';

// ❌ WRONG — scanner can't resolve the interpolation
return `bg-[var(--color-bg-brand-${brand}-default)]`;
```

This applies everywhere: component style maps, conditional classes, any Tailwind utility.

### Token File: Light Theme Only

The active token file is `src/styles/tokens.css`, sourced from `assets/tokens/css/tokens-light.css` (light theme). The original `assets/tokens/css/tokens.css` is the **dark theme** and should NOT be used. Token variable names are **unprefixed** (e.g., `--color-blue-600`, NOT `--wds-color-blue-600`).

### Update Documentation After Every Component

After completing a new component or making significant changes:
1. **Update `CLAUDE.md`** — add to Components Built count, add component conventions if there are non-obvious patterns
2. **Update `COMPONENTS.md`** — add component entry with location, use cases, and key props
3. **Copy new assets** — if new images/icons were added, ensure they're in `public/` with kebab-case naming
4. **Note data quirks** — if you discovered data issues during component work, document them in the data hooks section

---

## Asset Locations

| Asset | Path | Notes |
|---|---|---|
| PRD (full spec) | `assets/wendys-prototype-prd.md` | Planning doc — Figma overrides when they differ |
| Design tokens (light CSS) | `assets/tokens/css/tokens-light.css` → copied to `src/styles/tokens.css` | Source of truth for styling |
| Design tokens (dark CSS) | `assets/tokens/css/tokens.css` | Dark theme — NOT currently used |
| Design tokens (DTCG JSON) | `assets/tokens/dtcg/` | Reference only |
| Design tokens (React/TS) | `assets/tokens/react/` | Reference only — incomplete (borders/gradients empty) |
| Wendys Fresh font | `assets/fonts/wendys-fresh/WOFF2/` → `public/fonts/wendys-fresh/` | Headlines/display (6 weights) |
| Roboto font | `assets/fonts/roboto/woff/` → `public/fonts/roboto/` | Body/UI text (3 weights) |
| SVG icons (mono) | `assets/icons/` → `public/icons/` | 134+ icons, kebab-case naming |
| SVG icons (multi-color) | Same folder | `rewards-simple.svg`, `bag-red.svg`, `*-multi-color.svg` |
| Images (logos) | `assets/images/` → `public/images/` | Wendy's wave, Rewards logo, bag icon |
| Product images | `assets/product-images/` → `public/images/product-images/` | 175 food photos, named `food_{category}_{name}_{id}.png` |
| Category images | `assets/category-images/` → `public/images/category-images/` | 14 category thumbnails, named `category_{name}_{id}.png` |
| Content card images | `assets/images/content-cards/` → `public/images/content-cards/` | Large + small placeholder banners |
| Splash animation | `assets/splash-screen-animation/splash.json` → `src/animations/lottie/` | Lottie JSON |

---

## Architecture

### Five Global Contexts

| Context | Purpose |
|---|---|
| `AuthContext` | Auth state, user profile, rewards points. **Defaults to authenticated** with mock user from `user.json` (Alex Johnson, 2,450 points, Gold tier). |
| `LocationContext` | Selected restaurant, fulfillment method, GPS permission state |
| `BagContext` | Cart items, promo code, location confirmation gate |
| `DaypartContext` | Breakfast/Lunch/Dinner/Late Night |
| `FeatureFlagsContext` | Runtime A/B flag toggles from `src/config/featureFlags.ts` |

### Routing Structure

- **Root tabs:** Home (`/`), Offers (`/offers`), Order (`/order`), Earn (`/earn`), Account (`/account`)
- **Stack navigation** within Order tab: Location → Menu → Category → PLP → SPP → Bag → Checkout → Confirmation
- Each screen renders its own `<TopAppBar>` with the appropriate configuration
- `<BottomTabBar>` is rendered by `<AppShell>` and persists across all root screens

### Device Frame & Status Bar

- `DeviceFrame` renders the 390×844 phone shell with rounded corners and dark bezel
- `StatusBar` is a **global overlay** (absolute positioned, pointer-events-none) with Dynamic Island notch, time, and indicators
- `TopAppBar` includes a 54px safe area spacer at top so its background extends behind the transparent status bar
- Status bar supports `light` (white text, for dark/colored backgrounds) and `dark` (black text, for light backgrounds) modes

---

## Component Reference

**See `COMPONENTS.md`** for the full component registry with props, use cases, screen composition patterns, and spacing conventions. Always consult it when building screens.

---

## Component Conventions

### Icon Rendering

Two approaches depending on icon type:

1. **Mono icons** — CSS `mask-image` with `bg-current` so the icon inherits `currentColor` from the parent text color. This is the default.
2. **Multi-color icons** — Rendered as `<img>` tags to preserve original SVG fill colors. Use `leftIconMultiColor` / `rightIconMultiColor` props on Button, or render `<img>` directly.

Icons that are multi-color: `rewards-simple.svg`, `bag-red.svg`, `letter-mark-coin-filled.svg`, `letter-mark-coin-outlined.svg`, `*-multi-color.svg`

### Button Component

- `colorScheme` prop: `'secondary'` (teal, default per Figma) or `'primary'` (red)
- Buttons use **brand secondary (teal)** as the default — Figma is the source of truth, not the PRD which mentions red
- `elevated` is a boolean prop, not a separate type — cleaner than doubling variant options
- Loading state keeps enabled colors (not disabled colors) and blocks interaction via `pointer-events-none`
- Small/noPadding variants skip the 48px outer tap target wrapper for compact contexts (e.g., TopAppBar trailing buttons)

### TopAppBar Component

- **Screen-owned, not shell-owned** — each screen renders its own TopAppBar with specific configuration
- `titleWeight`: `'black'` (800, default for root screens) or `'semibold'` (600, for inner screens)
- Root screen configurations are defined in each screen file
- The `showBag` prop shows the bag button, but `BagButton` internally returns `null` when bag count is 0
- `pointsLoading` shows a shimmer animation in place of the points value

### BottomTabBar Component

- `variant`: `'current'` (Wendy's custom with floating Order button) or `'simple'` (flat tab bar for future experiments)
- Center Order button has 3 states: big teal circle (Home tab), teal icon (Order tab active), gray icon (other tabs)
- The white bar always has the curved notch cutout for the center button
- Auth/unauth switches tab 4 between "Earn" (QR scanner) and "Find" (location)

### BottomSheet Component

- Uses Framer Motion for drag/spring physics — `springSheet` preset
- Height can be percentage (`'50%'`) or fixed pixels (`300`)
- `scrollable` prop enables independent content scrolling
- Drag handle is 40×4px dark pill, centered in 36px header
- Dismisses on scrim tap or drag-down (>100px or fast flick)

### ListRow Component

- Most complex/flexible component — 229 Figma variants, composed from Label, HelperMessage, Checkbox, RadioButton, Toggle
- Two styles: `standard` (full-width with divider) and `rounded` (bordered, padded)
- Validation on rounded style changes border color + auto-shows helper message
- Leading: none, icon (40px), image (56px thumbnail)
- Trailing: none, checkbox, radio, toggle, icon (default: caret-right) + optional metadata text
- For token-driven colors, use **inline styles** instead of Tailwind arbitrary values (avoids JIT scanning issues)

### Card Components

- **ContentCard:** Simple image container (large: 358×224, small: 358×144), 8px radius, 1px border, shimmer loading
- **CategoryCard:** `width: 100%` (fills grid cell), 96×96 centered image + title below (wraps, no truncation), 8px radius, no border, fallback on error
- **MenuCard:** `width: 100%` (fills grid cell), `aspect-ratio: 1/1` image, product title + subtitle (price) + caption (calories), optional docked Label. Added `caption` prop for calories line below subtitle.
- Cards in 2-up grids use CSS Grid `repeat(2, 1fr)` for equal column widths
- All cards have `fallbackSrc` prop for swappable fallback images (Wendy's W logo default)

### ListRow Component Updates

- Leading icon size is **24×24** (not 40×40). Container remains for tap target.
- Added `leadingIconColor` prop — pass a token color to override the default gray (e.g., `var(--color-icon-brand-primary-default)` for red).
- Added `leadingIconMultiColor` prop — renders the icon as `<img>` instead of CSS mask to preserve multi-color SVG fills.
- Added `metadataColor` and `metadataWeight` props — style the trailing metadata text (e.g., blue bold "Edit").
- Headline text **wraps** (no longer truncates).
- Rounded style bottom padding reduced from `pb-wds-16` to `pb-wds-8`.

### HeroImage Component

- Centered product image (320×320) on white background
- `extraPadding` prop adds 56px top padding for SPP where TransparentTopBar overlays
- Without `extraPadding`: 320px tall. With: 376px tall.
- Use `extraPadding` on SPP, omit on Reward/Offer detail pages

### MediumTopAppBar Component

- **White background** (not red like standard TopAppBar)
- Product title: Wendys Fresh 23px, fontWeight 800 (XBold), brand primary red, **wraps** to multiple lines
- Subtitle: Roboto 18px, fontWeight 700 (Bold), primary text color
- Back arrow + favorite heart buttons
- **Not self-positioning** — parent controls visibility via absolute positioning + transform. This avoids the component taking up layout space when hidden.

### TransparentTopBar Component

- Absolutely positioned overlay — no background, sits over HeroImage
- `leadingIcon`: `'back'` (arrow-left) or `'close'` (X for combo dialogs)
- `showFavorite` defaults to `false` — favoriting is handled in MediumTopAppBar on scroll
- `pointerEvents: none` on container, `auto` on button row

### IngredientTable Component

- Non-interactive nutrition facts table
- Rows with label (left, primary text) and value (right, secondary text)
- `indent` prop on rows for sub-items (e.g., Saturated Fat under Total Fat) — adds 40px left padding
- Roboto 14px for both label and value

### Feature Flags System

- Registry in `src/config/featureFlags.ts` — 14 flags with typed options + `flagMeta` for labels/descriptions
- Admin UI auto-generates toggles from the `flagMeta` registry — adding a new flag automatically creates its toggle in Developer Tools
- When building new features, always add a feature flag check from the start
- Current flags: addToBagTransition, comboBuilderStyle, locationSelectionLayout, splashAnimation, menuCategoryLayout, menuPLPLayout, sppLayout, bottomNavStyle, homeLocationComponent, buttonColorScheme, fallbackImage, postOrderSurprise, darkMode, loadingScenario

### SPP Architecture

- **Single modular shell** — each module renders conditionally based on product data
- Route: `/order/menu/:slug/:productId` — **outside AppShell** (no tab bar)
- TransparentTopBar overlays HeroImage; MediumTopAppBar slides in on scroll (absolute positioned)
- OrderBar absolutely positioned at bottom
- Ingredient images mapped via `ingredientImageMap` / `addOnImageMap` in the screen file (not in data)
- Add-on modifier types determined by `getAddOnModifierType()` helper — maps add-on names to counter/chips/none
- Daypart-aware: category page and PLP switch between all-day (14) and breakfast (9) category sets

### Pattern: Inline Styles for Token Colors

When a component needs token-driven colors that don't require hover/focus/responsive variants, use **inline `style`** with `var()` references instead of Tailwind arbitrary value classes. This avoids the JIT scanning issue entirely.

```tsx
// ✅ Use inline styles for static token colors
style={{ color: 'var(--color-text-primary-default)' }}

// ❌ Avoid — may not be detected by Tailwind scanner
className="text-[var(--color-text-primary-default)]"
```

Reserve Tailwind classes for colors that need hover/active states or are pre-registered in `@theme`.

---

## Wendy's Design Language

Reference this when building new components or screens to maintain brand consistency.

### Typography

Two font families:
- **Wendys Fresh** (`font-display`) — headlines, titles, buttons. Distinctive hand-lettered feel.
- **Roboto** (`font-body`) — body text, UI labels, captions. Clean and legible.

Key type styles (from Figma):
| Style | Font | Size/Leading | Weight | Usage |
|---|---|---|---|---|
| MegaXL–MegaS | Wendys Fresh | 83/96 → 46/56 | 800 (XBold) | Hero text, large promos |
| DisplayL–DisplayS | Wendys Fresh | 36/44 → 26/32 | 800 or 600 | Section headers |
| TitleL | Wendys Fresh | 23/32 | 800 (Black) or 600 (SemiBold) | App bar titles |
| TitleM–Title3XS | Wendys Fresh | 20/24 → 12/16 | Various | Subheadings |
| _ButtonL | Wendys Fresh | 18/24 | 700 (Bold) | Large buttons |
| _ButtonS | Wendys Fresh | 14/20 | 700 (Bold) | Small buttons |
| BodyL–BodyS | Roboto | 18/24 → 14/20 | 400 or 700 | Body copy |
| CaptionL–CaptionS | Roboto | 12/16 → 11/16 | 400, 500, or 900 | Small labels |

### Color Usage

- **Brand primary (red):** App bar backgrounds, primary CTAs (when using `colorScheme="primary"`), brand accents
- **Brand secondary (teal/blue-600):** Default button color, interactive elements, Order button, links
- **Brand tertiary (crimson):** Accent uses
- **Text on brand:** White (`text/onBrand/default`) — for text on red or teal backgrounds
- **Disabled:** Gray backgrounds and text — consistent across all component types

### Spacing

4px base grid. Common values: 4, 8, 12, 16, 24, 32, 48. Use token-mapped utilities (`p-wds-16`, `gap-wds-8`).

### Elevation

5-step shadow scale (xs → xl). Use `shadow-wds-s` for buttons, `shadow-wds-m` for hover, `shadow-wds-xl` for device frame.

### Border Radius

All interactive pill-shaped elements use `rounded-wds-full` (9999px). Cards use `rounded-wds-l` (12px) or `rounded-wds-m` (8px).

---

## Design Decision Framework

When building NEW screens or features without a direct Figma reference, follow these rules to maintain brand consistency.

### Component Selection

1. **Always use existing components** — never create custom one-off UI when an existing component handles the pattern
2. **Check COMPONENTS.md** for the right component for each use case
3. **Compose screens from sections** — each section has a SectionHeader + content pattern
4. If no existing component fits, **ask Adam before creating a new one**

### Typography Decisions

| Content type | Style to use |
|---|---|
| Screen titles (root tabs) | TitleL/Black (23/32, weight 800) via TopAppBar `titleWeight="black"` |
| Screen titles (inner/stack) | TitleL/SemiBold (23/32, weight 600) via TopAppBar `titleWeight="semibold"` |
| Section headers | DisplayS/Black (26/32) for large, TitleS/Black (18/24) for small — via SectionHeader |
| Card titles, list row headlines | TitleXS/SemiBold (16/20, weight 600) |
| Body text, descriptions | BodyS/Regular (14/20) or BodyM/Regular (16/24) |
| Prices, metadata | BodyL/Bold (18/24) for prominent, CaptionL (12/16) for secondary |
| Labels, badges, captions | CaptionL/Black (12/16, weight 900) |
| Buttons | _ButtonL/Bold (18/24) or _ButtonS/Bold (14/20) — handled by Button component |

### Color Decisions

| Context | Token to use |
|---|---|
| Primary text on light bg | `text/primary/default` (gray-1100) |
| Secondary/supporting text | `text/secondary/default` (gray-800) |
| Text on red/teal backgrounds | `text/onBrand/default` (white) |
| Product names on SPP | `text/brand/primary/default` (RED) |
| Interactive text (links, CTAs) | `text/brand/secondary/default` (teal) |
| Disabled text | `text/disabled/default` (gray-600) |
| Error/warning text | `text/validation/critical` (red) |
| Success text | `text/validation/positive` (green) |
| Page backgrounds | `bg/primary/default` (white) for content, `#f5f5f5` for app background |
| Card backgrounds | `bg/primary/default` (white) |
| Dividers/separators | `border/tertiary/default` (gray-200) |

### Layout Decisions

| Pattern | Spacing |
|---|---|
| Screen horizontal padding | 16px (`px-wds-16`) |
| Between major sections | Use SectionHeader (has 24px top/bottom padding built in) |
| Card grid | 2-up, `gap-wds-12`, `align-items: stretch` |
| List items | Stack ListRow components (dividers built in) |
| Horizontal scroll | `gap-wds-12`, `overflow-x-auto`, content peeks off-screen |
| Bottom sticky CTA | Fixed at bottom with 16px padding, above tab bar |
| Modal/sheet content | `px-wds-16` inside BottomSheet |

### When There's No Figma Reference

1. **Look at similar screens** in the app for precedent
2. **Reuse existing patterns** — if the home screen has a section with SectionHeader + horizontal scroll, replicate that pattern
3. **Default to the simpler option** — fewer elements, more whitespace, standard components
4. **Use token values only** — even for spacing on new layouts, pick from the 4px grid (4, 8, 12, 16, 24, 32, 48)
5. **Maintain hierarchy** — one primary action per screen (filled button), secondary actions use outline or text buttons
6. **When unsure, ask** — don't guess on brand-specific decisions (colors, special treatments, animations)

---

## Storybook Rules

1. **Every component gets a story file** in its directory: `ComponentName.stories.tsx`
2. **Required stories:** Playground (interactive args), key visual variants, all states
3. **Context providers in decorators:** Wrap with `MemoryRouter`, relevant Context providers. Use `SeedBag` pattern when bag items are needed.
4. **390px width constraint:** Use `<div style={{ width: 390 }}>` in decorators to match device width
5. **No full documentation** — stories are for QA and development, not publishing
6. **Mobile viewport addon** configured at 390×844 (`wendysMobile` viewport)

---

## Accessibility Rules

1. **Semantic HTML:** Use `<header>`, `<nav>`, `<main>`, `<button>`, `<h1>`–`<h6>` appropriately
2. **ARIA labels** on all interactive elements that lack visible text (icon buttons, icon-only actions)
3. **`aria-hidden="true"`** on decorative icons and images
4. **`role="tablist"` / `role="tab"`** on navigation bars with `aria-selected` state
5. **`aria-busy="true"`** on loading states
6. **Focus management:** Buttons must be keyboard-focusable. Use `<button>` elements, not `<div onClick>`
7. **Color contrast:** Text on brand backgrounds uses `text/onBrand` tokens (white on red/teal). Disabled states use dedicated disabled tokens.
8. **Truncation:** Long titles use `truncate` class to prevent layout overflow

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---|---|
| Using `var(--wds-color-*)` prefixed tokens | Tokens are unprefixed: `var(--color-*)` |
| Dynamic Tailwind class interpolation | Use full static strings with if/else |
| Using dark theme token file | Use `tokens-light.css` only |
| Hardcoding colors or spacing | Always use token references |
| Making design decisions without asking | Flag ambiguity, ask Adam |
| Setting `disabled` attribute on loading buttons | Use `pointer-events-none` + `aria-disabled` — keep enabled colors |
| Using `<img>` for mono icons in interactive elements | Use CSS mask-image for `currentColor` inheritance |
| Forgetting multi-color icon flag | `rewards-simple`, `bag-red`, `letter-mark-coin-*` need `multiColor` treatment |
| Adding `min-width` to noPadding text buttons | noPadding variants should shrink to content |
| Using Tailwind arbitrary values for token colors on non-interactive elements | Use inline `style={{ color: 'var(--color-*)' }}` instead — avoids JIT issues |
| Absolute positioning for checkbox/radio in ListRow | Use negative margins on wrapper div instead |
| Using `bg-[var(--color-*)]` for icon background color | Use inline `style={{ backgroundColor: 'var(--color-*)' }}` for MonoIcon |
| Forgetting to copy new assets to `public/` | Always copy from `assets/` to `public/` when new images/icons are added |
| Chip components not filling width in flex layouts | Chip uses `width: 100%` — wrap in flex container with `flex: 1 1 0` per chip |
| Using `inline-flex` on components that need to stretch | Use `flex` with `width: 100%` when component should fill parent |
| TypeScript union narrowing errors in stories with mixed arrays | Define explicit interface and type the useState generic |

---

## MCP Integrations

This project uses Figma MCP servers for design inspection:
- **claude.ai Figma** — official Figma MCP for reading designs, screenshots, Code Connect
- **figma-console** — Figma Console MCP for direct plugin API access, component search, design execution

When using figma-console:
- Use `figma_get_selection` to inspect what Adam has selected
- Use `figma_execute` with `figma.getNodeByIdAsync()` (not `getNodeById`) for async API
- Use `node.getMainComponentAsync()` (not `node.mainComponent`) for instance lookups
- Always call `figma_search_components` at the start of each session (node IDs are session-specific)

---

## Build Progress

### Components Built (35)
Button, TopAppBar, BottomTabBar, BottomSheet, Spinner, Label, HelperMessage, RadioButton, Checkbox, Toggle, ListRow, ContentCard, CategoryCard, MenuCard, DeviceFrame, StatusBar, BagButton, Tabs, SegmentedControl, Snackbar, SectionHeader, ProductHeader, ItemSelector, Chip, Counter, IconButton, OrderBar, IngredientCollapse, IngredientCard, OrderLocationCard, SplashScreen, IngredientTable, MediumTopAppBar, HeroImage, TransparentTopBar

### Remaining Components
SearchBar, EmptyState, StatusBadge, LocationMap, OfferTile

### Data Hooks (read-only data access)

| Hook | Source | Key Methods |
|---|---|---|
| `useMenuData()` | `menu.json` | `getAllCategories`, `getProductById`, `getProductBySlug`, `getIngredientsForProduct`, `getAddOnGroupsForProduct`, `getProductImagePath` |
| `useLocationData()` | `locations.json` | `getAllLocations`, `getLocationById`, `getOpenLocations`, `getNearestLocations`, `getFormattedAddress` |
| `useOfferData()` | `offers.json` | `getAllOffers`, `getAvailableOffers`, `getProgressOffers`, `getActiveOffers` |
| `useUserData()` | `user.json` | `getUser`, `getRewardsPoints`, `getRewardsTier`, `getRecentOrders`, `getDefaultPayment` |

**Data quirks (validated via tests):**
- Some products are **cross-listed** across categories with different IDs (e.g., Baconator is `265` in Everyday Value and `2390` in Hamburgers). The ingredient map uses the primary ID. `getProductById` returns the first match found.
- Ingredients are keyed by **slug** in the JSON (`potato_bun`) but referenced by **ID** in `productIngredientMap` (`ing_001`). The `useMenuData` hook builds a reverse lookup automatically — always use ingredient IDs when calling hook methods.
- `addOns` and `addOnGroups` objects have a `_note` key (string) that is not data — the hook filters these out.
- User recent orders use `location` (not `locationId`) as the field name.
- Location phone field is `phoneNumber` (not `phone`).

**Data scale:** 21 categories (14 all-day + 8 breakfast, with overlap on coffee/give-something-back), ~160 products, 29 combos, 24 ingredients, 16 add-ons, 5 add-on groups, 5 locations, 9 offers (with `isForYou` and `deliveryEligible` flags), 21 rewards store items, 1 user with 3 recent orders.

**Data hooks vs. state contexts:** Data hooks (`useMenuData`, etc.) provide read-only access to static JSON. State contexts (`useAuth`, `useBag`, `useLocation`, etc.) manage mutable runtime state. Keep them separate.

**Types:** All data types are defined in `src/data/types.ts`. Import types from there, not from JSON files.

### Key Reference Docs

| Document | Location | Use for |
|---|---|---|
| PRD | `assets/wendys-prototype-prd-v2.md` | Overall architecture, build sequence, app shell |
| Menu System Requirements | `assets/menu-system-requirements.md` | **SPP module system**, ingredient tiles, modifier types, combo wizards, product type matrix — THE source of truth for order flow |
| Data Architecture | `assets/data/data-architecture.md` | JSON schemas, relationships, hook patterns |

### Build Priority (from PRD)
1. ~~**Foundation:** Scaffolding, tokens, core components~~ — **DONE**
2. **Order flow:** ~~Location Selection → Menu Categories → PLP → SPP~~ (Phase 1 DONE) → Bag → Checkout → Confirmation
3. ~~**Home & Auth:** Home screen (unauth/auth variants), Login~~ — Home (auth) DONE, Offers DONE
4. **Offers & Polish:** ~~Offers list~~, edge cases, empty/error/loading states

### Screens Built (9)
- **Splash Screen** — cameo logo → Lottie animation → fade to app (configurable timing, swappable animation)
- **Home Screen (auth)** — hero banner, offers section with real data, privacy policy link. Sticky TopAppBar.
- **Offers Screen** — Offers tab (segmented control, promo code button, available/unavailable/redeemed sections) + Rewards tab (2-up card grid with 21 items sorted by points, View History button, Learn More section)
- **Order Screen** — Mapbox map, BottomSheet with OrderLocationCards, Pickup/Delivery segmented control, search
- **Menu Category Screen** (`/order/menu`) — daypart-aware category grid (14 all-day, 9 breakfast), quick action icons (Recents/Favorites/Rewards), pickup location + offer applied ListRows
- **Menu Product List (PLP)** (`/order/menu/:slug`) — scrollable category tabs with swipe, 2-up MenuCard grid with price + calories, daypart-aware tab sets
- **Single Product Page (SPP)** (`/order/menu/:slug/:productId`) — modular shell: TransparentTopBar → HeroImage → ProductHeader → Make it a Combo → What's On It ingredient tiles → Add Extras with counters/chips → Nutrition/Ingredients tabs → sticky OrderBar. MediumTopAppBar slides in on scroll. Full screen (no tab bar).
- **Account Screen** (`/account`) — red hero with cameo logo + greeting, 7 ListRows (Mobile Pay, Favorites, History, Settings, Privacy, Contact Us, Developer Tools)
- **Developer Tools Screen** (`/account/dev-tools`) — 14 feature flags with auto-generated toggles from registry, state controls (auth, daypart, location, fulfillment, bag), session reset, current state JSON dump

## Open Questions (from PRD)

See `assets/wendys-prototype-prd.md` § 8 for the full list. Key unresolved items:
- Fulfillment method — selected at location screen or later?
- PLP "Add to Bag" on simple items — on card or always through SPP? (Currently always through SPP)
- ~~Breakfast category — daypart-dependent or always visible?~~ — **RESOLVED:** daypart-dependent. Breakfast daypart shows 9 breakfast categories, all others show 14 all-day categories.
- Location change after items in bag — clear, keep, or warn?
- Mapbox access token — Adam to create free-tier account when ready
