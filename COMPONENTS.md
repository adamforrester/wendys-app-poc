# Component Reference — Wendy's App Prototype

This is the canonical reference for all built components. Use this when building screens to know what's available, what props to use, and when to choose each component.

---

## Navigation & Shell

### TopAppBar
**Location:** `src/components/TopAppBar/TopAppBar.tsx`
**Use when:** Every screen needs one. Screen-owned, not shell-owned.

| Prop | Type | When to use |
|---|---|---|
| `titleMode` | `'logo' \| 'title'` | Logo for Home + Offers root screens; Title for everything else |
| `logoSrc` | `string` | Swap for campaigns or Rewards logo (Offers screen) |
| `title` | `string` | Screen name |
| `titlePlacement` | `'center' \| 'left'` | Center for inner/stack screens; Left for root tab screens |
| `titleWeight` | `'black' \| 'semibold'` | Black (800) for root screens; SemiBold (600) for inner screens |
| `showBackButton` | `boolean` | True on all stack (non-root) screens |
| `showPoints` | `boolean` | Home + Offers when authenticated |
| `showFind` | `boolean` | Home screen only |
| `showBag` | `boolean` | Home + Order screens (hides when bag empty) |
| `showLoadingBar` | `boolean` | During API fetches / screen transitions |
| `pointsLoading` | `boolean` | While rewards points are loading |

**Root screen configs:**
- Home: `logo`, showPoints + showFind + showBag
- Offers: `logo` (rewards-logo-white.svg), showPoints
- Order/Earn/Account: `title`, left-aligned, black weight

### BottomTabBar
**Location:** `src/components/BottomTabBar/BottomTabBar.tsx`
**Use when:** Always present in AppShell on root screens.

| Prop | Type | When to use |
|---|---|---|
| `variant` | `'current' \| 'simple'` | `current` = Wendy's custom nav with floating Order button; `simple` = flat tab bar for future experiments |

**Center Order button behavior:**
- Home tab active → Big teal circle
- Order tab active → Teal icon (no circle)
- Other tabs → Gray icon (no circle)

### BottomSheet
**Location:** `src/components/BottomSheet/BottomSheet.tsx`
**Use when:** Combo builder steps, location detail, confirmations, any modal overlay from bottom.

| Prop | Type | When to use |
|---|---|---|
| `height` | `number \| '50%'` | Percentage of screen or fixed pixels |
| `scrollable` | `boolean` | When content may overflow (lists, long forms) |
| `showHandle` | `boolean` | Almost always true; false only for non-dismissible sheets |
| `showScrim` | `boolean` | True for modal overlays; false if sheet is part of page layout |

### Dialog
**Location:** `src/components/Dialog/Dialog.tsx`
**Use when:** Confirmations, prompts, alerts — centered modal overlay or fullscreen takeover.

| Prop | Type | When to use |
|---|---|---|
| `variant` | `'standard' \| 'prompt'` | Standard allows close X + secondary action; Prompt has primary action only |
| `fullscreen` | `boolean` | True for fullscreen takeover (no scrim, white bg); false for centered card with scrim |
| `icon` | `string` | Icon filename (e.g., `'rewards-simple'`) — displayed above headline |
| `iconMultiColor` | `boolean` | Render icon as `<img>` to preserve multi-color fills |
| `imageSrc` | `string` | Image URL displayed above headline (replaces icon) |
| `headline` | `string` | Dialog title — Wendys Fresh 23px XBold |
| `supportText` | `string` | Body text — Roboto 14px Regular, gray |
| `primaryAction` | `DialogAction` | `{ label, onClick, colorScheme? }` — filled button |
| `secondaryAction` | `DialogAction` | `{ label, onClick, colorScheme? }` — text button (standard only) |
| `showClose` | `boolean` | Show/hide close X (standard only, default true) |
| `children` | `ReactNode` | Custom content between support text and actions |

**Key behaviors:**
- Scrim tap dismisses (non-fullscreen only)
- Escape key dismisses
- Material-style animation: fade + scale for card, fade + slide for fullscreen
- Prompt variant enforces no close X, no secondary action

