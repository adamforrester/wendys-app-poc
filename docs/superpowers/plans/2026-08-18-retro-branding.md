# Retro Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable yellow-and-red retro theme to the prototype — yellow top app bar with a new retro logo, two new splash animations, every teal accent turned red, and a retro Account hero — behind four feature flags with a master switch.

**Architecture:** A `retroBranding` master flag plus three per-surface override flags, collapsed by one pure resolver function (`resolveRetro`) that consumers read instead of reasoning about `auto` themselves. The red remap is a scoped CSS class that redefines the `brand-secondary` custom properties on an ancestor, so 28 files that reference those tokens change color with zero component edits. The yellow app bar is a `colorScheme` prop on `TopAppBar` that defaults to the resolved flag, so no screen changes and Storybook can still force a variant.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4 (CSS-first `@theme`), Framer Motion, Storybook 10, Vitest 4.

**Spec:** [`docs/superpowers/specs/2026-08-18-retro-branding-design.md`](../specs/2026-08-18-retro-branding-design.md)

## Global Constraints

These apply to every task below.

- **Token-only styling.** Every color, spacing, radius, border-width and shadow references a design token via a CSS custom property. Never hardcode hex/px/rgb in a component. If a value doesn't exist as a token, flag it rather than hardcoding.
- **No dynamic Tailwind class interpolation.** Tailwind v4's scanner needs full static class strings in the source. Use explicit conditional returns of complete strings — never `` `bg-[var(--color-bg-brand-${x}-default)]` ``.
- **Token names are unprefixed.** `--color-red-500`, not `--wds-color-red-500`. The active token file is `src/styles/tokens.css` (light theme only).
- **`npm run build` must pass before any push.** Vercel runs `tsc -b` and fails the deploy on unused imports and unused locals. `tsc --noEmit` is more lenient — don't rely on it.
- **Defaults must be inert.** With every flag at its default value, every screen must be pixel-identical to today. This is the single most important acceptance criterion.
- **Commit after every task.** Small focused commits, not one batch at the end.
- **Exact retro values:** yellow `rgb(254, 242, 0)` (`#fef200`); retro red is the existing `--color-red-500` (`rgb(200, 16, 46)`); retro black is the existing `--color-gray-1100` (`rgb(25, 26, 27)`).
- **Retro asset source directory:** `/Users/aforrester/Documents/Wendy's/Brand/retro branding` (note the apostrophe and the space — always quote these paths in shell commands).

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/config/featureFlags.ts` | Flag types, defaults, DevTools metadata, and the `resolveRetro` resolver | 1 |
| `src/config/featureFlags.test.ts` | **Create.** Unit tests for `resolveRetro` | 1 |
| `vite.config.ts` | **Modify.** Add a `unit` Vitest project alongside the existing `storybook` one | 1 |
| `package.json` | **Modify.** Add the `test:unit` script | 1 |
| `.storybook/preview.tsx` | **Rename** from `preview.ts`. Add a global `FeatureFlagsProvider` decorator | 2 |
| `src/styles/tokens.css` | **Modify.** Add the yellow token and the `.theme-retro-red` scoped remap | 3 |
| `src/components/DeviceFrame/DeviceFrame.tsx` | **Modify.** Apply `.theme-retro-red` when the resolved accent is red | 3 |
| `src/components/TopAppBar/TopAppBar.tsx` | **Modify.** `colorScheme` prop; retro bg, title, back arrow, trailing variant, logo, loading bar, status-bar tint | 4 |
| `src/components/TopAppBar/BagButton.tsx` | **Modify.** `colorScheme` prop; inverted retro pill | 4 |
| `src/components/TopAppBar/TopAppBar.stories.tsx` | **Modify.** `colorScheme` control + a `Retro` story | 4 |
| `src/App.tsx` | **Modify.** Extract an `AppSplash` child that picks the splash variant from the resolver | 5 |
| `src/screens/Account/AccountScreen.tsx` | **Modify.** Retro hero background, cameo, and greeting color | 6 |
| `docs/build-status.md`, `COMPONENTS.md`, `docs/component-guide.md`, `docs/architecture.md` | **Modify.** Document the feature | 7 |

`SplashScreen.tsx` is deliberately **not** in this list. It already supports `animationType: 'lottie' | 'image' | 'video'` with `animationSrc`, and the video branch already sets `autoPlay muted playsInline`. Neither new animation needs converting and the component needs no changes.

---

### Task 1: Feature flags and the `resolveRetro` resolver

The only real logic in this feature. Everything downstream reads from it, so it gets actual unit tests.

**Files:**
- Modify: `vite.config.ts:23-44` (the `test.projects` array)
- Modify: `package.json:6-14` (the `scripts` block)
- Modify: `src/config/featureFlags.ts` (types, interface, defaults, `flagMeta`; add the resolver)
- Test: `src/config/featureFlags.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type RetroBranding = 'off' | 'on'`
  - `type TopAppBarStyle = 'auto' | 'classic' | 'retro'`
  - `type AccentColor = 'auto' | 'teal' | 'red'`
  - `type SplashAnimation = 'auto' | 'current' | 'retro-yellow' | 'retro-newsprint'`
  - `interface ResolvedRetro { topAppBar: 'classic' | 'retro'; accent: 'teal' | 'red'; splash: 'current' | 'retro-yellow' | 'retro-newsprint'; accountHero: 'classic' | 'retro' }`
  - `function resolveRetro(flags: FeatureFlags): ResolvedRetro`
  - `FeatureFlags` gains `retroBranding`, `topAppBarStyle`, `accentColor`; loses `locationSelectionLayout`, `buttonColorScheme`; `splashAnimation`'s value union changes.

**Background the implementer needs:** `src/config/featureFlags.ts` holds three parallel structures that must stay in sync — the `FeatureFlags` interface, the `defaultFeatureFlags` object, and the `flagMeta` record (typed `Record<keyof FeatureFlags, FlagMeta>`, so TypeScript enforces that every flag has metadata). `DevToolsScreen` auto-generates its toggle rows by iterating `flagMeta` **in declaration order**, and renders any flag marked `stub: true` dimmed and disabled with a "NOT WIRED" badge. Nothing else in the codebase reads `locationSelectionLayout`, `buttonColorScheme`, or `splashAnimation` — verified by grep — so changing them is safe. Note that `ButtonColorScheme` is *also* an unrelated exported type in `src/components/Button/Button.tsx`; that one stays exactly as it is.

- [ ] **Step 1: Add a `unit` Vitest project**

The existing config defines a single project named `storybook` that runs stories in a real Chromium browser via Playwright. A plain `.test.ts` file would not be picked up by it. Add a second project so unit tests can run in Node without needing browsers installed.

In `vite.config.ts`, replace the `test` block with:

```ts
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
```

- [ ] **Step 2: Add the `test:unit` script**

In `package.json`, add this line to `scripts` after `"refresh-voice-data"`:

```json
    "test:unit": "vitest run --project unit"
```

Scoping to `--project unit` keeps it from trying to launch Playwright browsers for the storybook project.

- [ ] **Step 3: Write the failing test**

Create `src/config/featureFlags.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defaultFeatureFlags, resolveRetro, type FeatureFlags } from './featureFlags';

/** Start from real defaults so a new flag can't silently break these cases. */
function flags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
  return { ...defaultFeatureFlags, ...overrides };
}

