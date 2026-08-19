# Component Guide

Per-component conventions, design language, and rules. The full component registry with props is in [`COMPONENTS.md`](../COMPONENTS.md).

## Icon Rendering

Two approaches:

1. **Mono icons** — CSS `mask-image` with `bg-current` so the icon inherits `currentColor` from the parent text color. This is the default.
2. **Multi-color icons** — Rendered as `<img>` tags to preserve original SVG fill colors. Use `leftIconMultiColor` / `rightIconMultiColor` props on Button, or render `<img>` directly.

Multi-color icons: `rewards-simple.svg`, `bag-red.svg`, `letter-mark-coin-filled.svg`, `letter-mark-coin-outlined.svg`, `*-multi-color.svg`.

## Button

- `colorScheme`: `'secondary'` (teal, default per Figma) or `'primary'` (red)
- Buttons use **brand secondary (teal)** as the default — Figma is the source of truth, not the PRD which mentions red
- `elevated` is a boolean prop, not a separate type
- Loading state keeps enabled colors and blocks interaction via `pointer-events-none`
- Small/noPadding variants skip the 48px outer tap target wrapper for compact contexts (e.g., TopAppBar trailing buttons)

## TopAppBar

- **Screen-owned, not shell-owned** — each screen renders its own with its specific configuration
- `titleWeight`: `'black'` (800, default for root screens) or `'semibold'` (600, for inner screens)
- `showBag` shows the bag button, but `BagButton` internally returns `null` when bag count is 0
- `pointsLoading` shows a shimmer animation in place of the points value

## BottomTabBar