**Use cases:**
- Combo builder exit confirmation (standard, no close, headline + Stay/Leave)
- Ingredient quantity editing (standard, with custom children for counter)
- Success/reward alerts (prompt with icon)
- Fullscreen content (fullscreen variant)

### MediumTopAppBar
**Location:** `src/components/MediumTopAppBar/MediumTopAppBar.tsx`
**Use when:** SPP scroll-triggered header — slides in when user scrolls past the product header.

| Prop | Type | When to use |
|---|---|---|
| `title` | `string` | Product name — wraps to multiple lines |
| `subtitle` | `string` | Price + calories (e.g., "$10.29 \| 860 Cal") |
| `isFavorited` | `boolean` | Heart icon fill state |
| `onFavoriteToggle` | `(boolean) => void` | Toggle handler |
| `onBack` | `() => void` | Back navigation handler |

**Important:** This component does NOT self-position. The parent screen wraps it in an absolutely-positioned div with `transform: translateY` to control slide-in/out visibility.

### TransparentTopBar
**Location:** `src/components/TransparentTopBar/TransparentTopBar.tsx`
**Use when:** SPP initial state — back/close button over the HeroImage.

| Prop | Type | When to use |
|---|---|---|
| `leadingIcon` | `'back' \| 'close'` | Back arrow for regular SPP; Close X for combo dialogs |
| `showFavorite` | `boolean` | Default `false` — favoriting handled by MediumTopAppBar |

**Positioning:** Absolutely positioned, `pointerEvents: none` on container with `auto` on button row.

### HeroImage
**Location:** `src/components/HeroImage/HeroImage.tsx`
**Use when:** Primary product image display on SPP and detail pages.

| Prop | Type | When to use |
|---|---|---|
| `imageSrc` | `string` | Product image path |
| `extraPadding` | `boolean` | `true` on SPP (56px top gap for TransparentTopBar), `false` on Reward/Offer detail pages |

### IngredientTable
**Location:** `src/components/IngredientTable/IngredientTable.tsx`
**Use when:** Nutrition facts in the Nutrition tab of SPP.

| Prop | Type | When to use |
|---|---|---|
| `rows` | `NutritionRow[]` | `{ label, value, indent? }` — indent for sub-items like Saturated Fat |

---

## Buttons & Controls

### Button
**Location:** `src/components/Button/Button.tsx`
**Use when:** Any tappable action — CTAs, navigation, form submission.

**Key decision: Which variant?**
| Need | Variant | Color |
|---|---|---|
| Primary CTA (Add to Bag, Place Order) | `filled` | `secondary` (teal) or `primary` (red) |
| Secondary action (View Menu, Cancel) | `outline` | `secondary` |
| Text link (View All, Learn More) | `text` | `secondary` |
| On dark/brand backgrounds | `filled-reversed`, `outline-reversed`, `text-reversed` | — |
| Elevated emphasis | Add `elevated` prop | — |

**Key decision: Which size?**
- `large` (48px): Primary CTAs, standalone buttons
- `small` (32px): In-line actions, compact contexts (TopAppBar, ListRow, cards)

### Toggle
**Location:** `src/components/Toggle/Toggle.tsx`
**Use when:** Binary on/off settings. Always in a ListRow trailing slot.

### RadioButton
**Location:** `src/components/RadioButton/RadioButton.tsx`
**Use when:** Single selection from a list. Used in ListRow trailing slot for combo builder choices.

| Type | When to use |
|---|---|
| `standard` (dot) | General single-select lists |
| `checked` (checkmark) | Selection confirmation, combo steps |

### Checkbox
**Location:** `src/components/Checkbox/Checkbox.tsx`
**Use when:** Multi-selection (toppings, customizations). Used in ListRow trailing slot.

### SegmentedControl
**Location:** `src/components/SegmentedControl/SegmentedControl.tsx`
**Use when:** 2-5 mutually exclusive options displayed inline. Fulfillment method, combo size, filter tabs.

| Density | When to use |
|---|---|
| `xl` (48px) | Primary page-level controls |
| `lg` (44px) | Secondary controls |
| `md` (40px) | Compact contexts |
| `sm` (36px) | Tight spaces |