describe('resolveRetro', () => {
  it('resolves everything to classic when the master is off', () => {
    expect(resolveRetro(flags())).toEqual({
      topAppBar: 'classic',
      accent: 'teal',
      splash: 'current',
      accountHero: 'classic',
    });
  });

  it('resolves everything to retro when the master is on', () => {
    expect(resolveRetro(flags({ retroBranding: 'on' }))).toEqual({
      topAppBar: 'retro',
      accent: 'red',
      splash: 'retro-yellow',
      accountHero: 'retro',
    });
  });

  it('lets an explicit surface flag opt out while the master is on', () => {
    const resolved = resolveRetro(flags({ retroBranding: 'on', topAppBarStyle: 'classic' }));
    expect(resolved.topAppBar).toBe('classic');
    expect(resolved.accent).toBe('red');
  });

  it('lets an explicit surface flag opt in while the master is off', () => {
    const resolved = resolveRetro(flags({ accentColor: 'red' }));
    expect(resolved.accent).toBe('red');
    expect(resolved.topAppBar).toBe('classic');
  });

  it('honours both explicit splash variants regardless of the master', () => {
    expect(resolveRetro(flags({ splashAnimation: 'retro-newsprint' })).splash).toBe('retro-newsprint');
    expect(resolveRetro(flags({ retroBranding: 'on', splashAnimation: 'current' })).splash).toBe('current');
  });

  it('ties the account hero to the master with no override', () => {
    expect(resolveRetro(flags({ topAppBarStyle: 'classic', retroBranding: 'on' })).accountHero).toBe('retro');
    expect(resolveRetro(flags({ topAppBarStyle: 'retro' })).accountHero).toBe('classic');
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `resolveRetro` is not exported from `./featureFlags`, and `retroBranding` / `topAppBarStyle` / `accentColor` are not valid `FeatureFlags` keys.

- [ ] **Step 5: Replace the flag types**

In `src/config/featureFlags.ts`, delete these two lines:

```ts
export type LocationSelectionLayout = 'map-and-list' | 'list-only';
export type ButtonColorScheme = 'secondary' | 'primary';
```

Change the `SplashAnimation` line and add the three new types, so the top of the type block reads:

```ts
/* ── Feature Flag Types ── */

/** Retro branding master switch. Surface flags set to 'auto' follow it. */
export type RetroBranding = 'off' | 'on';
export type TopAppBarStyle = 'auto' | 'classic' | 'retro';
export type AccentColor = 'auto' | 'teal' | 'red';
export type SplashAnimation = 'auto' | 'current' | 'retro-yellow' | 'retro-newsprint';

export type AddToBagTransition = 'snackbar' | 'slide-to-bag' | 'full-screen-confirmation';
```

Leave every other type declaration untouched.

- [ ] **Step 6: Update the interface and defaults**

The four retro flags go first in all three structures so DevTools renders the master and its overrides as a group at the top of the list.

`FeatureFlags` becomes:

```ts
export interface FeatureFlags {
  retroBranding: RetroBranding;
  topAppBarStyle: TopAppBarStyle;
  accentColor: AccentColor;
  splashAnimation: SplashAnimation;
  addToBagTransition: AddToBagTransition;
  comboBuilderStyle: ComboBuilderStyle;
  menuCategoryLayout: MenuCategoryLayout;
  menuPLPLayout: MenuPLPLayout;
  sppLayout: SPPLayout;
  bottomNavStyle: BottomNavStyle;
  homeLocationComponent: HomeLocationComponent;
  fallbackImage: FallbackImage;
  postOrderSurprise: PostOrderSurprise;
  darkMode: DarkMode;
  loadingScenario: LoadingScenario;
  voiceOrdering: VoiceOrdering;
  voiceInputMode: VoiceInputMode;
}
```

`defaultFeatureFlags` becomes:

```ts
export const defaultFeatureFlags: FeatureFlags = {
  retroBranding: 'off',
  topAppBarStyle: 'auto',
  accentColor: 'auto',
  splashAnimation: 'auto',
  addToBagTransition: 'snackbar',
  comboBuilderStyle: 'bottom-sheet-wizard',
  menuCategoryLayout: 'current',
  menuPLPLayout: 'current',
  sppLayout: 'current',
  bottomNavStyle: 'current',
  homeLocationComponent: 'none',
  fallbackImage: 'wave',
  postOrderSurprise: 'none',
  darkMode: 'off',
  loadingScenario: 'none',
  voiceOrdering: 'live',
  voiceInputMode: 'push-to-talk',
};
```

Note `locationSelectionLayout` and `buttonColorScheme` are gone from both.

- [ ] **Step 7: Update `flagMeta`**

Delete the `locationSelectionLayout` and `buttonColorScheme` entries entirely. Delete the old `splashAnimation` entry. Insert these four as the first entries of the `flagMeta` object, before `addToBagTransition`:

```ts
  retroBranding: {
    label: 'Retro Branding',
    description: 'Master switch for the yellow-and-red retro theme. Turns on the yellow top app bar, red accents, the retro splash animation, and the retro Account hero all at once. The three flags below override it individually.',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    stub: true,
  },
  topAppBarStyle: {
    label: 'Top App Bar',
    description: 'Classic red bar with the white wave, or the retro yellow bar with black content and the retro logo. Auto follows Retro Branding.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'classic', label: 'Classic (Red)' },
      { value: 'retro', label: 'Retro (Yellow)' },
    ],
    stub: true,
  },
  accentColor: {
    label: 'Red Accents',
    description: 'Turns every teal accent red — buttons, links, checkboxes, radios, toggles, chips, segmented controls, counters, text field focus, and the bottom nav in all three variants. Auto follows Retro Branding.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'teal', label: 'Teal' },
      { value: 'red', label: 'Red' },
    ],
    stub: true,
  },
  splashAnimation: {
    label: 'Splash Animation',
    description: 'Splash screen animation. Auto follows Retro Branding and picks Retro Yellow.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'current', label: 'Current (Lottie)' },
      { value: 'retro-yellow', label: 'Retro Yellow (GIF)' },
      { value: 'retro-newsprint', label: 'Retro Newsprint (MP4)' },
    ],
    stub: true,
  },
```

All four start as `stub: true` because nothing reads them yet. Later tasks remove the marker as each gains a consumer.

- [ ] **Step 8: Add the resolver**

Append to the end of `src/config/featureFlags.ts`:

```ts
/* ── Retro Branding Resolution ── */

/**
 * Concrete retro state after collapsing the master flag and the three
 * per-surface overrides. Consumers read this and never see 'auto'.
 */
export interface ResolvedRetro {
  topAppBar: 'classic' | 'retro';
  accent: 'teal' | 'red';
  splash: 'current' | 'retro-yellow' | 'retro-newsprint';
  accountHero: 'classic' | 'retro';
}

/**
 * Collapse the retro flags into concrete values. A surface flag set to
 * 'auto' follows `retroBranding`; any other value wins outright.
 *
 * The Account hero has no flag of its own — it follows the master only.
 * The top app bar was the only new per-surface toggle the team wanted, and
 * the hero is small enough that the master is sufficient.
 */
export function resolveRetro(flags: FeatureFlags): ResolvedRetro {
  const master = flags.retroBranding === 'on';

  return {
    topAppBar:
      flags.topAppBarStyle === 'auto' ? (master ? 'retro' : 'classic') : flags.topAppBarStyle,
    accent: flags.accentColor === 'auto' ? (master ? 'red' : 'teal') : flags.accentColor,
    splash:
      flags.splashAnimation === 'auto'
        ? master
          ? 'retro-yellow'
          : 'current'
        : flags.splashAnimation,
    accountHero: master ? 'retro' : 'classic',
  };
}
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npm run test:unit`
Expected: PASS — 6 tests in `src/config/featureFlags.test.ts`.

- [ ] **Step 10: Verify the build and lint are clean**

Run: `npm run build && npm run lint`
Expected: both succeed. If `tsc -b` reports an unused type or a missing `flagMeta` key, a structure got out of sync — fix before continuing.

- [ ] **Step 11: Verify DevTools renders the new flags**

Run `npm run dev`, open `http://localhost:5173/account/dev-tools`, and confirm: "Retro Branding", "Top App Bar", "Red Accents", and "Splash Animation" appear as the first four rows, all dimmed with a "NOT WIRED" badge, and "Location Selection Layout" and "Button Color Scheme" are gone.

- [ ] **Step 12: Commit**

```bash
git add vite.config.ts package.json src/config/featureFlags.ts src/config/featureFlags.test.ts
git commit -m "Flags: retro branding master + per-surface overrides

Adds retroBranding, topAppBarStyle, accentColor and repurposes
splashAnimation, with resolveRetro() collapsing 'auto' against the master.
Retires locationSelectionLayout and renames buttonColorScheme to
accentColor since the scope is wider than buttons. All four start stubbed;
later commits un-stub them as consumers land.

Adds a 'unit' Vitest project (the existing one only runs stories in a
browser) plus npm run test:unit, and covers the resolver.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Storybook feature-flag provider

Must land before Task 4. `useFeatureFlags` throws outside a provider, so the moment `TopAppBar` reads a flag, every `TopAppBar` story would crash without this.

**Files:**
- Rename: `.storybook/preview.ts` → `.storybook/preview.tsx`, then modify

**Interfaces:**
- Consumes: `FeatureFlagsProvider` from `src/context/FeatureFlagsContext.tsx` (already exists).
- Produces: every story renders inside a `FeatureFlagsProvider` at default flag values.

**Background:** `useFeatureFlags()` throws `'useFeatureFlags must be used within FeatureFlagsProvider'` when no provider is mounted. Storybook's `preview` file currently has no decorators at all. The `.tsx` extension is required because a decorator returns JSX. Note that `useStatusBarModeValue` and `useStatusBarMode` are deliberately provider-*optional* (they fall back to `'light'`), so no `StatusBarModeProvider` is needed here.

- [ ] **Step 1: Rename the file with git so history follows**

```bash
git mv .storybook/preview.ts .storybook/preview.tsx
```

- [ ] **Step 2: Add the decorator**

Replace the contents of `.storybook/preview.tsx` with:

```tsx
import type { Preview } from '@storybook/react-vite';
import { FeatureFlagsProvider } from '../src/context/FeatureFlagsContext';
import '../src/styles/app.css';

const preview: Preview = {
  // Flag-aware components (TopAppBar's colorScheme default, DeviceFrame's
  // accent class) call useFeatureFlags, which throws without a provider.
  // Mount it globally at default flag values; stories that need a specific
  // variant pass the prop explicitly rather than mutating flags.
  decorators: [
    (Story) => (
      <FeatureFlagsProvider>
        <Story />
      </FeatureFlagsProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        wendysMobile: {
          name: 'Wendys Mobile (390x844)',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'wendysMobile',
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
```

- [ ] **Step 3: Verify Storybook boots and existing stories render**

Run: `npm run storybook`
Open `http://localhost:6006`, then check three stories render unchanged: **Components/TopAppBar → Playground**, **Components/Button → All Variants** (or the first Button story), and **Components/BottomTabBar** (its first story). Expected: no console error mentioning `FeatureFlagsProvider`, no visual change.

- [ ] **Step 4: Verify the app build still passes**

Run: `npm run build && npm run lint`
Expected: both succeed. (`.storybook/` is outside the app's `tsc -b` project, but lint covers it.)

- [ ] **Step 5: Commit**

```bash
git add .storybook/preview.ts .storybook/preview.tsx
git commit -m "Storybook: mount FeatureFlagsProvider globally

Renames preview.ts to .tsx and wraps every story in the provider so
flag-aware components can read defaults instead of throwing. Prerequisite
for TopAppBar's colorScheme default.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Yellow token and the teal-to-red remap

The whole of item 3 in the spec — "red buttons" — plus the yellow token every later task needs. Zero component files change.

**Files:**
- Modify: `src/styles/tokens.css` (add one token inside `:root`; append a scoped class after it)
- Modify: `src/components/DeviceFrame/DeviceFrame.tsx`

**Interfaces:**
- Consumes: `resolveRetro`, `FeatureFlags` from Task 1.
- Produces: the CSS custom property `--color-bg-brand-retro-default`, and the class `.theme-retro-red`. Task 4 and Task 6 both use the yellow token.

**Background the implementer needs:**

*Why a class and not a prop.* 28 non-story source files reference `brand-secondary` tokens. Redefining those custom properties on an ancestor element recolors all of them at once, because CSS custom properties are inherited and re-substituted per element: the `@theme` aliases in `src/styles/app.css` (e.g. `--color-wds-bg-brand-secondary: var(--color-bg-brand-secondary-default)`) resolve against each element's own inherited value, so Tailwind utilities inside the subtree pick up red with no code change.

*Where the class goes.* Every route in `App.tsx` renders inside `DeviceFrame` — including `/voice`, the SPP, the bag, and the location-confirmation screen, which sit outside `AppShell`. So `DeviceFrame` is the single attachment point that covers the whole app. It has two return branches: a compact one (viewport ≤ 430px, no phone chrome) and a framed one. Both need the class.

*The one trap.* `--color-bg-secondary-default` is a **neutral gray**, not a brand token. Do not remap it. The `floating-pill` nav's active pebble uses it and must stay neutral.

- [ ] **Step 1: Add the yellow token**

In `src/styles/tokens.css`, find the semantic background block — the line `--color-bg-brand-primary-default: var(--color-red-500);` is at roughly line 128. Immediately after the three `--color-bg-brand-secondary-*` declarations (roughly line 133), add:

```css

  /* Retro branding. Figma: color/text/brand/retro/default (Fresh Theme
     collection, Fresh DS Foundations library). Named bg here because every
     observed use is a background. Stored as a raw value in Figma — not
     aliased to a primitive — so it has no primitive here either. */
  --color-bg-brand-retro-default: rgb(254, 242, 0);
```

- [ ] **Step 2: Append the scoped remap**

At the very end of `src/styles/tokens.css`, **after** the closing `}` of the `:root` block, append:

```css

/* ══════════════════════════════════════════════════════════════════
   Retro red accents

   Re-points the brand-secondary family (teal) at the red ramp for an
   entire subtree. DeviceFrame applies this when the resolved accentColor
   flag is 'red', which recolors every consumer of these tokens — buttons,
   links, checkbox/radio/toggle, chips, segmented control, counters, text
   field focus, and all three bottom-nav variants — with no component edits.

   The main tokens resolve to the same primitives their brand-primary
   counterparts already use, so retro secondary is visually identical to
   today's primary and no new color is invented.

   Do NOT add --color-bg-secondary-default here: it is a neutral gray, not
   a brand token, and the floating-pill nav's active pebble depends on it
   staying neutral.
   ══════════════════════════════════════════════════════════════════ */

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

  /* Inverse = lighter, for use on dark surfaces. Mapped positionally
     against the blue ramp indices (400/500/600) rather than following the
     brand-primary mapping above, so these stay lighter than the base. */
  --color-text-brand-secondary-inverse-default: var(--color-red-400);
  --color-text-brand-secondary-inverse-hover: var(--color-red-500);
  --color-text-brand-secondary-inverse-active: var(--color-red-600);
  --color-icon-brand-secondary-inverse-default: var(--color-red-400);
  --color-icon-brand-secondary-inverse-hover: var(--color-red-500);
  --color-icon-brand-secondary-inverse-active: var(--color-red-600);

  --color-text-link-default: var(--color-red-500);
  --color-icon-link-default: var(--color-red-500);
}
```

- [ ] **Step 3: Apply the class in `DeviceFrame`**

In `src/components/DeviceFrame/DeviceFrame.tsx`, add these imports after the existing ones:

```tsx
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { resolveRetro } from '../../config/featureFlags';
```

Inside the component, after `const compact = useCompactViewport();`, add:

```tsx
  // Retro red accents are a scoped token remap rather than a prop, so one
  // class on the frame recolors every brand-secondary consumer in the app.
  // DeviceFrame is the right owner: every route renders inside it, including
  // the ones outside AppShell (/voice, SPP, bag, confirm-location).
  const { flags } = useFeatureFlags();
  const accentClass = resolveRetro(flags).accent === 'red' ? ' theme-retro-red' : '';
```

In the compact branch, change the root element's className to:

```tsx
      <div className={`h-[100dvh] flex flex-col bg-wds-bg-primary overflow-hidden${accentClass}`}>
```

In the framed branch, change the inner 390×844 element's className to:

```tsx
        className={`relative bg-wds-bg-primary overflow-hidden${accentClass}`}
```

Leave the outer gray page wrapper alone so the surrounding page background is unaffected.

Note the leading space inside `accentClass` — the two possible values are `''` and `' theme-retro-red'`, both complete static strings, so Tailwind's scanner is not involved (`theme-retro-red` is hand-authored CSS, not a generated utility).

- [ ] **Step 4: Un-stub the two flags this wires**

In `src/config/featureFlags.ts`, delete the `stub: true` line from the `retroBranding` entry and from the `accentColor` entry. Leave it on `topAppBarStyle` and `splashAnimation`.

- [ ] **Step 5: Verify defaults are inert, then verify the remap**

Run: `npm run build && npm run lint && npm run dev`

With flags at defaults, load `http://localhost:5173/` and confirm the Order button in the bottom nav is still **teal**.

Then at `/account/dev-tools` set **Red Accents → Red** and confirm:
- Bottom nav: the center Order circle and the active tab's icon and label are **red**
- Home: the "Try Now" pill on the voice banner is red
- `/offers`: the segmented control's active state is red
- `/order/menu/hamburgers` → open any product: the size selector, counters and chips are red
- Anything that was already red (the top app bar, filled primary buttons) is **unchanged**
- Switch **Bottom Nav Style** through Simple and Floating Pill — both are red too, and the floating pill's active pebble is still a neutral gray, not red

Then set **Retro Branding → On** with Red Accents back on **Auto** and confirm the same red result — that proves `auto` follows the master.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/components/DeviceFrame/DeviceFrame.tsx src/config/featureFlags.ts
git commit -m "Tokens: retro yellow + scoped teal-to-red accent remap

Adds --color-bg-brand-retro-default (#fef200, mirroring Figma's
color/text/brand/retro/default) and a .theme-retro-red class that re-points
the brand-secondary family at the red ramp. DeviceFrame applies it when the
resolved accent is red, so all 28 files that reference those tokens recolor
with no component edits — including all three bottom-nav variants.

Un-stubs retroBranding and accentColor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Retro top app bar

**Files:**
- Create: `public/images/wendys-retro-logo.svg` (copied), `assets/images/wendys-retro-logo.svg` (copied)
- Modify: `src/components/TopAppBar/TopAppBar.tsx`
- Modify: `src/components/TopAppBar/BagButton.tsx`
- Modify: `src/components/TopAppBar/TopAppBar.stories.tsx`
- Modify: `src/config/featureFlags.ts` (un-stub `topAppBarStyle`)

**Interfaces:**
- Consumes: `resolveRetro` (Task 1), `--color-bg-brand-retro-default` (Task 3), the Storybook provider (Task 2).
- Produces:
  - `type TopAppBarColorScheme = 'classic' | 'retro'` exported from `TopAppBar.tsx`
  - `TopAppBarProps` gains `colorScheme?: TopAppBarColorScheme`
  - `BagButtonProps` gains `colorScheme?: TopAppBarColorScheme`

**Background the implementer needs:**

`TopAppBar` is screen-owned — 11 screens render it directly. `colorScheme` therefore **defaults to the resolved flag**, so none of those screens change; an explicit prop wins, which is what makes the variant selectable in Storybook.

*Why the trailing buttons change `variant` rather than the tokens.* Points and Find are `<Button variant="text-reversed">`. Switching them to `variant="text"` is what turns their labels and the masked `location-filled` icon black. Retro must **not** be implemented by remapping the `onBrand` tokens — `onBrand` white is still correct for labels on red filled buttons everywhere else in the app.

*Status bar.* Figma's retro bar draws the clock, wifi and battery in black. `useStatusBarMode(mode)` from `src/context/StatusBarModeContext.tsx` sets the tint for as long as the caller is mounted and restores the previous value on unmount. It is provider-optional (no throw in Storybook). `TopAppBar` owns this rather than the 11 screens, so the tint can never drift out of sync with the bar color. Only `/voice` currently calls this hook, and `/voice` does not render `TopAppBar`, so nothing conflicts.

*The logo.* `wendys-retro-logo.svg` has a `90×40` viewBox and a single fill of `#C8102E`, so at the existing `h-[40px] w-auto` it renders at its native size — matching Figma, which draws it 40px tall. Because the default `logoSrc` now depends on `colorScheme`, the default moves from the parameter list into the function body.

*The bag button inverts.* Today it is a white pill with `bag-red.svg` and a red count. Figma's retro bag is variant `Type=onBrand-primary`: a red pill, the `bag-light` icon, and a white count. **`bag-light.svg` lives in `public/icons/`, not `public/images/`** — the path is `/icons/bag-light.svg`. It is a white bag with a red accent, drawn for placement on a colored surface.

- [ ] **Step 1: Copy the logo asset**

```bash
cd "/Users/aforrester/Documents/Wendy's/wendys-app-prototype"
cp "/Users/aforrester/Documents/Wendy's/Brand/retro branding/wendys-retro-logo.svg" assets/images/wendys-retro-logo.svg
cp "/Users/aforrester/Documents/Wendy's/Brand/retro branding/wendys-retro-logo.svg" public/images/wendys-retro-logo.svg
```

Verify: `head -c 100 public/images/wendys-retro-logo.svg` should show `viewBox="0 0 90 40"`.

- [ ] **Step 2: Add the `colorScheme` prop to `BagButton`**

Replace the whole of `src/components/TopAppBar/BagButton.tsx` with:

```tsx
import type { TopAppBarColorScheme } from './TopAppBar';

export interface BagButtonProps {
  count: number;
  onClick?: () => void;
  /**
   * Classic is a white pill with the red bag and a red count. Retro inverts
   * it — red pill, light bag, white count — per Figma's `onBrand-primary`
   * Bag Button variant, which is what reads correctly on the yellow bar.
   */
  colorScheme?: TopAppBarColorScheme;
}

export function BagButton({ count, onClick, colorScheme = 'classic' }: BagButtonProps) {
  if (count === 0) return null;

  const retro = colorScheme === 'retro';

  // Full static class strings — Tailwind v4's scanner can't resolve
  // interpolated segments.
  const pillClass = retro
    ? 'flex items-center h-[32px] px-wds-8 rounded-wds-full bg-[var(--color-bg-brand-primary-default)] gap-0 border-none'
    : 'flex items-center h-[32px] px-wds-8 rounded-wds-full bg-[var(--color-bg-onbrand-default)] gap-0 border-none';

  const countClass = retro
    ? 'font-body text-[12px] leading-[16px] font-black text-[var(--color-text-onbrand-default)]'
    : 'font-body text-[12px] leading-[16px] font-black text-[var(--color-text-brand-primary-default)]';

  return (
    <button
      className={pillClass}
      onClick={onClick}
      aria-label={`Bag, ${count} items`}
    >
      <img
        src={retro ? '/icons/bag-light.svg' : '/images/bag-red.svg'}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
      />
      <span className={countClass}>
        {count > 9 ? '9+' : count}
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Add the `colorScheme` prop to `TopAppBar`**

In `src/components/TopAppBar/TopAppBar.tsx`:

Add to the imports:

```tsx
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { resolveRetro } from '../../config/featureFlags';
import { useStatusBarMode } from '../../context/StatusBarModeContext';
```

Add the type next to the other exported types at the top:

```tsx
export type TopAppBarColorScheme = 'classic' | 'retro';
```

Add to `TopAppBarProps`, after `titleWeight`:

```tsx
  /**
   * Color scheme — defaults to the resolved `topAppBarStyle` flag, so no
   * screen needs to pass it. An explicit value wins, which is what makes
   * the variant selectable in Storybook.
   */
  colorScheme?: TopAppBarColorScheme;
```

In the destructured parameter list, change `logoSrc = '/images/wendys-wave-white.svg',` to `logoSrc,` and add `colorScheme,` after `titleWeight = 'black',`.

- [ ] **Step 4: Derive the retro values**

In the function body, after `const compact = useCompactViewport();`, add:

```tsx
  const { flags } = useFeatureFlags();
  const scheme = colorScheme ?? resolveRetro(flags).topAppBar;
  const retro = scheme === 'retro';

  // Figma's retro bar draws the clock, wifi and battery in black. Owned here
  // rather than by the 11 consuming screens so the tint can't drift out of
  // sync with the bar color. The hook restores the previous mode on unmount.
  useStatusBarMode(retro ? 'dark' : 'light');

  // Retro's dark content comes from switching to the non-reversed tokens and
  // button variant — NOT from remapping the onBrand tokens, which are still
  // correct for white labels on red filled buttons elsewhere in the app.
  // Full static class strings: Tailwind v4 can't resolve interpolation.
  const headerBgClass = retro
    ? 'bg-[var(--color-bg-brand-retro-default)]'
    : 'bg-[var(--color-bg-brand-primary-default)]';
  const titleColorClass = retro
    ? 'text-[var(--color-text-primary-default)]'
    : 'text-[var(--color-text-onbrand-default)]';
  const backIconClass = retro
    ? 'inline-block w-[24px] h-[24px] bg-[var(--color-icon-primary-default)]'
    : 'inline-block w-[24px] h-[24px] bg-[var(--color-icon-onbrand-default)]';
  const trailingVariant = retro ? 'text' : 'text-reversed';
  const loadingTrackClass = retro
    ? 'relative w-full h-[3px] overflow-hidden bg-[var(--color-red-200)]'
    : 'relative w-full h-[3px] overflow-hidden bg-white/20';
  const loadingBarClass = retro
    ? 'absolute top-0 left-0 h-full w-[40%] bg-[var(--color-bg-brand-primary-default)] rounded-wds-full'
    : 'absolute top-0 left-0 h-full w-[40%] bg-white rounded-wds-full';
  const resolvedLogoSrc =
    logoSrc ?? (retro ? '/images/wendys-retro-logo.svg' : '/images/wendys-wave-white.svg');
```

- [ ] **Step 5: Apply them to the markup**

Six edits in the same file.

`<header>` — replace the opening tag with:

```tsx
    <header className={`w-full ${headerBgClass} flex-shrink-0 sticky top-0 z-10`}>
```

Both `<h1>` elements (the centered title and the left-aligned title) — replace `text-[var(--color-text-onbrand-default)]` with `${titleColorClass}`, so each reads:

```tsx
            <h1 className={`font-display text-[23px] leading-[32px] ${titleWeightClass} ${titleColorClass} m-0 truncate`}>
```

The back-arrow `<span>` — replace its `className` with `{backIconClass}`:

```tsx
              <span
                aria-hidden="true"
                className={backIconClass}
```

The logo `<img>` — change `src={logoSrc}` to `src={resolvedLogoSrc}`.

Both trailing `<Button>` elements (Points and Find) — change `variant="text-reversed"` to `variant={trailingVariant}`.

The `<BagButton>` — pass the scheme through:

```tsx
              <BagButton count={bagCount} onClick={handleBag} colorScheme={scheme} />
```

The loading bar — replace the two hardcoded classNames:

```tsx
        <div className={loadingTrackClass}>
          <div
            className={loadingBarClass}
```

- [ ] **Step 6: Fix the Points shimmer for yellow**

The `pointsLoading` shimmer is a white-on-white-alpha track, invisible on yellow. Replace the shimmer block's two inline `style` objects so they switch with the scheme. The track becomes:

```tsx
                  <div
                    className="h-[14px] w-[72px] rounded-wds-s overflow-hidden"
                    style={{ background: retro ? 'var(--color-red-200)' : 'rgba(255,255,255,0.2)' }}
                  >
```

and the sweep becomes:

```tsx
                    <div
                      className="h-full w-full"
                      style={{
                        background: retro
                          ? 'linear-gradient(90deg, transparent 0%, var(--color-red-100) 50%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
```

- [ ] **Step 7: Un-stub the flag**

In `src/config/featureFlags.ts`, delete the `stub: true` line from the `topAppBarStyle` entry.

- [ ] **Step 8: Add the Storybook control and a Retro story**

In `src/components/TopAppBar/TopAppBar.stories.tsx`, add to `argTypes` after `titlePlacement`:

```tsx
    colorScheme: { control: 'radio', options: ['classic', 'retro'] },
```

Add this story after `CampaignLogo`:

```tsx
/* ── Retro — yellow bar, black content, retro logo ── */
export const Retro: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <TopAppBar colorScheme="retro" titleMode="logo" showPoints points={490} showFind showBag />
      <TopAppBar colorScheme="retro" titleMode="title" title="Account" titlePlacement="left" showPoints points={490} />
      <TopAppBar colorScheme="retro" titleMode="title" title="Menu" titlePlacement="center" showBackButton showBag />
      <TopAppBar colorScheme="retro" titleMode="logo" showPoints points={490} showFind showBag showLoadingBar />
      <TopAppBar colorScheme="retro" titleMode="logo" showPoints pointsLoading showBag />
    </div>
  ),
};
```

- [ ] **Step 9: Verify in Storybook**

Run: `npm run storybook`

**Components/TopAppBar → Retro**: all five bars are yellow; the retro logo is red and 40px tall; "490 Points" and "Find" are black; the bag pill is red with a light bag and a white count; the loading bar is red on a pale red track; the shimmer is visible.

**Components/TopAppBar → Playground**: flip the `colorScheme` control between `classic` and `retro` and watch the bar switch. With it unset the bar is red (the default flag resolves to classic).

**Components/TopAppBar → HomeScreen** and **AllVariants**: unchanged from before — still red with white content.

- [ ] **Step 10: Verify in the app**

Run: `npm run build && npm run lint && npm run dev`

With flags at defaults, every screen's app bar is red with white content and the wave logo — unchanged.

At `/account/dev-tools` set **Top App Bar → Retro (Yellow)** and walk Home, Offers, Order, Menu, a PLP, Earn, Account. Confirm on each: yellow bar, black title/labels/back arrow, retro logo on Home, and the status bar clock and icons flip to **black**. Add something to the bag and confirm the bag pill is a red pill with a light bag.

Set it back to **Auto**, then set **Retro Branding → On**, and confirm the bar goes yellow — `auto` following the master.

- [ ] **Step 11: Commit**

```bash
git add assets/images/wendys-retro-logo.svg public/images/wendys-retro-logo.svg src/components/TopAppBar/ src/config/featureFlags.ts
git commit -m "TopAppBar: retro yellow colorScheme

New colorScheme prop defaulting to the resolved topAppBarStyle flag, so no
screen changes and Storybook can still force a variant. Retro swaps the
header to the yellow token, title and back arrow to text/icon-primary, the
Points and Find buttons from text-reversed to text, the default logo to
wendys-retro-logo.svg, and the loading bar and Points shimmer to red so
they stay visible on yellow.

BagButton inverts to Figma's onBrand-primary variant — red pill, light bag,
white count. TopAppBar now also owns the status-bar tint so it can't drift
out of sync with the bar color.

Un-stubs topAppBarStyle.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Retro splash animations

**Files:**
- Create: `public/animations/retro-yellow.gif`, `public/animations/retro-newsprint.mp4`, plus copies in `assets/splash-screen-animation/`
- Modify: `src/App.tsx`
- Modify: `src/config/featureFlags.ts` (un-stub `splashAnimation`)

**Interfaces:**
- Consumes: `resolveRetro` (Task 1).
- Produces: nothing other tasks depend on.

**Background the implementer needs:**

`SplashScreen` needs **no changes**. It already accepts `animationType: 'lottie' | 'image' | 'video'` plus `animationSrc`, sizes both to `100%` with `objectFit: 'cover'` capped at 390×844, and the video branch already sets `autoPlay muted playsInline`. Neither file needs converting.

The assets are renamed on copy so the filename says which variant it is instead of a version number: **v1 is "retro yellow"** (GIF, 903.8K, authored at exactly 390×844 with ~196 frames — the prototype's viewport) and **v2 is "retro newsprint"** (MP4, H.264, 558.3K). `assets/splash-screen-animation/` is the established home for splash source assets (it already holds `splash.gif` and `splash.json`), so they go there rather than in a new `assets/animations/` folder — this differs from the spec's file table and is a deliberate alignment with the existing repo layout. `public/animations/` does not exist yet and must be created.

`App.tsx` renders `FeatureFlagsProvider` itself, so it **cannot** call `useFeatureFlags` in its own body — the hook must be called by a child. Hence the small `AppSplash` component. Also note `App.tsx` currently imports the Lottie JSON under the name `splashAnimation`, which now collides with the flag name; rename the import to `splashLottie`.

- [ ] **Step 1: Copy the animation assets**

```bash
cd "/Users/aforrester/Documents/Wendy's/wendys-app-prototype"
RETRO="/Users/aforrester/Documents/Wendy's/Brand/retro branding"
cp "$RETRO/retro-animation-v1.gif" assets/splash-screen-animation/retro-yellow.gif
cp "$RETRO/retro-animation-v2.mp4" assets/splash-screen-animation/retro-newsprint.mp4
mkdir -p public/animations
cp "$RETRO/retro-animation-v1.gif" public/animations/retro-yellow.gif
cp "$RETRO/retro-animation-v2.mp4" public/animations/retro-newsprint.mp4
```

Verify: `ls -la public/animations/` shows both files at roughly 904K and 558K.

- [ ] **Step 2: Extract `AppSplash` in `App.tsx`**

Change the Lottie import (line 24) from:

```tsx
import splashAnimation from './animations/lottie/splash.json';
```

to:

```tsx
import splashLottie from './animations/lottie/splash.json';
```

Add to the imports:

```tsx
import { useFeatureFlags } from './context/FeatureFlagsContext';
import { resolveRetro } from './config/featureFlags';
```

Add this component above `export default function App()`:

```tsx
/**
 * Picks the splash variant from the resolved flag. Split out of `App`
 * because `App` renders the FeatureFlagsProvider itself and so can't call
 * useFeatureFlags in its own body.
 *
 * SplashScreen already handles all three formats, so the retro GIF and MP4
 * need no conversion — just the right animationType and src.
 */
function AppSplash({ onComplete }: { onComplete: () => void }) {
  const { flags } = useFeatureFlags();
  const { splash } = resolveRetro(flags);

  if (splash === 'retro-yellow') {
    return (
      <SplashScreen
        animationType="image"
        animationSrc="/animations/retro-yellow.gif"
        onComplete={onComplete}
      />
    );
  }

  if (splash === 'retro-newsprint') {
    return (
      <SplashScreen
        animationType="video"
        animationSrc="/animations/retro-newsprint.mp4"
        onComplete={onComplete}
      />
    );
  }

  return <SplashScreen lottieData={splashLottie} onComplete={onComplete} />;
}
```

Replace the splash render block inside `<DeviceFrame>`:

```tsx
                  {!splashComplete && (
                    <AppSplash onComplete={() => setSplashComplete(true)} />
                  )}
```

- [ ] **Step 3: Un-stub the flag**

In `src/config/featureFlags.ts`, delete the `stub: true` line from the `splashAnimation` entry. All four retro flags are now live and no retro flag should carry the marker.

- [ ] **Step 4: Verify all three variants**

Run: `npm run build && npm run lint && npm run dev`

With defaults, reload `http://localhost:5173/` — the splash plays the current Lottie, unchanged.

At `/account/dev-tools` set **Splash Animation → Retro Yellow (GIF)**, then reload the page (the splash only plays on mount). Confirm the GIF plays full-bleed after the cameo. Repeat with **Retro Newsprint (MP4)** and confirm the video plays with no controls and no audio.

Set Splash Animation back to **Auto**, set **Retro Branding → On**, reload, and confirm you get Retro Yellow.

> Flags are in-memory React state, so a reload resets them to defaults. To see a retro splash you have to set the flag and then trigger a *client-side* remount, or temporarily change `defaultFeatureFlags.splashAnimation` locally while testing. Note this in the commit if you take the temporary-default route — and don't commit it.

- [ ] **Step 5: Commit**

```bash
git add assets/splash-screen-animation/retro-yellow.gif assets/splash-screen-animation/retro-newsprint.mp4 public/animations/ src/App.tsx src/config/featureFlags.ts
git commit -m "Splash: retro yellow (GIF) + retro newsprint (MP4) variants

SplashScreen already supports image and video animation types, so neither
asset needed converting. New AppSplash child reads the resolved
splashAnimation flag and picks the format — extracted because App renders
the FeatureFlagsProvider and can't call the hook itself. Renames the Lottie
import to splashLottie to stop it colliding with the flag name.

Un-stubs splashAnimation; all four retro flags are now live.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Retro Account hero

**Files:**
- Create: `public/images/retro-cameo.svg`, `assets/images/retro-cameo.svg` (copied)
- Modify: `src/screens/Account/AccountScreen.tsx:37-58`

**Interfaces:**
- Consumes: `resolveRetro` (Task 1), `--color-bg-brand-retro-default` (Task 3).
- Produces: nothing.

**Background the implementer needs:**

Exact Figma measurements from the `Cameo & Name` frame (node `27:29849`): 390×218, vertical layout, padding `0 16 16 16`, gap `16`, centered. The cameo is 137×154 at x=127 — `(390 − 137) / 2 = 126.5`, so it is centered — and `retro-cameo.svg` has a native `137×154` viewBox, meaning it renders at native size with no scaling. The arithmetic checks out exactly: `154 + 16 gap + 32 line height + 16 bottom padding = 218`. Zero top padding, so the cameo sits flush against the app bar.

The greeting's **font weight does not change**, even though the Figma mock shows SemiBold where the code renders `font-black`. All typography is deferred to a fast follow. Only the color changes here.

The current markup puts a 12px gap between the cameo and the greeting via `marginBlockStart: 12` on the `<h2>` rather than a flex `gap`. Retro uses `gap: 16` instead, so the margin has to go to zero in retro to avoid stacking 16 + 12. Keep classic's values byte-identical.

`showPoints` on the Account app bar stays exactly as it is — Figma hides the trailing buttons on this screen, and we are deliberately not following that.

- [ ] **Step 1: Copy the cameo asset**

```bash
cd "/Users/aforrester/Documents/Wendy's/wendys-app-prototype"
cp "/Users/aforrester/Documents/Wendy's/Brand/retro branding/retro-cameo.svg" assets/images/retro-cameo.svg
cp "/Users/aforrester/Documents/Wendy's/Brand/retro branding/retro-cameo.svg" public/images/retro-cameo.svg
```

Verify: `head -c 100 public/images/retro-cameo.svg` shows `viewBox="0 0 137 154"`.

- [ ] **Step 2: Read the resolved hero variant**

In `src/screens/Account/AccountScreen.tsx`, add to the imports:

```tsx
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { resolveRetro } from '../../config/featureFlags';
```

In the component body, after `const { getUser, getRewardsPoints } = useUserData();`, add:

```tsx
  const { flags } = useFeatureFlags();
  // The hero has no flag of its own — it follows the retroBranding master.
  const retroHero = resolveRetro(flags).accountHero === 'retro';
```

- [ ] **Step 3: Make the hero conditional**

Replace the whole hero block (the comment plus the `<div>` and its two children) with:

```tsx
      {/* Hero section — red with the current cameo, or retro yellow with the
          retro cameo. Retro geometry is Figma 27:29849 exactly: 390x218,
          padding 0/16/16/16, gap 16, cameo at its native 137x154 flush to
          the app bar. 154 + 16 + 32 + 16 = 218. */}
      <div
        style={{
          backgroundColor: retroHero
            ? 'var(--color-bg-brand-retro-default)'
            : 'var(--color-bg-brand-primary-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: retroHero ? '0 16px 16px' : '24px 16px 32px',
          gap: retroHero ? 16 : 0,
        }}
      >
        <img
          src={retroHero ? '/images/retro-cameo.svg' : '/images/cameo-fullColor-withTrademark.svg'}
          alt="Wendy's"
          style={retroHero ? { width: 137, height: 154 } : { width: 131, height: 131 }}
        />
        <h2
          className="font-display text-[23px] leading-[32px] font-black"
          style={{
            color: retroHero
              ? 'var(--color-text-primary-default)'
              : 'var(--color-text-onbrand-default)',
            margin: 0,
            // Classic spaces the greeting with a margin; retro uses the flex
            // gap above, so the margin must be zero to avoid stacking both.
            marginBlockStart: retroHero ? 0 : 12,
          }}
        >
          Hey, {firstName}!
        </h2>
      </div>
```

Note the stray `marginTop: 12` from the original declaration is dropped — it was dead, overridden by the `margin: 0` that followed it. Classic's rendered spacing is unchanged because `marginBlockStart: 12` still applies.

- [ ] **Step 4: Verify both variants**

Run: `npm run build && npm run lint && npm run dev`

At `http://localhost:5173/account` with defaults: red hero, current cameo at 131×131, white greeting — pixel-identical to before. Confirm with DevTools' element inspector that the hero's padding is still `24px 16px 32px`.

Set **Retro Branding → On** and confirm: yellow hero, retro cameo (teal and dark-gray, larger and taller than the old one), sitting flush against the yellow app bar with no gap, and a black "Hey, Christopher!". Measure the hero in the browser's element inspector — it should be **218px** tall.

Also set **Top App Bar → Classic (Red)** while the master is on, and confirm the hero stays yellow under a red bar. It looks wrong, and that is correct behavior: the hero follows the master, not the app bar flag.

- [ ] **Step 5: Commit**

```bash
git add assets/images/retro-cameo.svg public/images/retro-cameo.svg src/screens/Account/AccountScreen.tsx
git commit -m "Account: retro cameo on a yellow hero

Hero follows the retroBranding master: yellow background, retro-cameo.svg
at its native 137x154, black greeting. Geometry matches Figma 27:29849
exactly — padding 0/16/16/16 and gap 16, so the cameo sits flush to the app
bar and the block totals 218px. Classic is untouched.

Typography deliberately unchanged; the greeting weight goes with the font
swap in the fast follow.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Documentation and ship

Per `CLAUDE.md`, docs get updated after every significant change, and a real build runs before every push.

**Files:**
- Modify: `docs/build-status.md` (the "Recently shipped" list)
- Modify: `COMPONENTS.md` (TopAppBar and BagButton entries)
- Modify: `docs/component-guide.md` (the scoped-theme-class convention)
- Modify: `docs/architecture.md` (the flag resolver)

**Interfaces:**
- Consumes: everything from Tasks 1-6.
- Produces: nothing.

**Background:** No new components were built, so the component **count in `docs/build-status.md` stays at 42** — do not increment it. `docs/component-guide.md` should only gain notes that are genuinely non-obvious; the scoped token class qualifies, because the natural instinct is to add a prop.

- [ ] **Step 1: Add the build-status entry**

At the **top** of the "Recently shipped" list in `docs/build-status.md`, add:

```markdown
- ✅ **Retro branding theme** — Wendy's yellow-and-red revival behind four flags: a `retroBranding` master plus `topAppBarStyle`, `accentColor`, and `splashAnimation` overrides that default to `auto` and follow the master. `resolveRetro()` in `src/config/featureFlags.ts` collapses them; consumers never see `auto`. Four surfaces: (1) `TopAppBar` gains `colorScheme: 'classic' | 'retro'` defaulting to the flag — yellow header, black title/back arrow, Points and Find switched from `text-reversed` to `text`, `wendys-retro-logo.svg`, red loading bar and shimmer, and it now owns the status-bar tint (dark on yellow). `BagButton` inverts to a red pill with a light bag. (2) Red accents ride a `.theme-retro-red` class in `tokens.css` that re-points the `brand-secondary` family at the red ramp; `DeviceFrame` applies it, recoloring all 28 consuming files including all three bottom-nav variants, with zero component edits. (3) Two new splash animations — `retro-yellow.gif` (390×844 native) and `retro-newsprint.mp4` — via `SplashScreen`'s existing `image`/`video` types, no conversion needed. (4) Account hero goes yellow with `retro-cameo.svg` at 137×154, matching Figma 27:29849 exactly. New token `--color-bg-brand-retro-default` (`#fef200`). Retired `locationSelectionLayout`; renamed `buttonColorScheme` → `accentColor`. Spec: `docs/superpowers/specs/2026-08-18-retro-branding-design.md`.
```

- [ ] **Step 2: Update `COMPONENTS.md`**

Add this row to the end of the TopAppBar prop table (after `pointsLoading`, around line 25):

```markdown
| `colorScheme` | `'classic' \| 'retro'` | Omit on screens — defaults to the resolved `topAppBarStyle` flag. Pass explicitly to force a variant (Storybook, or a screen that must stay classic). `retro` = yellow bar, black title/back arrow, retro logo, `text` instead of `text-reversed` trailing buttons, dark status bar. |
```

There is no `BagButton` entry in this file yet. Add one after the TopAppBar section's "Root screen configs" list and before `### BottomTabBar`:

```markdown
### BagButton
**Location:** `src/components/TopAppBar/BagButton.tsx`
**Use when:** Never directly — `TopAppBar` renders it via `showBag` and forwards its own `colorScheme`.

| Prop | Type | When to use |
|---|---|---|
| `count` | `number` | Total bag quantity. Returns `null` at `0`, so the caller doesn't need to guard. |
| `onClick` | `() => void` | Defaults to `/order/bag` navigation in `TopAppBar` |
| `colorScheme` | `'classic' \| 'retro'` | `classic` (default) = white pill, `bag-red.svg`, red count. `retro` = red pill, `/icons/bag-light.svg`, white count — Figma's `Type=onBrand-primary` variant, which is what reads on the yellow bar. |
```

- [ ] **Step 3: Add the theming convention to `docs/component-guide.md`**

Add a short subsection near the design-language / token guidance:

```markdown
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
```

- [ ] **Step 4: Note the resolver and the new assets in `docs/architecture.md`**

There is no feature-flags section in this file today. Add one between `## Five Global Contexts` and `## Routing`:

```markdown
## Feature Flags

Flags live in `src/config/featureFlags.ts` — a `FeatureFlags` interface, a
`defaultFeatureFlags` object, and a `flagMeta` record that `DevToolsScreen`
iterates to auto-generate its toggle rows in declaration order. All three must
stay in sync; `flagMeta` is typed `Record<keyof FeatureFlags, FlagMeta>`, so
`tsc` catches a missing entry. `stub: true` renders a flag dimmed and disabled
with a "NOT WIRED" badge — drop the marker when a consumer ships.

**Read retro flags through the resolver.** The three per-surface retro flags
(`topAppBarStyle`, `accentColor`, `splashAnimation`) default to `auto`, which
only means something relative to the `retroBranding` master. Call
`resolveRetro(flags)` and read its concrete values rather than branching on the
raw flags. `src/config/featureFlags.test.ts` covers it; run `npm run test:unit`.

That script targets a Node-environment Vitest project named `unit`. It is
separate from the `storybook` project, which runs stories in real Chromium via
Playwright — a plain `.test.ts` would not be picked up by that one.

Flags are in-memory React state with no persistence, so a page reload resets
them to defaults. This matters for anything that only renders on mount (the
splash screen): set the flag, then trigger a client-side remount rather than a
reload.
```

Then add the retro assets to the `## Asset Locations` section, matching its existing formatting:

- `public/images/wendys-retro-logo.svg` — retro app bar logo (`TopAppBar` default when `colorScheme` is `retro`), native 90×40, single `#c8102e` fill
- `public/images/retro-cameo.svg` — retro Account hero cameo, native 137×154
- `public/animations/retro-yellow.gif` — retro splash, authored at 390×844
- `public/animations/retro-newsprint.mp4` — retro splash, H.264

Note in that section that `bag-light.svg` lives in `public/icons/`, not `public/images/`, since the retro `BagButton` references it and the two bag assets sit in different folders.

- [ ] **Step 5: Full verification sweep**

```bash
npm run test:unit && npm run build && npm run lint
```

Expected: all three pass.

Then `npm run dev` and run the acceptance pass from the spec:

1. **Defaults are inert.** With every flag default, walk Home → Offers → Order → Menu → PLP → SPP → Bag → Earn → Account. Everything must look exactly as it did before this feature.
2. **Master on.** Set **Retro Branding → On** and walk the same route. Expect yellow bars with black content and the retro logo, red buttons and links, red bottom-nav accents, the retro Account hero, and **no white-on-yellow text anywhere**.
3. **All three nav variants.** With the master on, cycle **Bottom Nav Style** through Current, Simple, and Floating Pill — all red accents, and the floating pill's active pebble still neutral gray.
4. **Overrides work in both directions.** With the master **on**, set each surface flag to its classic value and confirm only that surface reverts. With the master **off**, set each to its retro value and confirm only that surface goes retro.
5. **Storybook.** `npm run storybook` → **Components/TopAppBar → Retro** renders five yellow bars; **Playground**'s `colorScheme` control switches live.

- [ ] **Step 6: Commit and push**

```bash
git add docs/build-status.md COMPONENTS.md docs/component-guide.md docs/architecture.md
git commit -m "Docs: retro branding theme

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push origin main
```

---

## Deferred — not in this plan

Recorded so nobody adds them mid-flight. All were explicitly scoped out.

- **Font swap** (Wendy's Fresh → alternate) and the Account greeting's weight. One token in `app.css` plus a typography review. Adam's call: fast follow.
- **The splash cameo.** The retro splash plays the *modern* cameo for 1500ms before the retro animation, because the spec only scoped the Account cameo. Worth raising, not worth silently changing.
- **Figma variable name.** The published variable is `color/text/brand/retro/default` despite being used only as a background. Either rename it to `color/bg/brand/retro/default` or add a `bg` alias, then align `tokens.css`.
- **`rewards-simple.svg` recolor.** The Points icon is a multi-color `<img>` (`#AE1B22` + `#FFE097`), so it can't be recolored by a mask and its cream sits at low contrast on yellow. Ships as-is.
- **`MediumTopAppBar` and `TransparentTopBar`** get no retro treatment.
- **Red/teal semantic collision.** The SPP "Your Changes" summary uses red pills for removals and teal for additions; in retro both are red and the distinction is lost. Accepted; revisit if it reads badly in a demo.
- **Content changes** such as the "Notifications" row visible in the Figma Account mock.
