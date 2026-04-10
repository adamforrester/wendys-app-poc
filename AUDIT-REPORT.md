# Component Audit Report — Wendy's App Prototype
**Date:** April 4, 2026
**Scope:** 29 components, 25 story files, coding patterns, accessibility, consistency
**Status:** Sprints 1-3 COMPLETE. Sprint 4 (Storybook gaps) deferred.

## Summary

| Category | High | Medium | Low | Good |
|---|---|---|---|---|
| Accessibility | 3 | 2 | 4 | — |
| Consistency | 1 | 1 | 1 | 1 |
| Pattern | — | 1 | 1 | 2 |
| Storybook | — | 2 | — | — |

**Positive findings:** Mono icon pattern is consistent across 20+ components. Multi-color icon pattern is consistent. `disabled` prop naming is consistent. Color token usage is mostly correct. Type exports are mostly consistent.

---

## HIGH SEVERITY

### H-1. `<div onClick>` used instead of `<button>` for interactive elements
**Category:** Accessibility
**Components:** ContentCard, ListRow
**Issue:** Both use `<div onClick={onPress} role="button" tabIndex={0}>` — missing keyboard handling (Enter/Space). Screen readers will announce it as a button but keyboard users can't activate it.
**Fix:** Replace with `<button>` when `onPress` is provided.

### H-2. Chip dismiss target has no keyboard support
**Category:** Accessibility
**Component:** Chip
**Issue:** The dismiss icon is a `<div onClick>` with no `role`, `tabIndex`, `aria-label`, or keyboard handler.
**Fix:** Replace with `<button aria-label="Dismiss">`.

### H-3. `onPress` vs `onClick` naming inconsistency
**Category:** Consistency
**Components:** 8 use `onPress`, 2 use `onClick`, rest use domain-specific names
**Issue:** No consistent convention for the primary tap handler prop.
**Recommendation:** Standardize on `onPress` (mobile semantics, matches 8 existing components) or `onClick` (web standard, matches HTML). The form controls using `onChange` and domain-specific names like `onAddToBag` are fine as-is.
**Decision needed from Adam.**

### H-4. IngredientCollapse has nested `<button>` inside `<button>`
**Category:** Accessibility
**Component:** IngredientCollapse
**Issue:** The entire row is a `<button>` with a Checkbox (also a `<button>`) inside it. Invalid HTML. The `stopPropagation` workaround handles clicks but not keyboard or assistive tech.
**Fix:** Change outer row to `<div role="button" tabIndex={0}>` with keyboard handler, OR restructure with CSS grid positioning.

---

## MEDIUM SEVERITY

### M-1. Redundant `cursor-pointer` on all `<button>` elements
**Category:** Pattern
**Components:** Nearly all (19+ components)
**Issue:** Every `<button>` includes `cursor-pointer`. Buttons already show pointer cursor by default.
**Fix:** Add global `button { cursor: pointer; }` to `app.css` and remove from components. Keep `disabled:cursor-not-allowed`.

### M-2. Missing Storybook story files
**Category:** Storybook
**Components:** AppShell, DeviceFrame/StatusBar, Spinner
**Fix:** Add basic stories for each.

### M-3. Missing Playground stories with Controls
**Category:** Storybook
**Components:** BottomSheet, BottomTabBar, OrderBar, Snackbar, Tabs, SegmentedControl
**Issue:** These have stories but no `Playground` with `args`-based controls.
**Fix:** Add Playground story to each.

### M-4. Some hardcoded color values
**Category:** Pattern
**Components:** DeviceFrame, BottomSheet, TopAppBar, BottomTabBar
**Issue:** `#e5e5e5`, `#1a1a1a`, `rgba(0,0,0,0.5)` etc.
**Assessment:** Most are acceptable (phone bezel, scrim overlay, system chrome). Consider extracting scrim opacity to a shared constant for reuse.

### M-5. BottomSheet needs Escape key to close
**Category:** Accessibility
**Component:** BottomSheet
**Issue:** No keyboard mechanism to close the sheet. Scrim click works but is `aria-hidden`.
**Fix:** Add `onKeyDown` handler for Escape key.

### M-6. Props interfaces not exported on some components
**Category:** Consistency
**Components:** BagButton, StatusBar, DeviceFrame, Spinner
**Fix:** Change `interface` to `export interface` for all props types.

---

## LOW SEVERITY

### L-1. `aria-label` not required on standalone controls
**Category:** Accessibility
**Components:** Checkbox, RadioButton, Toggle, IconButton
**Issue:** `aria-label` is optional. When used without a visible label, it's the only identifier.
**Assessment:** Consumer responsibility. Document the pattern.

### L-2. SegmentedControl `role="radiogroup"` lacks `aria-label`
**Category:** Accessibility
**Fix:** Add optional `aria-label` prop.

### L-3. Tabs `role="tablist"` lacks `aria-label`
**Category:** Accessibility
**Fix:** Add optional `aria-label` prop.

### L-4. Spinner props interface not exported
**Category:** Consistency
**Fix:** Add `export` keyword.

---

## NO ACTION NEEDED (Confirmed Good)

- **Mono icon pattern** — consistent mask-image approach across all components
- **Multi-color icon pattern** — consistent `<img>` approach
- **`disabled` prop naming** — consistently `disabled` (not `isDisabled`)
- **Color token usage** — inline `var()` for conditional, Tailwind for static
- **Form control naming** — `onChange` consistently used for Checkbox, RadioButton, Toggle, Counter

---

## ACTION PLAN

### Sprint 1 — Accessibility Blockers (do first)
| # | Item | Components | Effort |
|---|---|---|---|
| 1 | H-1: `<div onClick>` → `<button>` | ContentCard, ListRow | Small |
| 2 | H-2: Chip dismiss → `<button>` | Chip | Small |
| 3 | H-4: Nested button fix | IngredientCollapse | Medium |
| 4 | M-5: Escape key for BottomSheet | BottomSheet | Small |

### Sprint 2 — API Consistency (needs decision)
| # | Item | Components | Effort |
|---|---|---|---|
| 5 | H-3: Standardize onPress/onClick | 10+ components | Medium |
| 6 | M-6: Export all props interfaces | 4 components | Small |
| 7 | L-2, L-3: aria-label on containers | SegmentedControl, Tabs | Small |

### Sprint 3 — Code Quality
| # | Item | Components | Effort |
|---|---|---|---|
| 8 | M-1: Global cursor-pointer rule | app.css + all components | Medium |
| 9 | M-4: Extract scrim constant | BottomSheet + future modals | Small |

### Sprint 4 — Storybook
| # | Item | Components | Effort |
|---|---|---|---|
| 10 | M-2: Missing story files | AppShell, DeviceFrame, Spinner | Small |
| 11 | M-3: Missing Playground stories | 6 components | Medium |