### ItemSelector
**Location:** `src/components/ItemSelector/ItemSelector.tsx`
**Use when:** Visual selection with circular image — drinks, sides, pickup methods.

| Use case | Config |
|---|---|
| Drink/side selection | Product images, `size="large"`, caption = price |
| Pickup method | Nurdle images, `captionColor="positive"/"critical"` for Open/Closed |
| Closed method | `disabled` + `captionColor="critical"` + caption="Closed" |

---

## Content & Layout

### ListRow
**Location:** `src/components/ListRow/ListRow.tsx`
**Use when:** Any list item — settings, menu items, locations, bag items, account options.

**Key decision: Which style?**
| Style | When to use |
|---|---|
| `standard` | Stacked lists (settings, menu items, search results) |
| `rounded` | Standalone items, form fields, cards-in-list |

**Key decision: Which trailing?**
| Trailing | When to use |
|---|---|
| `icon` (caret-right) | Navigation to detail screen |
| `checkbox` | Multi-select lists (customizations) |
| `radio` | Single-select lists (combo choices) |
| `switch` | Toggle settings |
| `none` | Display-only rows |

**Leading icon:** 24×24 (not 40×40). Additional props:
- `leadingIconColor` — override icon color (e.g., `var(--color-icon-brand-primary-default)` for red location pin)
- `leadingIconMultiColor` — render as `<img>` for multi-color SVGs

**Metadata styling:** `metadataColor` and `metadataWeight` props for trailing metadata text (e.g., blue bold "Edit" on pickup location row).

**Headline wraps** — no truncation. Rounded style uses `pb-wds-8` bottom padding.

### SectionHeader
**Location:** `src/components/SectionHeader/SectionHeader.tsx`
**Use when:** Above any content section on a screen. Home modules, menu sections, settings groups.

| Size | When to use |
|---|---|
| `large` | Top-level sections (Your Offers, Order Again, Trending) |
| `small` | Sub-sections, less prominent headers |

### Tabs
**Location:** `src/components/Tabs/Tabs.tsx`
**Use when:** Content filtering or category navigation.

| Type | When to use |
|---|---|
| `fixed` | 2-3 equal-width tabs (Offers: All/My Offers) |
| `scrollable` | 4+ tabs (menu categories) |

---

## Cards

### ContentCard
**Location:** `src/components/ContentCard/ContentCard.tsx`
**Use when:** Promotional banners from Braze — hero content, offers, campaigns.

| Size | Dimensions | When to use |
|---|---|---|
| `large` | 358×224 | Hero banner, primary promo |
| `small` | 358×144 | Secondary promo, offers |

### CategoryCard
**Location:** `src/components/CategoryCard/CategoryCard.tsx`
**Use when:** Menu category grid (always 2-up layout). Width is `100%` — fills grid cell. Title text wraps (no truncation).

### MenuCard
**Location:** `src/components/MenuCard/MenuCard.tsx`
**Use when:** Product listing grid (always 2-up layout). Width is `100%` — fills grid cell. Image uses `aspect-ratio: 1/1`.

| Prop | Type | When to use |
|---|---|---|
| `subtitle` | `string` | Price line (e.g., "$8.49") |
| `caption` | `string` | Calories line below price (e.g., "810 Cal") |
| `label` | `MenuCardLabel` | Docked label at bottom (optional) |

**2-up grid pattern:**
```tsx
<div className="px-wds-16" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
  <MenuCard title="..." subtitle="$8.49" caption="810 Cal" imageSrc="..." />
</div>
```

---

## Feedback & Status

### Label
**Location:** `src/components/Label/Label.tsx`
**Use when:** Status badges, callouts on cards and list items.

| State | When to use |
|---|---|
| `primary` | Featured/promotional (crimson bg, white text) |
| `secondary` | Neutral info (white bg, dark text, gray border) |
| `critical` | Error/warning (red border + text) |
| `success` | Positive status (green border + text) |
| `caution` | Warning (orange border + text) |
| `unavailable` | Greyed out (gray bg, red text) |