- `variant`: `'current'` (Wendy's custom with floating Order button) or `'simple'` (flat tab bar for future experiments)
- Center Order button has 3 states: big teal circle (Home tab), teal icon (Order tab active), gray icon (other tabs)
- The white bar always has the curved notch cutout for the center button
- Auth/unauth switches tab 4 between "Earn" (QR scanner) and "Find" (location)

## BottomSheet

- Uses Framer Motion for drag/spring physics — `springSheet` preset
- Height can be percentage (`'50%'`) or fixed pixels (`300`)
- `scrollable` enables independent content scrolling
- Drag handle is 40×4px dark pill, centered in 36px header
- Dismisses on scrim tap or drag-down (>100px or fast flick)

## ListRow

- Most complex/flexible component — 229 Figma variants, composed from Label, HelperMessage, Checkbox, RadioButton, Toggle
- Two styles: `standard` (full-width with divider) and `rounded` (bordered, padded — provides its own 16px horizontal padding, never wrap in another `px-wds-16`)
- Validation on rounded style changes border color + auto-shows helper message
- Leading: none, icon (24×24, container remains for tap target), image (56px thumbnail)
- Trailing: none, checkbox, radio, toggle, icon (default: caret-right) + optional metadata text
- Headline text **wraps** (no longer truncates)
- Rounded style bottom padding is `pb-wds-8`
- Props for tokens: `leadingIconColor`, `leadingIconMultiColor`, `metadataColor`, `metadataWeight`
- For token-driven colors, use **inline styles** instead of Tailwind arbitrary values (avoids JIT scanning issues)

## Snackbar

- Single-line layout has 14px top/bottom padding so wrapped text doesn't crowd the bottom edge. Single-line behavior unchanged: 14 + 20 line + 14 = 48px = minHeight.
- Use `position: absolute` (NOT `fixed`) inside DeviceFrame; `fixed` ends up off-screen on the desktop preview
- Wrap with `<AnimatePresence>` for proper enter/exit animation
- On Home: sits at `bottom: 174` to clear the voice FAB (FAB at `bottom: 110`, height 56)

## Card Components

- **ContentCard:** Simple image container (large: 358×224, small: 358×144), 8px radius, 1px border, shimmer loading
- **CategoryCard:** `width: 100%`, 96×96 centered image + title below (wraps), 8px radius, no border, fallback on error
- **MenuCard:** `width: 100%`, `aspect-ratio: 1/1` image, product title + subtitle (price) + caption (calories), optional docked Label
- Cards in 2-up grids use CSS Grid `repeat(2, 1fr)` for equal column widths
- All cards have `fallbackSrc` prop for swappable fallback images (Wendy's W logo default)

## HeroImage

- Centered product image (320×320) on white background
- `extraPadding` adds 56px top padding for SPP where TransparentTopBar overlays
- Without `extraPadding`: 320px tall. With: 376px tall. Use `extraPadding` on SPP, omit on Reward/Offer detail pages.

## MediumTopAppBar

- **White background** (not red like standard TopAppBar)
- Product title: Wendys Fresh 23px, weight 800, brand primary red, **wraps** to multiple lines
- Subtitle: Roboto 18px, weight 700, primary text color
- Back arrow + favorite heart buttons
- **Not self-positioning** — parent controls visibility via absolute positioning + transform

## TransparentTopBar

- Absolutely positioned overlay — no background, sits over HeroImage
- `leadingIcon`: `'back'` (arrow-left) or `'close'` (X for combo dialogs)
- `showFavorite` defaults to `false` — favoriting is handled in MediumTopAppBar on scroll
- `pointerEvents: none` on container, `auto` on button row

## IngredientTable

- Non-interactive nutrition facts table
- Rows with label (left, primary text) and value (right, secondary text)
- `indent` adds 40px left padding for sub-items (e.g., Saturated Fat under Total Fat)
- Roboto 14px for both label and value

## Feature Flags

- Registry in `src/config/featureFlags.ts` — 14+ flags with typed options + `flagMeta` for labels/descriptions
- Admin UI auto-generates toggles from the `flagMeta` registry — adding a new flag automatically creates its toggle in Developer Tools
- Always add a feature flag check from the start when building new features
- Current flags: addToBagTransition, comboBuilderStyle, locationSelectionLayout, splashAnimation, menuCategoryLayout, menuPLPLayout, sppLayout, bottomNavStyle, homeLocationComponent, buttonColorScheme, fallbackImage, postOrderSurprise, darkMode, loadingScenario, voiceOrdering

## SPP Architecture

- **Single modular shell** — each module renders conditionally based on product data
- Route: `/order/menu/:slug/:productId` — **outside AppShell** (no tab bar)
- TransparentTopBar overlays HeroImage; MediumTopAppBar slides in on scroll (absolute positioned)
- OrderBar absolutely positioned at bottom
- Ingredient images mapped via `ingredientImageMap` / `addOnImageMap` in the screen file (not in data)
- Add-on modifier types determined by `getAddOnModifierType()` helper
- Daypart-aware: category page and PLP switch between all-day (14) and breakfast (9) category sets

## Pattern: Inline Styles for Token Colors

When a component needs token-driven colors that don't require hover/focus/responsive variants, use **inline `style`** with `var()` references instead of Tailwind arbitrary value classes. This avoids the JIT scanning issue.

```tsx
// ✅ Use inline styles for static token colors
style={{ color: 'var(--color-text-primary-default)' }}

// ❌ Avoid — may not be detected by Tailwind scanner
className="text-[var(--color-text-primary-default)]"
```

Reserve Tailwind classes for colors that need hover/active states or are pre-registered in `@theme`.

### Theme variants: scoped token remaps, not props

When a variant recolors many components at once, redefine the semantic
tokens on an ancestor instead of threading a prop. `.theme-retro-red` in
`tokens.css` re-points the `brand-secondary` family at the red ramp, and
`DeviceFrame` applies it when the resolved `accentColor` flag is `red` —
recoloring 28 files with no component edits. This works because CSS custom
properties are re-substituted per element, so the `@theme` aliases in
`app.css` resolve against each element's own inherited value.

Two rules:

- Only remap **brand** tokens. `--color-bg-secondary-default` is a neutral
  gray; remapping it would repaint half the app. The floating-pill nav's
  active pebble depends on it staying neutral.
- Don't remap the `onBrand` family to achieve dark-on-light. `onBrand` white
  is still correct for labels on red filled buttons. Switch the component's
  variant instead — that's why retro's `TopAppBar` moves Points and Find
  from `text-reversed` to `text` rather than recoloring a token.

---

## Wendy's Design Language

### Typography

Two font families:
- **Wendys Fresh** (`font-display`) — headlines, titles, buttons. Distinctive hand-lettered feel.
- **Roboto** (`font-body`) — body text, UI labels, captions. Clean and legible.

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

### Color

- **Brand primary (red):** App bar backgrounds, primary CTAs, brand accents
- **Brand secondary (teal/blue-600):** Default button color, interactive elements, Order button, links
- **Brand tertiary (crimson):** Accent uses
- **Text on brand:** White (`text/onBrand/default`)
- **Disabled:** Gray backgrounds + text — consistent across all components

### Spacing

4px base grid. Common values: 4, 8, 12, 16, 24, 32, 48. Use token-mapped utilities (`p-wds-16`, `gap-wds-8`).

### Elevation

5-step shadow scale (xs → xl). `shadow-wds-s` for buttons, `shadow-wds-m` for hover, `shadow-wds-xl` for device frame.

### Border Radius

Pill-shaped interactive elements use `rounded-wds-full` (9999px). Cards use `rounded-wds-l` (12px) or `rounded-wds-m` (8px).

---

## Design Decision Framework

When building NEW screens or features without a direct Figma reference:

### Component Selection

1. **Always use existing components** — never create custom one-off UI when one exists
2. **Check COMPONENTS.md** for the right component for each use case
3. **Compose screens from sections** — each section has a SectionHeader + content pattern
4. If no existing component fits, **ask Adam before creating a new one**

### Typography Decisions

| Content type | Style |
|---|---|
| Screen titles (root tabs) | TitleL/Black via TopAppBar `titleWeight="black"` |
| Screen titles (inner/stack) | TitleL/SemiBold via TopAppBar `titleWeight="semibold"` |
| Section headers | DisplayS/Black for large, TitleS/Black for small |
| Card titles, list row headlines | TitleXS/SemiBold (16/20, weight 600) |
| Body text, descriptions | BodyS/Regular (14/20) or BodyM/Regular (16/24) |
| Prices, metadata | BodyL/Bold for prominent, CaptionL for secondary |
| Labels, badges, captions | CaptionL/Black (12/16, weight 900) |
| Buttons | Handled by Button component |

### Color Decisions

| Context | Token |
|---|---|
| Primary text on light bg | `text/primary/default` (gray-1100) |
| Secondary/supporting text | `text/secondary/default` (gray-800) |
| Text on red/teal backgrounds | `text/onBrand/default` (white) |
| Product names on SPP | `text/brand/primary/default` (red) |
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
| Between major sections | Use SectionHeader (24px top/bottom built in) |
| Card grid | 2-up, `gap-wds-12`, `align-items: stretch` |
| List items | Stack ListRow (dividers built in) |
| Horizontal scroll | `gap-wds-12`, `overflow-x-auto`, content peeks off-screen |
| Bottom sticky CTA | Fixed at bottom with 16px padding, above tab bar |
| Modal/sheet content | `px-wds-16` inside BottomSheet |

### When There's No Figma Reference

1. **Look at similar screens** in the app for precedent
2. **Reuse existing patterns**
3. **Default to the simpler option** — fewer elements, more whitespace, standard components
4. **Use token values only** — even for spacing, pick from the 4px grid
5. **Maintain hierarchy** — one primary action per screen
6. **When unsure, ask** — don't guess on brand-specific decisions

---

## Storybook Rules

1. **Every component gets a story file** in its directory: `ComponentName.stories.tsx`
2. **Required stories:** Playground (interactive args), key visual variants, all states
3. **Context providers in decorators:** Wrap with `MemoryRouter`, relevant Context providers. Use `SeedBag` pattern when bag items are needed.
4. **390px width constraint:** Use `<div style={{ width: 390 }}>` in decorators
5. **No full documentation** — stories are for QA and development, not publishing
6. **Mobile viewport addon** configured at 390×844 (`wendysMobile`)

---

## Accessibility Rules

1. **Semantic HTML:** `<header>`, `<nav>`, `<main>`, `<button>`, `<h1>`–`<h6>`
2. **ARIA labels** on all interactive elements that lack visible text
3. **`aria-hidden="true"`** on decorative icons and images
4. **`role="tablist"` / `role="tab"`** on navigation bars with `aria-selected`
5. **`aria-busy="true"`** on loading states
6. **Focus management:** Use `<button>` elements, not `<div onClick>`
7. **Color contrast:** Text on brand backgrounds uses `text/onBrand` tokens. Disabled states use dedicated disabled tokens.
8. **Truncation:** Long titles use `truncate` to prevent overflow

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
| Using Tailwind arbitrary values for token colors on non-interactive elements | Use inline `style={{ color: 'var(--color-*)' }}` |
| Absolute positioning for checkbox/radio in ListRow | Use negative margins on wrapper div |
| Using `bg-[var(--color-*)]` for icon background color | Use inline `style={{ backgroundColor: 'var(--color-*)' }}` |
| Forgetting to copy new assets to `public/` | Always copy from `assets/` to `public/` when new images/icons are added |
| Chip components not filling width in flex layouts | Chip uses `width: 100%` — wrap in flex container with `flex: 1 1 0` per chip |
| Using `inline-flex` on components that need to stretch | Use `flex` with `width: 100%` |
| TypeScript union narrowing errors in stories | Define explicit interface and type the useState generic |
| Wrapping a `style="rounded"` ListRow in `px-wds-16` | The rounded variant already pads itself; double-padding shrinks the card |
| Using `position: fixed` inside DeviceFrame | Use `position: absolute` — `fixed` positions vs the desktop viewport, not the device frame |
