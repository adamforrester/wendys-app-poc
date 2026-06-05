# Voice Ordering (POC)

AI-powered voice ordering for the Wendy's prototype. The user holds a button, speaks an order, and Claude (Haiku 4.5) replies via ElevenLabs TTS while the active word highlights in real time. Confirmed orders flow into the existing `BagContext`.

This module is **isolated** — its only shared boundary with the rest of the app is `BagContext`. Everything else (LLM calls, TTS, STT, conversation state, word-highlight scheduling) lives in this folder. To remove the feature cleanly, delete this directory and the `voiceOrdering` flag.

## Status

Live end-to-end. Default flag is `live`. Push-to-talk shipped. Word-by-word highlight active. Order JSON parses on close, items animate into a bag-tile stack on the screen.

## Active surfaces

| Surface | What it is |
|---|---|
| `/voice` route | Full-screen voice experience. Cream background, large agent text with active-word brand-red highlight, animated bag-item stack, central Lottie animation, push-to-talk on the lottie button, "Review in bag" CTA when the order completes. **Default entry point.** |
| FAB (`VoiceOrderingLauncher`) | Floating action button on the rest of the app's screens. Tapping navigates to `/voice`. Auto-hides while on `/voice` or when the flag is `off`. Placement temporary. |
| Legacy chat panel (`VoiceOrderingPanel`) | Slide-up bottom-sheet chat UI from the previous iteration. **Not wired to the FAB.** Kept in the codebase + Storybook for A/B comparison. Uses auto-VAD STT, mic-replaces-Send-when-empty, mute toggle. |

## Directory layout

