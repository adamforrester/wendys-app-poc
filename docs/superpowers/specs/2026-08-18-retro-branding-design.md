# Retro Branding — Design

**Date:** 2026-08-18
**Status:** Approved
**Figma:** `Retro Branding 26-27` (file key `cLIW7vjQzHNqDPuT9CBEQr`)

## Goal

Wendy's is reviving its historic yellow-and-red branding. This adds a retro theme to the
prototype behind feature flags so stakeholders can toggle between the current teal-accented
look and the retro look during demos. Nothing about the current theme changes when the flags
are off.

Five surfaces are in scope:

1. A yellow top app bar with black content and a new red retro logo
2. Two new splash animations (a GIF and an MP4) alongside the existing Lottie
3. Red accents replacing every teal accent — buttons, links, controls, bottom nav
4. The Account hero — retro cameo on a yellow background
5. A master toggle that flips all of the above at once

Explicitly **out of scope**: the Wendy's Fresh font swap and any other typography change
(deferred to a fast follow), the retro paper-bag packaging illustration, and any content
change such as the extra "Notifications" row visible in the Figma Account mock.

## Figma findings that shaped this design

Three things came out of the Figma inspection that are worth recording, because they mean the
retro app bar is **not** a design-system variant we can mirror one-for-one.

**There is no yellow variant in the DS component.** The `Top app bar` component set exposes
`Background = Red | White | Transparent | Transparent onBrand`. The retro instances sit on
`Background=Red` with a local fill override plus a local override on the title color. So the
retro app bar is a design-file composition, and this spec defines the contract.

**The yellow token is named `color/text/brand/retro/default`.** It lives in the `Fresh Theme`
collection of the `Fresh DS Foundations` library, resolves to `rgb(254, 242, 0)` (`#fef200`) in
both modes, and is stored as a raw value — it is not aliased to a Primitives variable. Both
yellow fills inspected (the Account app bar and the Account hero) bind to it. The name says
`text/` but every observed use is a background. We mirror it as
`--color-bg-brand-retro-default` because that reflects how it is used; the Figma name is
recorded in a comment so the two can be reconciled later.

**Retro red and retro black are tokens we already have.** `--color-red-500` is
`rgb(200, 16, 46)`, byte-identical to Figma's `#c8102e`, and `--color-gray-1100` is
`rgb(25, 26, 27)`, byte-identical to `#191a1b`. So the only new color in the entire feature is
the yellow.

Two places where the Figma file is deliberately not followed, per Adam:

- The retro Account app bar sets `Trailing buttons = false`, hiding the Points button. We keep
  Points, Find, and Bag behaving exactly as they do today and only swap their colors.
- The bottom nav in the retro Account frame is an untouched default instance (white center
  button, gray/disabled burger icon, still-teal active icon). We ignore it and apply the
  teal → red remap to all nav variants.

## A. Tokens

### A1. The yellow

One addition to `src/styles/tokens.css`, in the semantic background block:

```css
/* Figma: color/text/brand/retro/default (Fresh Theme). Named bg here because
   every use is a background. Raw value in Figma — not aliased to a primitive. */
--color-bg-brand-retro-default: rgb(254, 242, 0);
```

No new primitive. The existing yellow primitives (`--color-yellow-100` … `-1000`) are all a
pale lemon and none of them match `#fef200`; adding a primitive that nothing else references
would be noise.

### A2. The red remap

A scoped class in `tokens.css` that re-points the `brand-secondary` family at the red ramp.
The main tokens resolve to the same primitives their `brand-primary` counterparts already use,
so retro secondary becomes visually identical to today's primary and no new color decisions
are introduced:

