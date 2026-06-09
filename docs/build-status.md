# Build Status

What's done, what's next, and per-domain progress.

## Components Built (42)

Button, TopAppBar, BottomTabBar, BottomSheet, Spinner, Label, HelperMessage, RadioButton, Checkbox, Toggle, ListRow, ContentCard, CategoryCard, MenuCard, DeviceFrame, StatusBar, BagButton, Tabs, SegmentedControl, Snackbar, SectionHeader, ProductHeader, ItemSelector, Chip, Counter, IconButton, OrderBar, IngredientCollapse, IngredientCard, OrderLocationCard, SplashScreen, IngredientTable, MediumTopAppBar, HeroImage, TransparentTopBar, Dialog, ActionCard, BagItemCard, OrderSummary, DonationSection, TextField, HomeLocationCard

### Remaining Components

SearchBar, EmptyState, StatusBadge, LocationMap, OfferTile

## Screens Built (14)

- **Splash Screen** — cameo logo → Lottie animation → fade to app
- **Home Screen (auth)** — `HomeLocationCard` (geo-driven), hero banner, offers section with real data, privacy policy link. Sticky TopAppBar (no Find button).
- **Offers Screen** — Offers tab (segmented control, promo code button, available/unavailable/redeemed sections) + Rewards tab (2-up grid, 21 items)
- **Order Screen** (`/order`) — Mapbox map, BottomSheet with OrderLocationCards, Pickup/Delivery toggle. Pickup methods: Drive Thru / Dine In / Carryout.
- **Delivery Screen** (`/order/delivery`) — Static landing page from the Pickup/Delivery toggle
- **Menu Category Screen** (`/order/menu`) — daypart-aware category grid (14 all-day, 9 breakfast)
- **Menu Product List (PLP)** (`/order/menu/:slug`) — scrollable category tabs, 2-up MenuCard grid
- **Single Product Page (SPP)** (`/order/menu/:slug/:productId`) — modular shell with Add to Bag → snackbar → location confirmation gate
- **Earn Screen** (`/earn`) — QR code placeholder, points display
- **Account Screen** (`/account`) — red hero, 7 ListRows
- **Developer Tools** (`/account/dev-tools`) — auto-generated flag toggles
- **Location Confirmation** (`/order/confirm-location`) — static map, store details, fulfillment selector
- **Bag Screen** (`/order/bag`) — pickup/payment/time, BagItemCards, ActionCard carousel, Round Up & Donate, OrderSummary, sticky CTA
- **Voice Ordering Screen** (`/voice`) — full-screen voice-first experience. See [`src/features/voice-ordering/README.md`](../src/features/voice-ordering/README.md).

## Build Priority (from PRD)

1. ~~**Foundation:** Scaffolding, tokens, core components~~ — **DONE**
2. **Order flow:** ~~Location Selection → Menu Categories → PLP → SPP~~ → Bag → Checkout → Confirmation
3. ~~**Home & Auth:** Home (auth), Login~~ — DONE
4. **Offers & Polish:** ~~Offers list~~, edge cases, empty/error/loading states

## SPP Module Status

| Module | Status | Notes |
|---|---|---|
| M1: Hero Image | ✅ Done | All products |
| M2: Product Header | ✅ Done | Name, favorite, price/calories |
| M3: Price & Calories | ✅ Done | Standard + combo variants |
| M4: Nutrition Link | ✅ Done | Scrolls to nutrition tabs |
| M5: Size Selector | ✅ Done | S/M/L standard + Jr/S/M/L Frosty |
| M6: Make it a Combo | ✅ Done | Conditional on single items in combo-eligible categories |
| M7: Included Accompaniment | ✅ Done | Salad dressings + nugget/tender sauces |
| M8: Featured Upsell Card | ✅ Done | ActionCard with isAdded/onAdd/onRemove |
| M9: "Your Changes" Summary | ✅ Done | Red pills (removals) + teal pills (additions) + Reset |
| M10: What's On It | ✅ Done | 3-column tiles, editable/removable/display states |
| M11: Flavor Selector | ✅ Done | Freestyle drinks only |
| M12: Add Extras | ✅ Done | Counter + chips + toggle modifiers |
| M13: Nutrition/Ingredients Tabs | ✅ Done | Allergens + IngredientTable + text |
| M14: Sticky OrderBar | ✅ Done | Quantity stepper + Add button |

## SPP Product Type Coverage

