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
npm run dev                  # Vite dev server on :5173
npm run storybook            # Storybook on :6006
npm run build                # Production build (tsc + vite build)
npm run refresh-voice-data   # Rebuild + re-vendor voice ordering data (run after editing menu.json or ingredients.json)
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
| Product images | `assets/product-images/` → `public/images/product-images/` | 181 food photos, named `food_{category}_{slug}_{id}.{png\|webp}` (LTO art arrives as webp from order.wendys.com — fine to keep as-is, the `image` field stores the full filename including extension) |
| Jalapeño LTO source images | `assets/jalapeno-ltos/` (numeric Wendy's IDs) | Original webp files from order.wendys.com — already copied + renamed into `public/images/product-images/` for `lto_9001`–`lto_9006` |
| Category images | `assets/category-images/` → `public/images/category-images/` | 14 category thumbnails, named `category_{name}_{id}.png` |
| Content card images | `assets/images/content-cards/` → `public/images/content-cards/` | Large + small placeholder banners |
| Splash animation | `assets/splash-screen-animation/splash.json` → `src/animations/lottie/` | Lottie JSON |
| Voice ordering animation | `assets/voice-animation.json` → `src/animations/lottie/voice-animation.json` | Lottie JSON — plays during agent speech on the `/voice` screen |
| Voice-ordering data (vendored) | `src/features/voice-ordering/data/` | `system_prompt.md` (authored), `semantic_menu_v3.json` (derived from sibling repo), `wendys-locations.json` (5,629 stores, scraped) |
| Voice-ordering data pipeline (sibling repo) | `../Menu Images/voice-ordering/` | NOT in this repo — Playwright scrapers + merge build that produce v3 from `menu.json`+`ingredients.json`+scraped sources. Run via `npm run refresh-voice-data`. |

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

## Voice Ordering POC

AI-powered voice ordering, isolated under `src/features/voice-ordering/`. The only shared boundary with the rest of the app is `BagContext` — voice fills the bag the same way the menu UI does. Removing the feature is a single-folder delete + flag removal. **First conceptual feature** beyond parity with the production app.

**See `src/features/voice-ordering/README.md`** for full architecture, planned file layout, and data provenance.

### Key files

| File | Purpose |
|---|---|
| `src/features/voice-ordering/README.md` | Module overview, layout, provenance, refresh contract |
| `src/features/voice-ordering/data/system_prompt.md` | LLM behavioral spec — encodes FreshAI conversation rules. Frontmatter has full provenance. **Treat as authoritative** for tone/disambiguation/upsell/offers behavior. |
| `src/features/voice-ordering/data/semantic_menu_v3.json` | LLM menu context — 180 items with voice aliases, disambiguation groups, allergens, ingredients_text. **Derived artifact** — do not hand-edit. |
| `src/features/voice-ordering/data/wendys-locations.json` | 5,629 real Wendy's stores. Vendored but **not yet wired** — reserved for nearest-store lookup (voice POC + future Order tab integration). |
| `src/features/voice-ordering/types.ts` | Shared TS types for the semantic menu, conversation, parsed orders, and runtime context. |
| `src/features/voice-ordering/useSemanticMenu.ts` | Read-only hook over v3. Provides `getItemById`, `resolveByName` (alias-aware), disambiguation group lookups, and `buildMenuSummary` for the LLM. |
| `src/features/voice-ordering/contextBuilder.ts` | Pure function — builds and renders the per-turn runtime context block (menu summary + bag + offers + rewards) appended to the system prompt. |
| `src/features/voice-ordering/orderParser.ts` | Parses ` ```order ` JSON fence from Claude responses, resolves names→IDs, returns `ParsedOrder` ready for the bag flow. |
| `src/features/voice-ordering/handoffParser.ts` | Parses ` ```handoff ` JSON fence (today only `destination: "delivery"`). Mirror of `orderParser` — separate fence so order + handoff don't share a schema. Drives delivery routing from the voice screen. |
| `src/features/voice-ordering/locationActionParser.ts` | Parses ` ```location ` JSON fence (today only `action: "resolve_zip"`). Used when the agent asks the app to resolve a customer-supplied ZIP into a real store; the screen runs `useNearestLocation.resolveByZip` and dispatches the result into `LocationContext` so the next turn's runtime context reflects it. |
| `src/hooks/useNearestLocation.ts` | Shared geo-driven nearest-store hook. Lazy-imports `wendys-locations.json` (5.4MB → separate Vite chunk). Permissions API + getCurrentPosition; haversine-ranks 5,629 stores; returns top-5 + state machine. `resolveByZip(zip)` returns the resolved Location for the denied-geo path. Used by Home (autoRun: true) and voice (autoRun: false). |
| `src/components/HomeLocationCard/HomeLocationCard.tsx` | Pickup location row that lives at the top of the Home screen. Three states (granted / loading / default) keyed off `LocationContext.selectedLocation` + permission. Composes the existing `ListRow` rounded variant. |
| `src/features/voice-ordering/useMockConversation.ts` | Canned-reply script for `voiceOrdering: 'mock'` mode. Demonstrates greeting → disambiguation → combo → close → order JSON. **Replaceable** with the live proxy. |
| `src/features/voice-ordering/useClaudeConversation.ts` | Orchestration hook. Owns conversation history, composes the system prompt with prompt-cache markers, routes mock/live, parses orders, runs `cleanReplyForDisplay` to strip markdown, dispatches `ADD_ITEM` to `BagContext`. |
| `src/features/voice-ordering/cleanReply.ts` | Strips markdown emphasis (`**bold**`, `*italic*`, backticks, links) from assistant replies before display + TTS. ElevenLabs reads markdown markers aloud literally; this keeps spoken and displayed text identical and word-highlighting aligned. |
| `src/features/voice-ordering/useTTS.ts` | TTS hook. Calls `/api/tts`, plays returned MP3 via HTML5 Audio. Auto-interrupts on new turns; silent-fails when proxy unavailable. Exposes `isPlaying` and an `onPlaybackStart` callback that hands the audio element to consumers (used by `useSpokenHighlight`). |
| `src/features/voice-ordering/useSpeechInput.ts` | STT hook over the browser-native `SpeechRecognition`. Two modes: **auto-VAD** (default) commits on ~1.2s of silence — used by the legacy chat panel; **manual-commit** (`manualCommit: true`) disables the silence timer and exposes `commit()` — used by push-to-talk on the voice screen. iOS Safari fallback (Whisper via proxy) deferred. |
| `src/features/voice-ordering/useSpokenHighlight.ts` | Tokenizes the agent's reply and drives an `activeIndex` against the playing TTS audio's `currentTime`. Word timing estimated from `audio.duration` weighted by word length — no proxy changes needed. Production-grade timing would switch to ElevenLabs `with-timestamps`. |
| `src/features/voice-ordering/VoiceOrderingScreen.tsx` | **Active full-screen voice UI** at `/voice`. Cream background, dark status bar (via `useStatusBarMode`), large agent text with active-word brand-red highlight (22/30), stacked `VoiceBagItemTile` cards that animate in as orders parse, central Lottie voice animation, **push-to-talk** on the lottie button (hold to listen, release to send), label states "Hold to talk" / "Listening — release to send" / "Speaking…", "Review in bag" CTA on order complete. No chat scrollback, no text input, no header band, no mute toggle. |
| `src/features/voice-ordering/VoiceBagItemTile.tsx` | Drive-thru-style item pill (image + name + price) used in the screen's animating stack. Reads from `useMenuData` for the product image. |
| `src/features/voice-ordering/VoiceOrderingPanel.tsx` | **Legacy chat panel.** Kept in place for A/B comparison; not the default entry. Uses auto-VAD STT, mic-replaces-Send-when-empty, live transcript mirroring, mic re-opens once after each assistant turn. |
| `src/features/voice-ordering/VoiceOrderingLauncher.tsx` | Mounts the FAB. Navigates to `/voice` on tap; auto-hides while on the voice screen or when the flag is `off`. **Temporary placement** — final UX TBD with Adam. |
| `src/animations/lottie/voice-animation.json` | Lottie animation for the voice screen — plays while the agent speaks or the user is being listened to; pauses otherwise. |
| `src/context/StatusBarModeContext.tsx` | Tiny context that lets a screen flip the device-frame status bar tint (`light` / `dark`) for the duration it's mounted. Voice screen uses it because the cream background needs dark icons. |
| `api/claude.ts` | **Active.** Dual-transport Claude proxy — Anthropic-direct (preferred) or Bedrock (fallback). Picks based on which env vars are set. |
| `api/tts.ts` | **Active.** ElevenLabs TTS REST proxy. Plain `fetch`. Live when `ELEVENLABS_API_KEY` is set. |
| `api/README.md` | Proxy deployment notes — env vars, transport selection, troubleshooting table. |
| `scripts/vite-api-middleware.ts` | Vite plugin that mounts `api/*.ts` at `/api/*` during `npm run dev`. Adapts Vercel `(req, res)` → Connect middleware. Auto-loads `.env.local`. |
| `scripts/refresh-voice-data.js` | Refresh script. Shells into sibling repo to rebuild and re-vendor v3 + locations. Run after editing `menu.json` or `ingredients.json`. |

### Single source of truth

`src/data/menu.json` and `src/data/ingredients.json` are authoritative. `semantic_menu_v3.json` is **built from them** by the sibling `Menu Images/voice-ordering/` repo (Playwright scrapers + merge script). The sibling is a one-way data factory; this prototype is the consumer. After editing `menu.json` or `ingredients.json`:

```bash
npm run refresh-voice-data
```

If the sibling repo moves, edit `VOICE_REPO` in `scripts/refresh-voice-data.js`. The "don't run sync" warning in the sibling repo's CLAUDE.md is now obsolete — the LTOs that prompted it are upstream in the prototype as of 2026-06-04.

### Status (2026-06-05)

| Layer | State |
|---|---|
| Data plumbing (v3, locations, system prompt) | ✅ Vendored + refresh script |
| Feature flag + 3-mode toggle (`off` / `mock` / `live`) | ✅ **Default `live`** — calls `/api/claude` proxy. Flip to `mock` in Developer Tools when there are no API creds. |
| Active entry point | ✅ Full-screen `VoiceOrderingScreen` at `/voice`. Legacy chat panel kept for A/B but not wired to the FAB. |
| Hooks (useSemanticMenu, useClaudeConversation, useTTS, useSpeechInput, useSpokenHighlight) | ✅ Built |
| Context builder + order parser + cleanReply | ✅ Built |
| UI (full-screen voice screen + legacy panel + FAB launcher) | ✅ Built (FAB placement temporary; FAB icon is placeholder) |
| Storybook stories (legacy panel) | ✅ MockMode / Off / LiveMode |
| Bedrock SDK installed (`@anthropic-ai/bedrock-sdk`) | ✅ Installed (fallback transport only) |
| Vite dev middleware for `/api/*` | ✅ `scripts/vite-api-middleware.ts` — `/api/claude` + `/api/tts` work in `npm run dev` |
| Going live (Claude transport) | ✅ **Anthropic-direct primary.** Bedrock fallback available when AWS creds are provided. |
| Prompt caching | ✅ Static system prompt + menu summary cached as ephemeral block; ~5× cost reduction per turn |
| Going live (TTS) | ✅ **Live with ElevenLabs.** TTS proxy + `useTTS` hook. MP3 returned from `/api/tts` plays via HTML5 Audio. |
| STT (mic input) | ✅ Wired — Web Speech API via `useSpeechInput`. **Push-to-talk** on the voice screen (hold to listen, release to send). Auto-VAD still available for the legacy chat panel. iOS Safari fallback (Whisper via proxy) deferred. |
| Word-by-word highlight | ✅ `useSpokenHighlight` drives an `activeIndex` against the playing audio's `currentTime`. Estimated timing weighted by word length. Production-grade would switch to ElevenLabs `with-timestamps`. |
| Markdown stripping | ✅ `cleanReplyForDisplay` removes bold/italic/code/link markers from replies before display + TTS so ElevenLabs doesn't read asterisks aloud. System prompt also asks Claude for plain prose. |
| TTS address abbreviation expansion | ✅ `expandSpokenAbbreviations` in `cleanReply.ts` — handles compound directionals (NW/NE/SW/SE, case-insensitive, with or without dots) and common street suffixes (St / Ave / Blvd / Rd / Dr / Ln / Ct / Pkwy / Hwy / Pl). Applied at the agent's reply boundary AND when we hand store names to the runtime context, so the agent never sees "Nw" in the first place. Without this, ElevenLabs reads "Nw Barry Road" as "en double-you Barry Road". |
| Status bar tint per screen | ✅ `StatusBarModeContext` — voice screen flips it to `dark` while mounted. |
| Vercel deploy | ✅ Live. Requires `ANTHROPIC_API_KEY` + `ELEVENLABS_API_KEY` set in project env vars (Production scope) before the proxy works. |
| Nearest-store lookup (`useNearestLocation`) | ✅ Built. `src/hooks/useNearestLocation.ts` — Permissions API check, `getCurrentPosition`, lazy-imported `wendys-locations.json` (5.4MB → its own Vite chunk so the main bundle stays at 1.7MB). Haversine ranks 5,629 stores; returns top-5 + state machine (idle/loading/granted/denied/error). `resolveByZip` walks prefix length 5 → 4 → 3 until at least one store matches, then haversine-ranks from that group's centroid (handles customer ZIPs that don't host a Wendy's, e.g. 64153 → finds Barry Road in 64154). Used by Home (auto-runs on mount, dispatches to `LocationContext`) and voice (no auto-run; just consumes `resolveByZip` for the ZIP fence). |
| Home location card + geo prompt | ✅ Built. `HomeLocationCard` renders two states: granted (Pickup Location overline + address + Edit) and default ("Find a Wendy's" + Search, used until a location is selected — covers both idle/loading geo and denied permission). On Home mount, geo auto-prompts. On grant, the address fills in and a snackbar fires once per HomeScreen mount where we auto-picked: "We've selected your nearest Wendy's location." (4s auto-dismiss + manual X, sits at `bottom: 174` to clear the voice FAB). On denied, default state shows + permission flag set so voice flow asks for ZIP. The home `TopAppBar` no longer renders the Find button — the location card supersedes it. |
| Order-type-first prompt + delivery routing | ✅ Built. Greeting now asks pickup-or-delivery up front. Delivery branch emits a ` ```handoff ` JSON fence (`{ "destination": "delivery" }`) which the screen consumes to route to `/order/delivery` after the spoken read-back lands (`replace: true` so back doesn't return to `/voice`). Pickup branch falls through to the existing item-collection flow. Handoff timer chains off the audio's `ended` event (waits for `tts.isPlaying` to flip true→false) instead of a fixed delay so the read-back never gets clipped; an 8s safety ceiling covers cases where playback never starts. Mock conversation has matching turn-0 branching for credentials-free demos. |
| Voice location confirmation flow | 🟡 Conversation logic in. After pickup is selected, voice reads `LocationContext` via the per-turn `### PICKUP LOCATION` runtime context block: granted store → "Picking up at <store name> — drive thru, dine in, or carryout?" (one-turn confirmation). Denied → strict two-step: turn 1 asks "What ZIP are you near?" only (no fence); turn 2, after a 5-digit ZIP arrives, emits ` ```location ` JSON fence with the ZIP. Screen calls `useNearestLocation.resolveByZip` and queues a synthetic `[system: location_resolved]` (or `[system: zip_not_found]`) nudge that fires once the previous turn's `pending` clears, prompting the agent to confirm by store name. Malformed fences (e.g. agent guessing at a `city` field) are always stripped from visible text and a recovery nudge fires. Pickup-method tiles (visual UI + tap-equivalent-to-speaking, plus voice→tile flash sync) **still pending** — current state is voice-only, no visual tiles yet. |
| Build-as-you-go visual draft order | ⏸ **Open.** **The big one.** Items appear visually as the agent confirms them, and update in place as the user modifies (single → combo → size → drink). Decided: voice-local draft state inside `VoiceOrderingScreen` (NOT `BagContext`); atomic transfer to `BagContext` only when user taps "Review in bag". Combo visualization: three small image circles (entrée + side + drink) inside the tile. Size/drink modifications mutate the existing tile rather than appending a new one. |
| Read-back of location + pickup method at close | ⏸ **Open.** Before "Review in bag" CTA, the agent reads back: "X items, [pickup method] at [store name]". System-prompt addition. |
| FAB icon + final placement | ⏸ Adam to supply icon; placement TBD |
| Delivery page (`/order/delivery`) | ✅ Built. Static screen ported from Figma — meal-deals hero, "It's a good day for delivery" headline, Get Started + Delivery FAQs buttons (intentionally inert for now), DoorDash credit + legalese. Reached via the Order root Pickup/Delivery toggle. |
| iOS Safari STT | ⏸ Deferred — Web Speech API unreliable on iOS Safari; planned fallback is Whisper-via-proxy. |

### Stack

- **STT:** Web Speech API (browser-native), wired via `useSpeechInput`. Two consumption modes: **manual-commit** (push-to-talk, used by `/voice` screen) and **auto-VAD** (silence-timer commit, used by the legacy chat panel). iOS Safari fallback (Whisper via proxy) deferred.
- **LLM:** Claude Haiku 4.5 via **Anthropic-direct** through `api/claude.ts`. Bedrock is the fallback transport, picked automatically when `AWS_REGION` + AWS creds are set instead of `ANTHROPIC_API_KEY`. Browser never sees keys either way.
- **TTS:** ElevenLabs REST endpoint (synthesis only, not their agent platform), via `api/tts.ts` proxy.
- **Word highlight:** `useSpokenHighlight` schedules a per-word `activeIndex` against the audio element's `currentTime` using length-weighted timing.
- **State:** Conversation history in `useClaudeConversation`. Integrates with `BagContext` only at order parse boundary.

### Feature flag (3 modes)

Set via Developer Tools → "Voice Ordering (POC)":
- **off** — no FAB, no voice screen, no calls. Removes feature visually.
- **mock** — canned conversation script. Demos the full flow without a backend. Useful when API creds aren't available.
- **live** — **default.** Calls `/api/claude`. Works locally as soon as `.env.local` has `ANTHROPIC_API_KEY` + `ELEVENLABS_API_KEY` and `npm run dev` is restarted (Vite dev middleware mounts the proxy — no Vercel deploy needed for local testing).

### Going live locally (no deploy required)

```bash
cp .env.example .env.local       # then edit .env.local — set ANTHROPIC_API_KEY
npm run dev                      # restart so the dev middleware picks up env vars
```

Then in the running app: tap the FAB to open `/voice` (or set the flag to **Live** in Account → Developer Tools if it isn't already). Hold the central animation to talk; release to send. Errors render as a red banner above the lottie; full stack traces print to the dev-server terminal under `[voice-ordering:dev-api]`. See `api/README.md` for the troubleshooting table.

**Watch for stale dev server processes.** Vite picks the first available port — if a previous `npm run dev` is still running on `5173`, the new one boots on `5174`. Hitting the wrong port returns 401s because the stale server has the old (or no) env. Kill stale processes with `lsof -ti:5173 | xargs kill -9` before restarting.

### Local dev architecture

- `api/claude.ts` and `api/tts.ts` use Vercel's `(req, res)` handler signature so they deploy unchanged to Vercel.
- `scripts/vite-api-middleware.ts` is a Vite plugin that adapts the same handlers to Connect-style middleware during `npm run dev`. It also reads `.env.local` at boot so env vars reach the handlers.
- Production deploy: push to Vercel. The middleware becomes a no-op (`apply: 'serve'`); Vercel auto-discovers `api/*.ts`.

### Mock conversation script

Try in mock mode: `"I'd like a Dave's Single"` → `"yes combo"` → `"strawberry lemonade"` → `"medium"` → `"that's it"`. Order JSON parses, items hit the bag. The exact pattern matchers live in `useMockConversation.ts` — extend as needed for new demo scripts.

### Locations data — deferred

`wendys-locations.json` is vendored to lock in the single-source-of-truth contract, but no UI consumes it yet. When wired up (haversine-based nearest-store lookup), the same utility should serve both the voice POC and a future Order-tab integration that replaces the 5 mocks in `src/data/locations.json`.

### What does NOT belong here

- **Anything stateful that's not voice-specific** — keep it in the existing contexts (`BagContext`, `LocationContext`, etc.)
- **Hand-edits to vendored JSON** — they'll be clobbered by `refresh-voice-data`. Edit upstream instead.
- **The data pipeline itself** — Playwright scrapers, merge build, locations scraper. They live in the sibling repo for a reason (different lifecycle, heavy deps).

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
- Current flags: addToBagTransition, comboBuilderStyle, locationSelectionLayout, splashAnimation, menuCategoryLayout, menuPLPLayout, sppLayout, bottomNavStyle, homeLocationComponent, buttonColorScheme, fallbackImage, postOrderSurprise, darkMode, loadingScenario, voiceOrdering

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

### Components Built (42)
Button, TopAppBar, BottomTabBar, BottomSheet, Spinner, Label, HelperMessage, RadioButton, Checkbox, Toggle, ListRow, ContentCard, CategoryCard, MenuCard, DeviceFrame, StatusBar, BagButton, Tabs, SegmentedControl, Snackbar, SectionHeader, ProductHeader, ItemSelector, Chip, Counter, IconButton, OrderBar, IngredientCollapse, IngredientCard, OrderLocationCard, SplashScreen, IngredientTable, MediumTopAppBar, HeroImage, TransparentTopBar, Dialog, ActionCard, BagItemCard, OrderSummary, DonationSection, TextField, HomeLocationCard

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

**Data scale:** 22 categories (14 all-day + 9 breakfast, with overlap on coffee/give-something-back), 180 products (incl. 6 Jalapeño LTOs), 29 combos, 28 ingredients, 16 add-ons, 5 add-on groups, 5 locations, 9 offers (with `isForYou` and `deliveryEligible` flags), 21 rewards store items, 1 user with 3 recent orders.

**Jalapeño LTO items (`lto_9001`–`lto_9006`):** Limited-time-offer items added 2026-06-04 to support the voice-ordering POC's FreshAI flow data. Three Jalapeño Ranch Cheeseburger variants (single/double/triple) in `cat_hamburgers`; Jalapeño Bacon + Sausage Biscuits in `cat_biscuits`; Jalapeño Bacon Breakfast Potato in `cat_classics`. Carry optional `isLTO`, `daypart`, `goLive` fields on `Product`. Prices and calories are realistic estimates anchored to the existing ladder — flagged in `_meta.note`. Real menu IDs from order.wendys.com are not yet known; prototype uses synthetic `lto_9xxx` IDs. The voice-ordering repo (`Menu Images/voice-ordering/`) consumes these via `npm run sync` + `npm run build` to produce `semantic_menu_v3.json`.

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
2. **Order flow:** ~~Location Selection → Menu Categories → PLP → SPP~~ → Bag → Checkout → Confirmation
3. ~~**Home & Auth:** Home screen (unauth/auth variants), Login~~ — Home (auth) DONE, Offers DONE
4. **Offers & Polish:** ~~Offers list~~, edge cases, empty/error/loading states

### SPP Module Status
| Module | Status | Notes |
|---|---|---|
| M1: Hero Image | ✅ Done | All products |
| M2: Product Header | ✅ Done | Name, favorite, price/calories |
| M3: Price & Calories | ✅ Done | Standard + combo variants |
| M4: Nutrition Link | ✅ Done | Scrolls to nutrition tabs |
| M5: Size Selector | ✅ Done | S/M/L standard + Jr/S/M/L Frosty |
| M6: Make it a Combo | ✅ Done | Conditional on single items in combo-eligible categories |
| M7: Included Accompaniment | ✅ Done | Salad dressings + nugget/tender sauces |
| M8: Featured Upsell Card | ✅ Done | ActionCard with isAdded/onAdd/onRemove props — "Add a little bonus" overline, ingredient image, price, Add/Remove toggle with animated "Added" badge |
| M9: "Your Changes" Summary | ✅ Done | Red pills (removals) + teal pills (additions) + Reset link, animated |
| M10: What's On It | ✅ Done | 3-column tiles, editable/removable/display states |
| M11: Flavor Selector | ✅ Done | Freestyle drinks only |
| M12: Add Extras | ✅ Done | Counter + chips + toggle modifiers |
| M13: Nutrition/Ingredients Tabs | ✅ Done | Allergens + IngredientTable + text |
| M14: Sticky OrderBar | ✅ Done | Quantity stepper + Add button |

### SPP Product Type Coverage
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
| Bakery | ✅ Bare minimum | M1-4, M13-14 (correct) |
| Non-food (Key Tags) | ✅ Bare minimum | M1-4, M13-14 (correct) |
| Value/Deals | ✅ Full | Same as parent category items |
| Combos (all) | ✅ Populated layout | Component cards with Edit links, "Price in Bag", combo size selector. Close X with confirm dialog. 39 combos have defaultComponents data. Combo wizard not yet built. |
| Kids Meals | ✅ Populated layout | Same combo pattern — 4 component cards (entrée + side + drink + toy) |

### Screens Built (14)
- **Splash Screen** — cameo logo → Lottie animation → fade to app (configurable timing, swappable animation)
- **Home Screen (auth)** — hero banner, offers section with real data, privacy policy link. Sticky TopAppBar.
- **Offers Screen** — Offers tab (segmented control, promo code button, available/unavailable/redeemed sections) + Rewards tab (2-up card grid with 21 items sorted by points, View History button, Learn More section)
- **Order Screen** (`/order`) — Mapbox map, BottomSheet with OrderLocationCards, Pickup/Delivery segmented control (toggle now navigates: Pickup → this screen, Delivery → `/order/delivery`), search. Pickup methods on each location card are Drive Thru / Dine In / Carryout (Curbside removed; not an actual Wendy's option).
- **Delivery Screen** (`/order/delivery`) — Static landing page reached when the user toggles to Delivery. Meal-deals hero, "It's a good day for delivery" headline, Get Started + Delivery FAQs buttons (inert until delivery flow is built), DoorDash credit + legalese.
- **Menu Category Screen** (`/order/menu`) — daypart-aware category grid (14 all-day, 9 breakfast), quick action icons (Recents/Favorites/Rewards), pickup location + offer applied ListRows
- **Menu Product List (PLP)** (`/order/menu/:slug`) — scrollable category tabs with swipe, 2-up MenuCard grid with price + calories, daypart-aware tab sets
- **Single Product Page (SPP)** (`/order/menu/:slug/:productId`) — modular shell with Add to Bag → snackbar → location confirmation gate
- **Earn Screen** (`/earn`) — QR code placeholder for Rewards scanning at restaurant, points display
- **Account Screen** (`/account`) — red hero with cameo logo + greeting, 7 ListRows
- **Developer Tools Screen** (`/account/dev-tools`) — 14 feature flags with auto-generated toggles
- **Location Confirmation** (`/order/confirm-location`) — static Mapbox map, store details, fulfillment method selector, one-time gate
- **Bag Screen** (`/order/bag`) — pickup/payment/time ListRows, BagItemCards (single + combo), ActionCard carousel, Round Up & Donate, OrderSummary, sticky Place Order CTA
- **Voice Ordering Screen** (`/voice`) — full-screen voice-first experience: cream bg, large agent text with active-word red highlight (timed against TTS audio), animating bag-item stack, central Lottie voice animation, "Review in bag" CTA on order complete. Reached via FAB; back arrow returns to previous screen.

## Open Questions (from PRD)

See `assets/wendys-prototype-prd.md` § 8 for the full list. Key unresolved items:
- Fulfillment method — selected at location screen or later?
- PLP "Add to Bag" on simple items — on card or always through SPP? (Currently always through SPP)
- ~~Breakfast category — daypart-dependent or always visible?~~ — **RESOLVED:** daypart-dependent. Breakfast daypart shows 9 breakfast categories, all others show 14 all-day categories.
- Location change after items in bag — clear, keep, or warn?
- Mapbox access token — Adam to create free-tier account when ready