```css
.theme-retro-red {
  --color-text-brand-secondary-default: var(--color-red-500);
  --color-text-brand-secondary-hover: var(--color-red-600);
  --color-text-brand-secondary-active: var(--color-red-700);
  --color-bg-brand-secondary-default: var(--color-red-500);
  --color-bg-brand-secondary-hover: var(--color-red-600);
  --color-bg-brand-secondary-active: var(--color-red-700);
  --color-border-brand-secondary-default: var(--color-red-600);
  --color-border-brand-secondary-hover: var(--color-red-700);
  --color-border-brand-secondary-active: var(--color-red-800);
  --color-icon-brand-secondary-default: var(--color-red-600);
  --color-icon-brand-secondary-hover: var(--color-red-700);
  --color-icon-brand-secondary-active: var(--color-red-800);

  /* Inverse (lighter, for use on dark surfaces) — positional 1:1 with the
     blue ramp indices rather than the primary mapping above. */
  --color-text-brand-secondary-inverse-default: var(--color-red-400);
  --color-text-brand-secondary-inverse-hover: var(--color-red-500);
  --color-text-brand-secondary-inverse-active: var(--color-red-600);
  --color-icon-brand-secondary-inverse-default: var(--color-red-400);
  --color-icon-brand-secondary-inverse-hover: var(--color-red-500);
  --color-icon-brand-secondary-inverse-active: var(--color-red-600);

  /* Links */
  --color-text-link-default: var(--color-red-500);
  --color-icon-link-default: var(--color-red-500);
}
```

**Why a scoped class instead of a prop.** 28 non-story source files reference
`brand-secondary` tokens. Threading a color-scheme prop through all of them would be a large,
invasive change that has to be maintained forever. Redefining the custom properties on an
ancestor gets the same result with zero component edits, because CSS custom properties are
re-substituted per element: the `@theme` aliases in `app.css` (e.g.
`--color-wds-bg-brand-secondary: var(--color-bg-brand-secondary-default)`) resolve against
each element's own inherited value, so Tailwind utilities inside the subtree pick up red
automatically.

**Do not remap `--color-bg-secondary-default`.** It is a neutral gray, not a brand token. The
`floating-pill` nav's active pebble uses it and must stay neutral.

**`Button`'s own `colorScheme` prop is not touched.** It keeps its `'secondary' | 'primary'`
values and its `'secondary'` default. Under `.theme-retro-red` a `colorScheme="secondary"`
button simply renders red, which is the intent. The flag rename in §B is unrelated to this
prop — the old `buttonColorScheme` flag was never wired to it.

### A3. Applying the class

`DeviceFrame` owns it. Every route in `App.tsx` renders inside `DeviceFrame` — including
`/voice`, the SPP, and the bag, which sit outside `AppShell` — so one attachment point covers
the whole app. `DeviceFrame` has two return branches (compact and framed); the class goes on
the root element of the compact branch and on the inner 390×844 phone element of the framed
branch, so the surrounding page background is unaffected.

## B. Feature flags

Four flags in `src/config/featureFlags.ts`:

| Key | Values | DevTools label | Origin |
|---|---|---|---|
| `retroBranding` | `off` \| `on` | Retro Branding | new (master) |
| `topAppBarStyle` | `auto` \| `classic` \| `retro` | Top App Bar | **replaces** `locationSelectionLayout` |
| `accentColor` | `auto` \| `teal` \| `red` | Red Accents | repurposes `buttonColorScheme` |
| `splashAnimation` | `auto` \| `current` \| `retro-yellow` \| `retro-newsprint` | Splash Animation | repurposes existing |

All default to `off` / `auto`, so the app looks exactly as it does today out of the box.

`auto` means "follow the master." A single resolver lives beside the flags:

```ts
export interface ResolvedRetro {
  topAppBar: 'classic' | 'retro';
  accent: 'teal' | 'red';
  splash: 'current' | 'retro-yellow' | 'retro-newsprint';
  accountHero: 'classic' | 'retro';
}

export function resolveRetro(flags: FeatureFlags): ResolvedRetro;
```

Consumers read resolved values and never reason about `auto`. Resolution rules:

- `topAppBarStyle: 'auto'` → `retro` when `retroBranding === 'on'`, else `classic`
- `accentColor: 'auto'` → `red` when `retroBranding === 'on'`, else `teal`
- `splashAnimation: 'auto'` → `retro-yellow` when `retroBranding === 'on'`, else `current`
- `accountHero` has **no flag of its own** — it is `retro` iff `retroBranding === 'on'`

The Account hero deliberately gets no toggle: the top app bar was the only new per-surface
flag needed, and the hero is a small enough surface that the master flag is sufficient. When
`retroBranding` is `on`, `auto` picks `retro-yellow` as the splash because it is the more
literal expression of the yellow-and-red revival; `retro-newsprint` is reachable by setting
the flag explicitly.