| Product Type | Status | Modules Active |
|---|---|---|
| Hamburgers | ✅ Full | M1-4, M6, M10, M12, M13-14 |
| Chicken sandwiches | ✅ Full | M1-4, M6, M10, M12, M13-14 |
| Breakfast biscuits | ✅ Full | M1-4, M6, M10, M12, M13-14 |
| Breakfast croissants | ✅ Full | M1-4, M6, M10, M12, M13-14 |
| Breakfast burritos | ✅ Full | M1-4, M6, M10, M12, M13-14 |
| Nuggets/Tenders | ✅ Full | M1-4, M6, M7, M12, M13-14 |
| Salads | ✅ Full | M1-4, M7, M10, M12, M13-14 |
| Frosty | ✅ Full | M1-4, M5, M10, M12, M13-14 |
| Coffee | ✅ Full | M1-4, M5, M10, M13-14 |
| Beverages | ✅ Full | M1-4, M5, M11, M13-14 |
| Fries & Sides | ✅ Full | M1-4, M5, M10, M12, M13-14 |
| Bakery | ✅ Bare minimum | M1-4, M13-14 |
| Non-food (Key Tags) | ✅ Bare minimum | M1-4, M13-14 |
| Value/Deals | ✅ Full | Same as parent category items |
| Combos (all) | ✅ Populated layout | Component cards, "Price in Bag", combo size selector. Combo wizard not yet built. |
| Kids Meals | ✅ Populated layout | Same combo pattern |

## Voice Ordering Status

Authoritative status table lives in [`src/features/voice-ordering/README.md`](../src/features/voice-ordering/README.md). Headline: live end-to-end with Anthropic + ElevenLabs, push-to-talk + word-by-word highlight, geo-driven nearest store, ZIP fallback fence, delivery routing fence.

## Open Questions (from PRD)

See `assets/wendys-prototype-prd.md` § 8 for the full list. Key unresolved items:

- Fulfillment method — selected at location screen or later?
- PLP "Add to Bag" on simple items — on card or always through SPP? (Currently always through SPP)
- Location change after items in bag — clear, keep, or warn?
- Mapbox access token — Adam to create free-tier account when ready

## Next Session

~~**Visual pickup-method tiles on `/voice`.**~~ ✅ Shipped. Three `ItemSelector`s render between the agent text and the lottie button when `permission === 'granted'` and no fulfillment method is confirmed yet. Tap dispatches `SET_FULFILLMENT` + queues a synthetic `[system: pickup_method_selected: <id>]` nudge through the conversation hook's existing nudge drain — same path the agent's location fence uses, so voice and tap stay in lock-step. Voice→tile sync runs via a new `set_fulfillment` action on the existing `location` fence. The matching tile pulses + flashes its checkmark for 600ms on null→set transition (whether tap- or voice-driven), then the row fades out via AnimatePresence.

Next-up items in priority order:

- ~~**Read-back of location + pickup method at order close**~~ ✅ Shipped. Closing turn now reads "X items for [pickup method] at [store name] — you'll see it in your bag." Method id is mapped to natural speech (`drive-thru` → "drive thru" etc.); store name comes from runtime context. Falls back to "X items for pickup" when method/store are missing.
- ~~**Build-as-you-go visual draft order**~~ ✅ Shipped. New `\`\`\`draft` fence (full-state per turn, with stable `draft_id` for tile identity) + voice-local draft state in `useClaudeConversation`. New `VoiceDraftItemTile` renders single items as one image circle and combos as a 3-circle cluster (entrée + side + drink, semantic-menu resolved with generic fallback). Framer Motion `layout` morphs tiles in place when the same item changes shape across turns (single → combo → drink picked → size upgraded). Atomic transfer to BagContext on Review tap; navigating away discards the draft.
- ~~**Replace the 5 mock locations** in `src/data/locations.json` so Order tab + Confirm Location reflect the real picked store everywhere.~~ ✅ Shipped. Order tab, Location Confirmation, Bag pickup row, and the menu Pickup Location header now bind to a new `useResolvedLocations()` hook that prefers `LocationContext.selectedLocation` + the new `LocationContext.candidates` (top-5 ranked nearby) and falls back to the 5 mocks pre-geo. Home dispatches the candidate list when geo grants; voice's ZIP fence dispatches it after `resolveByZip`. DevTools picker still binds to the mocks (it's a dev override knob). Voice-local draft state, atomic transfer to `BagContext` on Review, combo viz with three image circles, in-place modifications.
- **Replace the 5 mock locations** in `src/data/locations.json` so the rest of the app sees the real picked store everywhere (Order tab Mapbox map, Confirm Location screen).
- **FAB icon + final placement** — Adam to provide the icon.
- **Bag-items-from-prior-session labeling on `/voice`** — should we tell the user "you have items from before"?
- **iOS Safari STT fallback** — Whisper-via-proxy.