Use `docked` prop when placing at the bottom of a card (MenuCard).

### HelperMessage
**Location:** `src/components/HelperMessage/HelperMessage.tsx`
**Use when:** Below form fields or list rows for validation feedback.

### Snackbar
**Location:** `src/components/Snackbar/Snackbar.tsx`
**Use when:** Temporary notification after an action (add to bag, remove item, error).
- Use `actionLabel` for "View Bag", "Undo" type actions
- Use `duration={0}` for persistent messages that need manual dismiss
- Use `multiLine` when message text is longer than ~40 characters

### Spinner
**Location:** `src/components/Spinner/Spinner.tsx`
**Use when:** Loading states in buttons, inline loading indicators.

### ProductHeader
**Location:** `src/components/ProductHeader/ProductHeader.tsx`
**Use when:** Top of Single Product Page (SPP) only. Shows product name (red), price, calories, nutrition link, favorite heart, size selector (combos only).

### Chip
**Location:** `src/components/Chip/Chip.tsx`
**Use when:** Selectable pills for sizes, modifiers, times, filters. Used inside IngredientCollapse and standalone.

| Type | When to use |
|---|---|
| `select` | Size selection, modifier amounts (Lite/Reg/Xtra), time slots |
| `dismissible` | Active filters/customizations that can be removed |

### Counter
**Location:** `src/components/Counter/Counter.tsx`
**Use when:** Quantity selection — ingredient quantities, bag item quantities.

| Variant | When to use |
|---|---|
| `bordered={true}` | Standalone or inside IngredientCollapse |
| `bordered={false}` | Inside OrderBar (compact, no circles) |

### IconButton
**Location:** `src/components/IconButton/IconButton.tsx`
**Use when:** Icon-only actions (back, close, favorite) or icon tiles with labels.

| Style + Size | When to use |
|---|---|
| Small/Rounded | Back buttons, close buttons, favorite hearts |
| Large/Squared | Action shortcut tiles (Rewards, Offers, Reorder) |
| Large/Rounded | Circular icon with label below |

Added `iconColor` prop — pass a token color to override the default (e.g., `var(--color-icon-brand-primary-default)` for red Recents/Favorites icons on category page).

### OrderBar
**Location:** `src/components/OrderBar/OrderBar.tsx`
**Use when:** Bottom of SPP — floating bar with quantity counter + "Add" to bag button. Sticky at bottom of screen.

### IngredientCollapse
**Location:** `src/components/IngredientCollapse/IngredientCollapse.tsx`
**Use when:** SPP ingredient/modifier list. Row with checkbox that expands to reveal chips (Lite/Reg/Xtra) or counter.

| modifierType | When to use |
|---|---|
| `chips` | Condiments, toppings with amount options |
| `counter` | Extras with quantity (bacon slices, cheese) |
| `none` | Simple add/remove with no modifier |

**Note:** IngredientCollapse uses **ingredient images** (`/images/ingredient-images/`), not product images. Pass the correct image path when composing SPP screens.

### IngredientCard
**Location:** `src/components/IngredientCard/IngredientCard.tsx`
**Use when:** "What's On It" section on SPP — 3-column grid of ingredient tiles.

| State | When to use |
|---|---|
| `selected` + `editable` | Included ingredient with edit option (condiments) — shows checkbox + "Edit" CTA |
| `selected` + not editable | Included ingredient, toggle only (lettuce, tomato) — checkbox, no edit |
| `unselected` | Removed ingredient — gray bg, dimmed image |
| `required` | Display-only, cannot be removed (bun, patty) — no checkbox, no edit |

**3-up grid pattern:**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>
  {ingredients.map(ing => <IngredientCard key={ing.id} ... />)}