`locationSelectionLayout` and its `LocationSelectionLayout` type are deleted outright — no
consumer reads them. `buttonColorScheme` / `ButtonColorScheme` are renamed to `accentColor` /
`AccentColor` because the scope is wider than buttons; the DevTools label makes that clear.
The `stub: true` marker comes off all three repurposed flags as each gains a consumer.

## C. Top app bar

`TopAppBar` gains one prop:

```ts
/** Color scheme — defaults to the resolved `topAppBarStyle` flag. An explicit
 *  value wins, which is what makes the variant selectable in Storybook. */
colorScheme?: 'classic' | 'retro';
```

Defaulting to the flag means none of the 11 screens that render `TopAppBar` need to change.
Retro swaps four things:

| Element | Classic | Retro |
|---|---|---|
| `<header>` background | `--color-bg-brand-primary-default` | `--color-bg-brand-retro-default` |
| Title (both placements) | `text-onbrand-default` | `text-primary-default` |
| Back-arrow mask | `icon-onbrand-default` | `icon-primary-default` |
| Points / Find `Button variant` | `text-reversed` | `text` |
| Default `logoSrc` | `/images/wendys-wave-white.svg` | `/images/wendys-retro-logo.svg` |

Switching the trailing buttons from `text-reversed` to `text` is what turns their labels and
the masked `location-filled` icon black. This is why retro must **not** be implemented by
remapping the `onBrand` tokens: `onBrand` white is still correct for labels on red filled
buttons everywhere else in the app.

The retro logo is red (`#c8102e`, bound to `bg/brand/primary/default` in Figma) and Figma
renders it at 40px tall, which matches the existing `h-[40px] w-auto`. Home picks it up with
no change because it relies on the default `logoSrc`.

Three knock-on changes:

- **`BagButton` inverts.** Figma's retro bag is variant `Type=onBrand-primary`: a red pill
  (`bg-brand-primary-default`), the `bag-light` icon, and a white count
  (`text-onbrand-default`). Today's classic button is the reverse — white pill, `bag-red.svg`,
  red count. `BagButton` takes the same `colorScheme` prop, forwarded by `TopAppBar`. It
  continues to return `null` at `count === 0`.
- **Status bar tint flips to `dark`.** Figma's retro bar draws the clock, wifi, and battery in
  black. `TopAppBar` owns this rather than the screens: it calls the `StatusBarModeContext`
  setter with `'dark'` when `colorScheme` resolves to `retro` and `'light'` when it resolves to
  `classic`. Putting it in the component means none of the 11 consuming screens change, and the
  tint can never drift out of sync with the bar color. Screens that already set their own mode
  (`/voice`) are unaffected because they do not render `TopAppBar`.
- **Loading bar goes red.** The `showLoadingBar` track is `bg-white/20` with a white bar, both
  invisible on yellow. Figma hides the loading bar in every retro instance, so it is
  unspecified there. In retro the track becomes `--color-red-200` and the bar
  `--color-bg-brand-primary-default` — both solid tokens, no opacity modifier, so the rule
  against hardcoded color values holds.

`MediumTopAppBar` and `TransparentTopBar` are out of scope.

### Storybook

Adam asked specifically for the app bar to be toggleable in Storybook. Two changes:

1. Rename `.storybook/preview.ts` to `.storybook/preview.tsx` and add a global
   `FeatureFlagsProvider` decorator. `useFeatureFlags` throws outside a provider, so any
   flag-reading component breaks in Storybook without this. Existing stories already wrap in
   `MemoryRouter` + `BagProvider`, so this is the only remaining gap.
2. Add `colorScheme` to `TopAppBar.stories.tsx` `argTypes` as a radio control, and add a
   `Retro` story showing the yellow bar with logo, Points, Find, and Bag together.

## D. Splash animations

No format conversion is needed. `SplashScreen` already supports all three formats via
`animationType: 'lottie' | 'image' | 'video'` plus `animationSrc`, and the video branch
already sets `autoPlay muted playsInline`. `App.tsx` selects the props from the resolved flag:

