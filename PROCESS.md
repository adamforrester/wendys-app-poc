# Process Overview — Wendy's Mobile App Prototype

**Project:** Web-based interactive prototype of the Wendy's mobile ordering app
**Team:** Adam Forrester (VML, Design/UX Lead) + Claude (AI Planning & Requirements, via Claude.ai) + Claude Code (AI Development Agent)
**Started:** April 1, 2026
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Storybook

---

## What We Built

A functional mobile app prototype rendered at 390×844 (iPhone 13/14) in a device frame, featuring:
- 35+ components in a design system library with Storybook stories
- 9 functioning screens across the full order flow + account
- Splash screen with Lottie animation
- Real data layer with 160+ products across 21 categories, 24 ingredients, 9 offers, 5 locations
- Mapbox integration for location selection
- Full design token system sourced from Figma
- Complete E2E order flow: Location → Menu Categories → PLP → SPP (Phase 1)
- Developer tools with 14 feature flags for A/B testing
- Daypart-aware menus (breakfast vs lunch/dinner categories)

---

## Two-Track Workflow

This project ran on two parallel tracks that fed into each other:

### Track 1: Planning, Requirements & Data (Claude.ai)
Adam worked with Claude in Claude.ai to plan the prototype, define architecture, capture production app patterns through screenshot analysis, and build the data layer. This track produced the foundational documents and data files that the development agent consumed.

### Track 2: Development (Claude Code)
Claude Code consumed the documents and data from Track 1 and built the actual prototype — scaffolding, components, screens, and data integration.

The two tracks ran concurrently. Adam would capture screenshots and refine requirements in Claude.ai while Claude Code was building components from Figma specs. Documents were handed off between tracks as they were completed.

---

## Track 1: Planning & Requirements (Claude.ai)

### Phase 0: Concept & PRD (Day 1)

**Goal:** Define what we're building, why, and how.

1. **Initial concept discussion.** Adam proposed building a web-based prototype of the Wendy's mobile app for UX exploration, independent of the production Flutter codebase. Evaluated framework options — React was the clear winner for speed, web-viewability, and team skill alignment (Next.js web ordering platform is also React).

2. **Scoped the prototype.** Defined the 5 root screens (Home, Offers, Order, Earn, Account), prioritized the E2E order flow as the primary focus, and agreed on pickup-only (no delivery for v1). Made key scoping decisions through interactive Q&A:
   - Menu data: realistic structure with simplified item count
   - Customization depth: combo builder + simplified ingredients
   - Checkout endpoint: through a mock confirmation screen

3. **Authored the PRD** (`wendys-prototype-prd.md`). Comprehensive document covering:
   - Technical architecture (React, Tailwind, Framer Motion, Lottie, Mapbox, Storybook)
   - State management (React Context + useReducer)
   - 21-step phased build sequence across 4 phases
   - 15+ component specifications with priority tiers
   - Detailed screen requirements for all order flow screens
   - Mock data architecture with JSON schemas
   - Claude Code agent handoff instructions with file structure and quality expectations

4. **Defined the versioning and experimentation system.** Git branching for flow-level experiments (`experiment/[area]/[description]`) + feature flags (`featureFlags.ts`) for component-level A/B variations. This was identified as a core requirement — the prototype exists to test multiple versions of flows, not just build one.

5. **Designed the prototype settings panel.** A floating action button (FAB) with a slide-up panel for toggling auth state, daypart, location services, feature flags, and session reset. Wired to React Context so toggles re-render the app instantly.

### Phase 0.5: Data Architecture & Menu Data (Days 1-3)

**Goal:** Build a realistic, structured data layer from real product information.

1. **Parsed 174 product image filenames** from a previous image scraping project. The filenames followed a clean `food_[category]_[product-name]_[product-id].png` convention, giving us category names, product names, and unique IDs for free. Extracted 157 unique products across 21 categories.