</div>
```

Images: 88×88 centered in card. Use `/images/ingredient-images/{name}.png` (kebab-case).


### ActionCard
**Location:** `src/components/ActionCard/ActionCard.tsx`
**Use when:** Bag "Complete your meal" upsell carousel, cross-sell suggestions, promo cards. Horizontal card with image + text + CTA.

| Prop | Type | When to use |
|---|---|---|
| `titleSize` | `'title-m' \| 'title-xs' \| 'title-2xs'` | Title typography — m (20px), xs (16px), 2xs (12px) |
| `imageSrc` | `string` | Product/promo image |
| `imageSide` | `'left' \| 'right'` | Image position |
| `imageSize` | `112 \| 48` | Image dimensions in px |
| `overline` | `string` | Small text above title |
| `title` | `string` | Main title text |
| `subtitle` | `string` | Below title (price, calories) |
| `label` | `string` | Bordered pill label (e.g., price tag) |
| `ctaType` | `'outline' \| 'text' \| 'none'` | CTA button style |
| `ctaLabel` | `string` | CTA button text |
| `onCtaPress` | `() => void` | CTA click handler |
| `isAdded` | `boolean` | Shows animated "Added" badge + switches CTA to "Remove it" |
| `onAdd` | `() => void` | "Add it on" handler (SPP upsell mode) |
| `onRemove` | `() => void` | "Remove it" handler (SPP upsell mode) |
| `loading` | `boolean` | Shimmer skeleton state |

**28 Figma variants** across title size, image side, image size, CTA style, and loading state. Card is 358px wide, white bg, 1px gray border, 8px radius.

**SPP upsell mode:** Pass `onAdd`/`onRemove` instead of `ctaType`/`ctaLabel` to get the add/remove toggle with animated "Added" green badge (replaces the former UpsellCard component).

### BagItemCard
**Location:** `src/components/BagItemCard/BagItemCard.tsx`
**Use when:** Bag screen — displays a product in the cart with quantity selector, favorite, edit/remove actions. Handles both single items and combos.

| Prop | Type | When to use |
|---|---|---|
| `name` | `string` | Product name |
| `price` | `string` | Price display (e.g., "$10.49") |
| `imageSrc` | `string` | Product image URL |
| `quantity` | `number` | Current quantity |
| `onQuantityChange` | `(qty: number) => void` | Quantity change handler |
| `isFavorited` | `boolean` | Favorite state |
| `onFavoriteToggle` | `(boolean) => void` | Favorite toggle handler |
| `onEdit` | `() => void` | Edit button handler |
| `onRemove` | `() => void` | Remove button handler |
| `comboItems` | `BagComboSubItem[]` | Combo sub-items (renders nested bordered cards) |

**Quantity selector:** Bordered button with number + caret-down. Tapping opens a BottomSheet with "Choose Quantity:" title and numbers 1-10. Current selection shown in bold.

**Combo items:** Nested bordered cards with 40px image + product name. Read-only, no actions.

---

## Screen Composition Patterns

### Standard Screen Layout
```tsx
<>
  <TopAppBar ... />
  <div className="flex-1 overflow-y-auto">
    {/* Screen content */}
  </div>
</>
```

### Home Screen Module Pattern
```tsx
<SectionHeader title="Your Offers" ctaLabel="View All" onCtaPress={...} />
{/* Content cards, horizontal scroll, or list */}
```

### Product Listing Page (PLP) Pattern
```tsx
<TopAppBar titleMode="title" title="Hamburgers" showBackButton showBag />
<Tabs type="scrollable" tabs={categories} ... />
<div className="grid grid-cols-2 gap-wds-12 px-wds-16 py-wds-12" style={{ alignItems: 'stretch' }}>
  {items.map(item => <MenuCard key={item.id} ... />)}
</div>
```

### Settings / Account Pattern
```tsx
<TopAppBar titleMode="title" title="Account" titlePlacement="left" />
<SectionHeader title="Preferences" size="small" />
<ListRow headline="Notifications" trailing="switch" ... />
<ListRow headline="Payment Methods" trailing="icon" leading="icon" ... />
```

### Single Product Page (SPP) Pattern
```tsx
<TopAppBar titleMode="title" title="Hamburgers" titlePlacement="center" titleWeight="semibold" showBackButton showBag />
<div className="flex-1 overflow-y-auto">
  {/* Hero product image */}
  <img src={product.imageSrc} ... />
  <ProductHeader title={product.name} price={product.price} calories={product.calories} sizeLabel="Med" ... />
  <SectionHeader title="Add Extras" size="small" />
  {ingredients.map(ing => <IngredientCollapse key={ing.id} ... />)}