```
src/features/voice-ordering/
├── README.md                    ← you are here
├── data/                        ← vendored, regenerable
│   ├── system_prompt.md         ← LLM behavioral spec (FreshAI-grounded)
│   ├── semantic_menu_v3.json    ← LLM menu context (180 items, voice-aware)
│   └── wendys-locations.json    ← 5,629 stores (vendored, NOT yet wired)
├── types.ts                     ← shared TS types
├── useSemanticMenu.ts           ← read-only access to v3 + alias resolution
├── useClaudeConversation.ts     ← turn loop, history, system-prompt composition,
│                                  order parse, BagContext dispatch
├── useMockConversation.ts       ← canned reply script for `voiceOrdering: 'mock'`
├── useTTS.ts                    ← ElevenLabs MP3 playback via /api/tts
├── useSpeechInput.ts            ← Web Speech API; auto-VAD or push-to-talk
├── useSpokenHighlight.ts        ← word-by-word activeIndex against audio.currentTime
├── contextBuilder.ts            ← per-turn runtime context (bag/offers/rewards)
├── orderParser.ts               ← parses ```order JSON; resolves names→IDs
├── handoffParser.ts             ← parses ```handoff JSON (delivery routing)
├── locationActionParser.ts      ← parses ```location JSON (ZIP→store resolution)
├── cleanReply.ts                ← strips markdown markers (** _ ` []()) from replies
├── VoiceOrderingScreen.tsx      ← active full-screen UI at /voice
├── VoiceBagItemTile.tsx         ← drive-thru-style item pill used in the screen stack
├── VoiceOrderingLauncher.tsx    ← FAB → /voice
├── VoiceOrderingPanel.tsx       ← legacy chat panel (kept for A/B)
└── VoiceOrderingPanel.stories.tsx
```

Other repo touchpoints:

- `api/claude.ts`, `api/tts.ts` — proxies (Anthropic-direct or Bedrock; ElevenLabs)
- `api/README.md` — proxy deployment + troubleshooting
- `scripts/vite-api-middleware.ts` — mounts `api/*.ts` at `/api/*` during `npm run dev`
- `scripts/refresh-voice-data.js` — re-vendors `semantic_menu_v3.json` + locations
- `src/animations/lottie/voice-animation.json` — the lottie that plays during agent speech
- `src/context/StatusBarModeContext.tsx` — voice screen flips status-bar tint to `dark`
- `src/config/featureFlags.ts` — `voiceOrdering` flag (default `live`)
- `App.tsx` — `/voice` route registered outside `AppShell` (no tab bar)

## Data files — provenance

| File | Source | Refresh | Notes |
|---|---|---|---|
| `data/system_prompt.md` | Authored from FreshAI conversation design (chat-agent draft + Adam's edits) | Hand-edit | Production-grade behavior spec — encodes real FreshAI rules. Frontmatter has full provenance. **Now also instructs the model to emit plain prose** (no markdown) so TTS doesn't read asterisks aloud. |
| `data/semantic_menu_v3.json` | Built by sibling `Menu Images/voice-ordering/` repo from `src/data/menu.json` + `ingredients.json` + scraped nutrition + FreshAI flows | `npm run refresh-voice-data` | 180 items including 6 Jalapeño LTOs. Carries voice aliases, disambiguation groups, allergens, ingredients_text. |
| `data/wendys-locations.json` | Scraped by sibling repo from `locations.wendys.com` | `npm run refresh-voice-data` | 5,629 real Wendy's stores with lat/lng, address, hours. Reserved for nearest-store lookup (voice POC + future Order tab integration). |

## Single source of truth

The prototype's `src/data/menu.json` and `src/data/ingredients.json` are the source of truth for menu data. `semantic_menu_v3.json` is a **derived artifact** built by the sibling voice-ordering repo. The sibling is a one-way data factory; this prototype is the consumer. After editing `menu.json` or `ingredients.json`:

```bash
npm run refresh-voice-data
```

This shells into `../Menu Images/voice-ordering/`, runs `npm run sync && npm run build` there, and copies `semantic_menu_v3.json` + `wendys_locations.json` back into `data/`. Don't hand-edit the vendored JSON — it'll be overwritten on the next refresh. If the sibling repo moves, edit `VOICE_REPO` in `scripts/refresh-voice-data.js`.

## Feature flag

`voiceOrdering` in `src/config/featureFlags.ts`:

- `off` — no FAB, no voice screen, no calls.
- `mock` — `useMockConversation` runs canned replies. Useful when API creds aren't available.
- `live` — **default.** Calls `/api/claude` and `/api/tts`. Requires `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` set in the environment (`.env.local` for dev, Vercel project env vars for production).

Toggle at runtime in Account → Developer Tools → "Voice Ordering (POC)".

## Architecture decisions

**Why a dedicated full-screen route, not a panel?** The voice experience is the primary interaction once the user enters it; a chat panel sharing space with the rest of the app underweighted the feature. The panel still exists as a fallback layout we may revisit.

**Why push-to-talk?** Auto-VAD (silence-timer commit) was unpredictable in noisy demos and gave the user no clear sense of when the mic was open. Push-to-talk makes the contract obvious: while you hold, you're heard; release sends. Pressing during TTS interrupts the assistant — user input takes priority.

**Why estimate word timing instead of streaming timestamps?** ElevenLabs' default REST endpoint returns an MP3 with no per-word timing. We split the reply into tokens and schedule each word's start as `(cumulativeWeight / totalWeight) * audio.duration`, weighting by word length. It feels right for a demo. Production-grade timing would switch to ElevenLabs' `with-timestamps` endpoint or websocket stream — both add proxy work; not yet justified.

**Why strip markdown after the model emits it?** Belt + suspenders. The system prompt asks for plain prose, but Claude occasionally still emits `**bold**` or `*italic*`, and ElevenLabs reads the markers aloud literally. `cleanReply.ts` runs at the message-write boundary so display text and spoken text stay identical (and the word-highlight tokenizer sees the same text the user hears).

**Why isolate?** The prototype must remain shippable as a UX demo without the voice feature. Everything voice-specific lives here so the feature can be removed by deleting one folder. The bag never knows whether items came from the menu UI or voice — `BagContext.addItem()` is the contract.

**Why vendor data instead of importing from the sibling repo?** The prototype is a deployable app; the sibling is a build pipeline (Playwright, scrapers, ~5MB locations file). Different lifecycles, different dependency footprints. Vendoring keeps the prototype self-contained; the refresh script keeps the data current.

**Why Anthropic-direct (not Bedrock) by default?** Simpler setup — one env var. Bedrock remains wired as a fallback in `api/claude.ts` and is selected automatically when AWS creds are present instead of `ANTHROPIC_API_KEY`.

**Why Web Speech API?** Browser-native, no key management. Caveat: Safari iOS support is historically weak. `useSpeechInput.ts` is built with the option to swap in a Whisper-via-proxy fallback later if iOS demos become a priority.

## Locations data — deferred

`wendys-locations.json` is vendored but no UI consumes it yet. When wired up:

1. Voice POC: nearest-store lookup via haversine when voice opens (so the agent can say "your nearest Wendy's is on State Street, want to order pickup?")
2. Order tab (future): replace the 5 mock locations in `src/data/locations.json` with real-data lookup based on geolocation

Both consumers should share a single haversine utility (probably `useNearestLocation.ts`).

## Open questions

Bigger pieces, sequenced. Decisions in **bold** are already locked in with Adam.

- ~~**Order-type-first prompt + delivery routing.**~~ ✅ **Shipped.** Greeting asks pickup-or-delivery up front. Delivery branch emits a ` ```handoff ` JSON fence (`handoffParser.ts`) which the screen consumes to navigate to `/order/delivery` (`replace: true`). System prompt + mock both updated. Pickup branch resumes the existing item-collection flow.
- ~~**Nearest-store lookup (`useNearestLocation` hook).**~~ ✅ **Shipped** at `src/hooks/useNearestLocation.ts`. The Home screen owns the geo prompt — voice never re-prompts (avoids the back-to-back geo-then-mic browser dialogs). Voice flow consumes the resulting `LocationContext.selectedLocation` via the per-turn runtime context. Denied path: agent asks ZIP, emits ` ```location ` fence, screen runs `resolveByZip` and dispatches the resolved store. The 5.4MB `wendys-locations.json` lazy-loads on first use (Vite splits it into its own chunk).
- **Voice location confirmation flow.** Conversation-side logic shipped: agent confirms the user's pre-set store + asks pickup method in one turn (granted), or asks for ZIP and resolves via the location fence (denied). **Still pending: visual pickup-method tiles (Drive Thru / Dine In / Carryout) that render on screen AND are tap-equivalent-to-speaking, with voice→tile flash sync.**
- **Build-as-you-go visual draft order.** The big one. Items appear visually as the agent confirms them and update in place as the user modifies (single → combo → size → drink). **Decided: voice-local draft state inside `VoiceOrderingScreen`; nothing hits `BagContext` until the user taps "Review in bag" (atomic transfer).** Combo visualization: three small image circles (entrée + side + drink) inside the tile. Modifications mutate the existing tile rather than appending a new one. Streaming the order JSON across turns (vs. emitting only at close) is one approach; a separate "current draft" tool/structure is another. To be designed.
- **Read-back of location + pickup method at close.** Before "Review in bag", agent reads back "X items, [pickup method] at [store name]". System-prompt addition.
- **Final FAB icon + placement.** Adam to provide.
- **iOS Safari STT.** Web Speech API is unreliable; Whisper-via-proxy is the planned fallback.

## What does NOT belong here

- **Anything stateful that's not voice-specific** — keep it in the existing contexts (`BagContext`, `LocationContext`, etc.)
- **Hand-edits to vendored JSON** — they'll be clobbered by `refresh-voice-data`. Edit upstream instead.
- **The data pipeline itself** — Playwright scrapers, merge build, locations scraper. They live in the sibling repo for a reason (different lifecycle, heavy deps).