2. **Generated seed data files:**
   - `menu.json` — 157 products across 21 categories with realistic pricing (key items like Baconator at $8.99 hardcoded, rest generated from category-appropriate ranges), calorie estimates, daypart tags, and image filename references
   - `ingredients.json` — relational ingredient/modifier model with 17 initial ingredients, 4 modifier types, per-product ingredient mappings, and add-on groups
   - `locations.json` — 5 mock locations in Columbus, OH (Wendy's HQ city) with real-ish coordinates for Mapbox
   - `offers.json` — 7 offers covering all 4 eligibility states (available, progress, unavailable, redeemed)
   - `user.json` — mock authenticated user with Gold tier rewards, payment methods, and 3 recent orders referencing real product/location IDs

3. **Authored the data architecture doc** (`data-architecture.md`). Defined the relational data model, the hook-based access pattern (`useMenuData()`, `useLocationData()`, etc.), and the ingredient/modifier system including the "What's On It" vs "Add Extras" distinction.

4. **Iterated the ingredient model multiple times** based on emerging screenshot evidence:
   - Added the add-extras system (initially missing — Adam caught that the real app has a separate "Add Extras" section below ingredients)
   - Added add-on groups by product type (burger, chicken, breakfast, salad, etc.)
   - Added `hasEdit` flag per ingredient for tile Edit link control
   - Added `ingredientEditOverrides` for per-product hasEdit overrides (discovered when bacon had Edit on croissant but not on burger)
   - Added `modifierType` field (amount-pills, quantity-stepper, toggle-only) after capturing the full modifier interaction system
   - Added free add-extras support (`price: 0`, `isFree: true`) after discovering Swiss Cheese Sauce on the croissant
   - Added per-product add-extras for Frosty items (not group-based)

### Phase 0.75: Production App Screenshot Documentation (Days 3-6)

**Goal:** Capture every product type, interaction pattern, and UX flow from the production Wendy's app.

This was the most intensive documentation effort. Adam systematically screenshotted every product type in the production app across breakfast and lunch dayparts, feeding them to Claude in Claude.ai for analysis. Each screenshot session revealed new patterns, corrected assumptions, and tightened the data model.

**Products documented (30+ unique SPP screenshots):**
- **Burgers:** Dave's Single (full ingredient capture — 10 tiles, all modifier states)
- **Chicken:** Spicy Chicken Sandwich (revealed free add-extras for ketchup/mustard/onion)
- **Breakfast sandwiches:** Maple Bacon Chicken Croissant (hasEdit override discovery), Honey Buddy Chicken Biscuit
- **Breakfast burrito:** Breakfast Burrito Bacon (display-only tiles — no customization)
- **Nuggets:** 10 PC Spicy Chicken Nuggets (pre-SPP sauce wizard, split calorie display, included accompaniment card)
- **Tenders:** 4 PC Tenders (confirmed same pattern as nuggets)
- **Salads:** Cobb Salad (dressing as accompaniment, unique add-extras)
- **Sides:** Small Seasoned Potatoes (size selector, sauce-only extras)
- **Drinks:** Regular Hot Coffee (sweetener/syrup add-extras), Caramel Cold Brew (What's On It + size, no extras), Coca-Cola Freestyle (brand grid → flavor grid → inline flavor selector — bespoke flow)
- **Frosty:** Classic Chocolate (4 sizes including Junior), Frosty Swirl (size + 1 add-extra), Frosty Fusion (size + What's On It tiles + per-product add-extras with variable pricing)
- **Bakery:** Chocolate Chunk Cookie (bare minimum SPP), Cinnabon Pull-Apart (same item in both What's On It and Add Extras)
- **Chili:** Family Chili (desktop layout captured, free add-extras with quantity steppers)
- **Baked potato:** rich add-extras with mixed free/paid and mixed modifier types
- **Kids meals:** Kids Hamburger (4 component cards including toy), Kids Nuggets (side selection as circular cards)
- **Value/deals:** Biggie Bundle (pick-from-pool wizard), Jr. Cheeseburger Biggie Bag (3-step wizard: nugget → sauce → drink)
- **Non-food:** Frosty Key Tag (bare minimum SPP, 0 cal)

**Combo wizards documented (8 configurations):**
- Baconator Combo (1 step: drink only)
- Dave's Combo (2 steps: modifier → drink, circular cards with price deltas)
- Breakfast Combo (2 steps: side → drink)
- 10 PC Nugget Combo (3 steps: modifier → sauce → drink)
- Biggie Bundle (2 steps: pick 1st → pick 2nd from same pool)
- Biggie Bag (3 steps: nugget type → sauce → drink)
- Kids Meal (2+ steps: side as circular cards → drink)
- Chicken Sandwich Combo (modifier → drink, inferred)

**Interaction patterns documented:**
- "Your Changes" module — change pills with × dismiss, Reset link, tile state updates (gray bg + empty circle for removed)
- Modifier bottom sheet ("Quantity" title) — 4-pill variant (none/lite/reg/xtra) and quantity stepper variant (– N +)
- Add Extras expanded states — 3-pill inline (lite/reg/xtra) and quantity stepper inline
- Combo size selector — "Med ▼" opens bottom sheet with circular image cards + absolute prices
- Snackbar add-to-bag confirmation
- Location confirmation gate on first bag entry
- Offers screen — REWARDS header, Offers/Rewards segmented toggle, "For You" badge, View History

**Key architectural insight:** The SPP is NOT a set of fixed product-type configurations. It's a **single modular shell** where 14 independent modules render conditionally based on the product's data. Any combination can appear. This was confirmed by comparing Hot Coffee (size + Add Extras, no What's On It), Cold Brew (size + What's On It, no Add Extras), and Dave's Single (What's On It + Add Extras, no size).

### Phase 0.8: Menu System Requirements Doc (Day 6)

**Goal:** Consolidate all screenshot observations into a comprehensive handoff document.

Authored `menu-system-requirements.md` — the most detailed document in the project. 12 sections covering:
- 14 SPP modules in confirmed render order with conditional rendering rules
- 3 ingredient tile interaction modes (editable, removable, display-only)
- 3 modifier interaction types with exact UI patterns
- 6 wizard step types with UI pattern selection rules
- 4 bottom sheet patterns (list rows, circular cards, logo grid, quantity modifier)
- 20+ product types in a comprehensive configuration matrix
- Confirmed real pricing/calorie data for 30+ products
- PLP layout patterns with category tab configurations
- Offers screen structure
- **11 documented UX inconsistencies** — the evidence base for rationalization proposals

### Phase 0.9: Admin UI Planning (Day 6)

**Goal:** Define a data management and prototype control interface.

Initial plan from Claude.ai proposed a full 7-tab admin UI at `/admin` with localStorage data migration and inline data editing. After evaluation by the development agent and discussion with Adam, this was **significantly descoped:**

- **Decided against** localStorage data migration, CMS/inline editing, separate /admin route, and FAB
- **Adopted instead:** Developer tools inside the Account tab, feature flags as the core mechanism, JSON file editing for data changes between sessions
- **Rationale:** Runtime toggles and A/B flags are the daily-use need; content editing is infrequent. The localStorage migration was high-risk/high-effort for low frequency use.

The final implementation: 14-flag registry with auto-generated toggles, state controls (auth, daypart, location, fulfillment), and session reset — all accessible from Account → Developer Tools.

---

## Track 2: Development (Claude Code)

### Phase 1: Foundation (Day 1)

**Goal:** Scaffold the project, establish patterns, and build confidence in the tooling.

1. **Started with the PRD.** Read the full product requirements document before writing any code. This set expectations for tech stack, architecture, and build priority.

2. **Design tokens first.** Imported Figma's CSS custom properties export, discovered it was the dark theme (wrong), got a corrected light theme export from Adam, then mapped tokens into Tailwind v4's `@theme` system. This created the foundation every component builds on.

3. **Typography from Figma MCP.** Used the Figma Console MCP to pull all 40 text styles with exact font sizes, weights, and line heights directly from Figma variables. No guessing.

4. **Font + asset setup.** Copied Wendy's Fresh (6 weights) and Roboto (3 weights) as WOFF2/WOFF, set up @font-face declarations, copied icons and images into the public directory.

5. **Context providers + routing.** Created 5 global contexts (Auth, Location, Bag, Daypart, FeatureFlags), set up React Router with tab-based navigation, built the DeviceFrame with iOS status bar overlay.

### Phase 2: Component Library (Days 1-3)

**Goal:** Build all reusable components before composing screens.

**Methodology — "Inspect, Plan, Build, Review" cycle:**

For each component:
1. **Adam selects the component in Figma** and tells Claude to inspect it
2. **Claude pulls specs via Figma MCP** — variant properties, layout, padding, colors (with token variable names), typography, children structure
3. **Claude presents a spec summary** with any questions or ambiguities
4. **Adam answers questions** and provides clarifications (e.g., "the closed state should show red text, not disabled gray")
5. **Claude builds the component** with Storybook stories
6. **Adam reviews in Storybook** and provides visual feedback from screenshots
7. **Iterate** — usually 1-3 rounds of fixes per component

**Key decisions made during this phase:**
- **Inline styles for token colors** instead of Tailwind arbitrary values (avoids JIT scanning issues)
- **`onPress` naming** for custom tap handlers (mobile convention), `onClick` for HTML-native Button
- **Screen-owned TopAppBar** — each screen configures its own TopAppBar instead of a global config
- **CSS mask-image for mono icons**, `<img>` for multi-color icons
- **One unified component** when Figma had separate variants (e.g., ItemSelector handles both product selection and pickup methods)

**Components built (in order):**
Button → TopAppBar → BottomTabBar → BottomSheet → Label → HelperMessage → RadioButton → Checkbox → Toggle → ListRow → ContentCard → CategoryCard → MenuCard → Tabs → SegmentedControl → Snackbar → SectionHeader → ProductHeader → ItemSelector → Chip → Counter → IconButton → OrderBar → IngredientCollapse → IngredientCard → OrderLocationCard → SplashScreen

### Phase 3: Data Layer (Day 3)

**Goal:** Wire real data so screens use actual products, locations, and offers.

1. **Track 1 (Claude.ai) prepared the data architecture docs, JSON schemas, and 5 data files** (menu, ingredients, locations, offers, user) based on the menu system requirements. These were generated from real product image filenames (174 images parsed), with confirmed pricing/calories from production app screenshots, and a relational ingredient/modifier model designed to support the modular SPP architecture.
2. **Claude Code built TypeScript types** matching the JSON shapes and **4 read-only hooks** (useMenuData, useLocationData, useOfferData, useUserData).
3. **Validated all data** with automated tests — caught and fixed an ingredient ID↔slug key mismatch, order field naming differences, and cross-listed product ID discrepancies.
4. **Updated AuthContext** to source default user from the data file.

### Phase 4: Screen Composition (Days 3-6)

**Goal:** Assemble components + data into functioning screens.

- **Splash Screen** — cameo logo → Lottie animation → fade to app
- **Home Screen** — content cards, offer list rows from real data, privacy policy link
- **Offers Screen** — segmented control (Offers/Rewards), offer list with eligibility states, rewards store with 21-item 2-up card grid
- **Order Screen** — Mapbox map with numbered location pins, bottom sheet with location cards, pickup method selection
- **Earn Screen** — QR code rewards card, add-to-card actions

### Phase 5: Quality Audit (Day 4)

**Goal:** Ensure consistency and accessibility before building more.

- **Comprehensive audit** of all 29 components (at the time) across 4 categories: API consistency, coding patterns, accessibility, Storybook coverage
- **Found 4 high-severity accessibility issues** — `<div onClick>` patterns, nested buttons, missing keyboard support
- **Fixed 27 files** in one pass — semantic HTML, global cursor-pointer rule, exported props interfaces, aria-label props, escape key handler for BottomSheet

### Phase 6: Order Flow & SPP (Days 6-10)

**Goal:** Build the complete ordering flow from category selection through single product customization.

- **Menu Category Screen** — daypart-aware 2-up category grid (14 all-day categories, 9 breakfast), quick action icon buttons (Recents/Favorites/Rewards), pickup location + offer applied ListRows
- **Product Listing Page (PLP)** — scrollable category tabs with horizontal swipe/scroll gesture, 2-up MenuCard grid with price + calories, smooth crossfade transitions between tabs
- **Single Product Page (SPP) — Phase 1** — modular shell with: TransparentTopBar → HeroImage → ProductHeader (red title, favorite, price/calories, Nutrition link) → Make it a Combo card → What's On It 3-column ingredient tiles → Add Extras with counters/chips/toggle → Nutrition/Ingredients tabs → sticky OrderBar. MediumTopAppBar slides in on scroll.
- **Account Screen** — red hero with cameo logo + user greeting, 7 menu ListRows
- **Developer Tools Screen** — 14 feature flags auto-generated from registry, state controls (auth, daypart, location, fulfillment), session reset actions

**New components built for this phase:**
- IngredientTable (nutrition facts with indented sub-rows)
- MediumTopAppBar (white bg, wrapping title, scroll-triggered, favorite)
- HeroImage (centered product image with optional top padding)
- TransparentTopBar (absolute positioned back/close overlay)

**Key architecture decisions:**
- SPP is a **single modular shell** — modules render conditionally based on product data, no product-type switch statement
- SPP lives **outside AppShell** (no tab bar) at `/order/menu/:slug/:productId`
- MediumTopAppBar uses **absolute positioning** within the screen (not sticky/fixed) to avoid layout space issues and stay within the DeviceFrame
- Feature flags use a **self-describing registry** with `flagMeta` — the admin UI auto-generates toggles from this, so adding a new flag requires zero UI work
- Admin tools live in the **Account tab** (not a separate /admin route or FAB) — one more ListRow among the existing account options
- **Daypart switching** is fully wired: changing daypart in Developer Tools swaps the entire category and tab sets on both the category page and PLP

---

## Key Patterns & Conventions Established

### Two-Agent Workflow
- **Claude.ai** — planning, requirements gathering, screenshot analysis, data architecture, document authoring. Produces PRDs, requirements docs, data schemas, and agent prompts.
- **Claude Code** — development execution. Consumes documents from Claude.ai, pulls Figma specs via MCP, builds components and screens, runs audits.
- **Adam** — directs both agents, provides Figma specs, captures production app screenshots, makes design decisions, reviews output.
- **Handoff pattern:** Claude.ai produces a document → Adam downloads it → Adam drops it into the Claude Code project → Claude Code reads and executes.

### Figma → Code Pipeline
- Adam selects a component in Figma
- Claude uses `figma_get_selection` → `figma_take_screenshot` → `figma_execute` to extract specs
- Token variable names (e.g., `color/bg/brand/secondary/default`) map directly to CSS custom properties
- The Anova plugin JSON export provides an additional validation source for complex components

### Screenshot → Requirements Pipeline
- Adam captures production app screenshots (mobile or desktop)
- Claude.ai analyzes them for: layout structure, module presence/absence, real pricing/calorie data, interaction states, modifier patterns, section labels
- Findings are incorporated into the data files (corrected prices, new ingredients, new add-on groups) and the menu system requirements doc
- Each screenshot session typically reveals 2-3 patterns that would have been wrong if assumed

### Documentation-Driven Development
- **CLAUDE.md** — living instruction file with critical rules, patterns, and common mistakes. Updated after every significant decision.
- **COMPONENTS.md** — component registry with props, use cases, screen composition patterns, and data hook examples.
- **AUDIT-REPORT.md** — structured quality audit with prioritized action items.
- **Memory files** — persistent notes about the user, project context, and feedback for future AI sessions.
- **PRD, Data Architecture, Menu System Requirements** — authored in Claude.ai, consumed by Claude Code.

### Design Token Pipeline
```
Figma Variables → Token Press Export (CSS) → tokens.css → Tailwind @theme → Component styles
```

### Component Architecture
- Each component in its own directory: `ComponentName/ComponentName.tsx` + `ComponentName.stories.tsx`
- Props interfaces always exported
- Inline styles with `var(--token)` for dynamic/conditional colors
- Tailwind classes for layout, spacing, typography
- Framer Motion for animations

---

## Tools & Integrations Used

| Tool | How We Used It |
|---|---|
| **Claude.ai** | Planning agent — PRD authoring, requirements gathering, screenshot analysis, data architecture, menu system documentation, admin UI planning |
| **Claude Code** | Development agent — component building, screen composition, data layer, auditing |
| **Figma Console MCP** | Direct component inspection from Figma — `figma_execute`, `figma_get_selection`, `figma_take_screenshot` |
| **Anova Figma Plugin** | JSON export of complex component specs (Button, ListRow) for validation |
| **Token Press** | Figma variable export to CSS custom properties |
| **Storybook** | Component QA, visual regression, interactive testing |
| **Mapbox GL JS** | Location map on Order screen |
| **Lottie React** | Splash screen animation |

---

## Document Set

| Document | Authored in | Purpose |
|---|---|---|
| `wendys-prototype-prd.md` | Claude.ai | App architecture, tech stack, build sequence, component specs |
| `data-architecture.md` | Claude.ai | JSON schemas, relational ingredient model, data access patterns |
| `menu-system-requirements.md` | Claude.ai | SPP module system, wizard patterns, product type matrix, confirmed data, UX inconsistencies |
| `admin-ui-prompt.md` | Claude.ai | Unified admin UI spec with localStorage migration and 7-tab layout |
| `claude-code-prompt.md` | Claude.ai | Onboarding prompt explaining how Claude Code should use all documents |
| `CLAUDE.md` | Claude Code | Living rules file for development conventions and patterns |
| `COMPONENTS.md` | Claude Code | Component registry with props, examples, and composition patterns |
| `AUDIT-REPORT.md` | Claude Code | Quality audit findings and fixes |
| `PROCESS.md` | Both | This document — project history and methodology |

---

## Metrics

| Metric | Value |
|---|---|
| Components built | 35 |
| Storybook stories | 30+ files, 120+ stories |
| Screens functioning | 9 (Splash, Home, Offers, Order, MenuCategory, PLP, SPP, Account, DevTools) |
| Data records | 160+ products across 21 categories, 24 ingredients, 16 add-ons, 9 offers, 5 locations, 21 rewards items |
| Feature flags | 14 (with self-describing registry for auto-generated admin UI) |
| Design tokens | 200+ CSS custom properties |
| Files in project | 120+ source files |
| Build time | ~1-2 seconds |
| Production app screenshots analyzed | 50+ |
| Product types documented | 20+ |
| Combo wizard configurations confirmed | 8 |
| UX inconsistencies identified | 11 |
| Requirements docs authored | 4 (PRD, data architecture, menu system, admin UI) |

---

## Lessons Learned

### What Worked Well
1. **Two-agent workflow** — separating planning/requirements (Claude.ai) from development (Claude Code) allowed both tracks to run in parallel. Adam could capture screenshots and refine data in Claude.ai while Claude Code was building components.
2. **Screenshot-driven requirements** — every production app screenshot caught patterns that would have been wrong if assumed. The ingredient tile system, modifier interactions, and combo wizard patterns all evolved significantly from the initial PRD assumptions.
3. **Figma MCP inspection** eliminated guesswork — pulling exact token names, padding values, and typography directly from Figma components ensured accuracy.
4. **Building components before screens** paid off — when composing screens, everything just snapped together from the library.
5. **Token-only styling** caught several issues early (dark theme mixup, broken variable references) that would have been invisible with hardcoded values.
6. **Storybook stories as QA tool** — Adam could review components in isolation before they appeared in screens, catching issues like wrong icon colors or spacing before they propagated.
7. **The audit process** found real accessibility issues that would have been hard to catch during incremental building.
8. **Data hooks abstraction** — separating read-only data access from mutable state made it trivial to wire real data into screens.
9. **Iterative data model** — starting with generated data from filenames, then progressively correcting with real screenshot data, was far more efficient than trying to define the perfect schema upfront.
10. **Documenting UX inconsistencies as they were discovered** — Section 12 of the menu system doc became an organic evidence base for rationalization proposals, not a post-hoc analysis.

### What We'd Do Differently
1. **Get the right token file upfront** — we wasted time debugging colors because the initial CSS export was the dark theme.
2. **Test Tailwind arbitrary values earlier** — the JIT scanning issue with `var()` interpolation caused several rounds of fixes before we established the inline styles pattern.
3. **Build the data layer earlier** — we used placeholder data in early stories that had to be updated when real data arrived. The data architecture could have been handed off on day 1 instead of day 3.
4. **Document the `onPress` vs `onClick` convention from day 1** — the inconsistency grew organically and required a retroactive audit to catch.
5. **Capture all screenshots in one focused session** — screenshots were captured across multiple days as time allowed. A single dedicated session per daypart would have been more efficient and ensured nothing was missed.

---

## What's Next

### SPP Phase 2 — Conditional Modules
- **Size selector** — for drinks, fries, Frosty (S/M/L pills, Junior variant)
- **Included accompaniment card** — sauce/dressing card for nuggets, tenders, salads
- **Featured add-on upsell card** — "Add even more goodness" (e.g., Bacon on Dave's Single)
- **"Your Changes" summary** — change pills with × dismiss, Reset link
- **Flavor selector** — Freestyle drinks only (radio button list with brand logos)

### SPP Phase 3 — Combo Wizard & Flows
- **Combo wizard bottom sheet** — 6 step types (entrée modifier, side, sauce, drink, pick-from-pool)
- **Populated combo SPP** — component cards with Edit links, "Price in Bag" display
- **Pre-SPP wizards** — sauce selection for nuggets/tenders, dressing for salads

### Remaining Screens
- **Bag + Checkout** — order summary, payment, confirmation
- **Unauth variants** — Home screen, tab bar differences (Find vs Earn)

### UX Exploration (via Feature Flags)
- Add-to-bag animation variants (snackbar / slide-to-bag / full-screen)
- Alternate combo building methods (bottom-sheet-wizard / accordion)
- Alternate menu page designs (category, SPP, PLP variants)
- New bottom app bar style (current / simple — already built)
- Location component on home screen (none / card / sticky-nav)
- Button color scheme (teal secondary / red primary)
- Dark mode
- Post-order surprise & delight animations

---

*This document is updated as the project progresses. Last updated: April 10, 2026.*