</div>
<OrderBar quantity={qty} onQuantityChange={setQty} onAddToBag={handleAdd} />
```

### Bottom Sheet Selection Pattern (Combo Builder)
```tsx
<BottomSheet isOpen={...} height="60%" scrollable>
  <div className="px-wds-16">
    <SectionHeader title="Choose a Drink" size="small" padding={false} />
    <div className="flex gap-wds-12 overflow-x-auto py-wds-8">
      {drinks.map(d => <ItemSelector key={d.id} ... />)}
    </div>
  </div>
</BottomSheet>
```

---

## Spacing Conventions

### Between sections on a screen
- Use `SectionHeader` to introduce each section (includes its own top/bottom padding)
- Between card grids and next section: `py-wds-12` or `py-wds-16`

### Within sections
- Card grid gap: `gap-wds-12`
- List rows: no gap needed (dividers handle separation)
- Horizontal scroll items: `gap-wds-12`

### Screen-level padding
- Content padding: `px-wds-16` (16px left/right)
- Full-bleed elements (TopAppBar, Tabs, ListRow standard): no horizontal padding (they handle their own)
- Cards and grids: wrap in `px-wds-16`

### Vertical rhythm
- Between major sections: 24px (handled by SectionHeader padding)
- Between minor elements: 8-12px
- Inside cards: 12px padding

---

## Image Paths Reference

| Type | Path Pattern | Example |
|---|---|---|
| Product photos | `/images/product-images/food_{category}_{name}_{id}.png` | `food_hamburgers_baconator_2390.png` |
| Category thumbs | `/images/category-images/category_{name}_{id}.png` | `category_combos_2492.png` |
| Nurdle illustrations | `/images/nurdles/{Name}.svg` | `Drive Thru.svg` |
| Content card banners | `/images/content-cards/content-card-{size}-placeholder-{n}.png` | |
| Logos | `/images/wendys-wave-white.svg`, `/images/rewards-logo-white.svg` | |
| Ingredient images | `/images/ingredient-images/{name}.png` (kebab-case) | `ketchup-image.png`, `applewood-smoked-bacon.png` |
| Sauce/dressing images | `/images/sauces-dressings/{name}.png` (kebab-case) | `honey-mustard-sauce.png`, `bbq.png` |
| Icons (mono) | `/icons/{name}.svg` with `-filled`/`-outline` variants | `home-filled.svg` |
| Icons (multi-color) | `/icons/{name}.svg` | `rewards-simple.svg`, `bag-red.svg` |

**Image naming convention:** All images use kebab-case lowercase. When adding new images, rename from the source format (e.g., "Ketchup Image.png" → "ketchup-image.png").

---

## Data Hooks

Access all data through hooks, never import JSON directly.

### useMenuData()
```tsx
const { getAllCategories, getProductById, getIngredientsForProduct, getAddOnGroupsForProduct, getProductImagePath } = useMenuData();

// Get all categories for menu grid
const categories = getAllCategories();

// Get a product and its ingredients
const product = getProductById('2390'); // Baconator
const ingredients = getIngredientsForProduct('2390'); // returns Ingredient[]
const addOnGroups = getAddOnGroupsForProduct('2390'); // returns { group, addOns }[]

// Image path helper
const imagePath = getProductImagePath('food_hamburgers_baconator_2390.png');
```

### useLocationData()
```tsx
const { getAllLocations, getNearestLocations, getFormattedAddress } = useLocationData();
const nearest = getNearestLocations(3);
const address = getFormattedAddress(nearest[0]); // "670 Bethel Rd, Columbus, OH 43214"
```

### useOfferData()
```tsx
const { getActiveOffers, getAvailableOffers } = useOfferData();
const activeOffers = getActiveOffers(); // available + progress
```

### useUserData()
```tsx
const { getUser, getRewardsPoints, getRecentOrders, getDefaultPayment } = useUserData();
const user = getUser(); // Alex Johnson
const points = getRewardsPoints(); // 2450
```