| Resolved value | `animationType` | Asset |
|---|---|---|
| `current` | `lottie` | `src/animations/lottie/splash.json` (unchanged) |
| `retro-yellow` | `image` | `/animations/retro-yellow.gif` |
| `retro-newsprint` | `video` | `/animations/retro-newsprint.mp4` |

The GIF is authored at exactly 390×844 — the prototype's viewport — with roughly 196 frames,
at 904K. The MP4 is H.264, 558K. Both play in the existing cameo → animation → fadeout →
done phase sequence with `animationDuration` left at its default.

## E. Account hero

`AccountScreen`'s hero block, per the Figma measurements (`Cameo & Name`, 390×218):

| Property | Classic | Retro |
|---|---|---|
| Background | `--color-bg-brand-primary-default` | `--color-bg-brand-retro-default` |
| Padding | `24px 16px 32px` | `0 16px 16px` |
| Gap (cameo → greeting) | — | `16px` |
| Cameo | `/images/cameo-fullColor-withTrademark.svg`, 131×131 | `/images/retro-cameo.svg`, 137×154 |
| Greeting color | `text-onbrand-default` | `text-primary-default` |

The retro cameo renders at its native SVG size and sits flush against the app bar with no top
padding: 154 + 16 gap + 32 line height + 16 bottom padding = 218, matching Figma exactly.

Per Adam's instruction, the greeting's font weight is **unchanged** even though the Figma mock
shows SemiBold where we render Black — all typography is deferred to the fast follow. Only the
color changes here.

The Account app bar keeps `showPoints` exactly as today.

## F. Assets

Source files live in `/Users/aforrester/Documents/Wendy's/Brand/retro branding`. Per repo
convention they are copied into `assets/` and then into `public/`:

| Source | `assets/` | `public/` |
|---|---|---|
| `wendys-retro-logo.svg` | `assets/images/` | `public/images/wendys-retro-logo.svg` |
| `retro-cameo.svg` | `assets/images/` | `public/images/retro-cameo.svg` |
| `retro-animation-v1.gif` | `assets/animations/` | `public/animations/retro-yellow.gif` |
| `retro-animation-v2.mp4` | `assets/animations/` | `public/animations/retro-newsprint.mp4` |

The animations are renamed on copy so the filename states which variant it is rather than a
version number: v1 is "retro yellow", v2 is "retro newsprint".

## Accepted consequences

Two known costs of the full teal → red remap, both accepted rather than solved:

**Red and teal currently encode opposite meanings in two places.** The SPP "Your Changes"
summary (M9) uses red pills for removals and teal pills for additions; the bag and offers
screens follow similar conventions. In retro both collapse to red and the distinction is lost.
Revisit if it reads badly in a demo.

**The Points icon does not recolor.** `rewards-simple.svg` is a multi-color `<img>`
(`#AE1B22` + `#FFE097`), not a masked mono icon, so it keeps its dark-red and cream on the
yellow bar. The cream sits at low contrast against `#fef200`. Everything else in the bar goes
black cleanly. Ships as-is; a retro recolor of the asset is the fix if it bothers anyone.

## Verification

- `npm run build` must pass — Vercel runs `tsc -b` and fails the deploy on unused imports,
  which matters here because a flag and a type are being deleted.
- With all flags at their defaults, every screen must be pixel-unchanged from today.
- With `retroBranding: 'on'`, walk Home → Offers → Order → Menu → PLP → SPP → Bag → Earn →
  Account and confirm: yellow bars with black content and the retro logo, red buttons and
  links, red bottom-nav accents in all three nav variants, the retro Account hero, and no
  white-on-yellow text anywhere.
- Each per-surface flag must override the master independently in both directions.
- Storybook: the `TopAppBar` `colorScheme` control switches between classic and retro.

## Follow-ups

- Font swap (Wendy's Fresh → alternate) and the greeting-weight change — one token in
  `app.css` plus a typography review
- Reconcile the Figma variable name: either rename it to `color/bg/brand/retro/default` or
  add a `bg` alias, then align `tokens.css`
- Retro recolor of `rewards-simple.svg`
- Retro treatment for `MediumTopAppBar` and `TransparentTopBar` if a retro screen needs them
