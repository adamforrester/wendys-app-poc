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

**Why does Home own the geolocation prompt, not voice?** When voice opens it already needs mic permission. If voice also asked for geo, the user would see two browser permission dialogs back-to-back — bad UX in a web app pretending to be native. Home runs `useNearestLocation` on mount and writes the result to `LocationContext`; voice reads that context via the per-turn runtime block. Voice only asks the user for a ZIP when geo was already denied on Home.

**Why a synthetic `[system: ...]` nudge?** When the agent emits the `location` fence, the screen runs the lookup and dispatches into `LocationContext`. But the conversation only advances when something hits `send()` — and there's no real user utterance at that moment. We queue a synthetic message (`[system: location_resolved]` or `[system: zip_not_found]`) that fires once the previous turn's `pending` state clears, prompting the agent to take the next turn (confirm by store name, or apologize and re-ask). The system prompt teaches the model that these sentinels are event signals, not customer speech — never read aloud. Same pattern would extend cleanly to other "wait, then continue" handoffs.

**Why the strict 5→4→3 ZIP prefix walk in `resolveByZip`?** The dataset has ~5,629 store ZIPs against the ~42k US ZIPs in existence. Most customer ZIPs don't host a Wendy's. A naïve "find a store whose ZIP starts with the customer's ZIP" check fails completely for any "between stores" ZIP, even when one is half a mile away. Walking 5→4→3 finds the tightest matching cluster and uses its centroid as the customer's coords for nationwide ranking — for 64153 (no store), the 4-digit "6415" cluster lands in northern KC and Barry Road shows as the closest result.

**Why expand abbreviations both at the runtime-context boundary AND in the cleanReply pass?** The agent reads the runtime context verbatim, so expanding "Nw" → "Northwest" before the agent sees it means the model never has a chance to read it letter-by-letter. The cleanReply pass is defensive — catches any abbreviation the agent emits in its own reply (menu items, addresses dropped in conversationally).

## Locations data

`wendys-locations.json` (5,629 real stores) is now actively consumed by `useNearestLocation` in `src/hooks/`. Lazy-imported into its own Vite chunk (~3.3MB) so the main bundle stays small. Home runs the hook on mount; voice reads the resulting `LocationContext.selectedLocation` and uses `resolveByZip` for the denied-geo path. Order tab map, Location Confirmation, Bag pickup row, and the menu Pickup Location header all bind to `useResolvedLocations()` (in `src/hooks/`) — which prefers `LocationContext.selectedLocation` + the new `LocationContext.candidates` (top-5 ranked nearby) and falls back to the 5 mocks in `src/data/locations.json` only pre-geo. Home dispatches `SET_CANDIDATES` when geo grants; voice's ZIP fence dispatches it after `resolveByZip`. The 5 mocks remain in the file as a fallback and as the DevTools override picker.

## Open questions

Bigger pieces, sequenced. Decisions in **bold** are already locked in with Adam.

- ~~**Order-type-first prompt + delivery routing.**~~ ✅ **Shipped.** Greeting asks pickup-or-delivery up front. Delivery branch emits a ` ```handoff ` JSON fence (`handoffParser.ts`) which the screen consumes to navigate to `/order/delivery` (`replace: true`). System prompt + mock both updated. Pickup branch resumes the existing item-collection flow.
- ~~**Nearest-store lookup (`useNearestLocation` hook).**~~ ✅ **Shipped** at `src/hooks/useNearestLocation.ts`. The Home screen owns the geo prompt — voice never re-prompts (avoids the back-to-back geo-then-mic browser dialogs). Voice flow consumes the resulting `LocationContext.selectedLocation` via the per-turn runtime context. Denied path: agent asks ZIP, emits ` ```location ` fence, screen runs `resolveByZip` and dispatches the resolved store. The 5.4MB `wendys-locations.json` lazy-loads on first use (Vite splits it into its own chunk).
- ~~**Voice location confirmation flow.**~~ ✅ **Shipped end-to-end.** Conversation logic asks pickup method after location is confirmed (granted) or after the ZIP resolves (denied). Visual tiles render on `/voice` between the agent text and the lottie button when `permission === 'granted'` and no method is confirmed. Tap or voice are equivalent — both go through `SET_FULFILLMENT` + a `[system: pickup_method_selected: <id>]` nudge. Voice→tile sync rides on a `set_fulfillment` action on the existing `location` fence (so the agent emits one fence with `{ "action": "set_fulfillment", "method": "drive-thru" }` when it hears a method). Matching tile pulses + checkmarks for 600ms on null→set transition, then the row fades out.
- **Build-as-you-go visual draft order.** The big one. Items appear visually as the agent confirms them and update in place as the user modifies (single → combo → size → drink). **Decided: voice-local draft state inside `VoiceOrderingScreen`; nothing hits `BagContext` until the user taps "Review in bag" (atomic transfer).** Combo visualization: three small image circles (entrée + side + drink) inside the tile. Modifications mutate the existing tile rather than appending a new one. Streaming the order JSON across turns (vs. emitting only at close) is one approach; a separate "current draft" tool/structure is another. To be designed.
- ~~**Read-back of location + pickup method at close.**~~ ✅ **Shipped.** System prompt's Closing section now templates "[N] items for [method] at [store name] — you'll see it in your bag." with explicit mapping for the hyphenated method ids and a graceful fallback when method/store aren't in context.
- **Final FAB icon + placement.** Adam to provide.
- **iOS Safari STT.** Web Speech API is unreliable; Whisper-via-proxy is the planned fallback.

## What does NOT belong here

- **Anything stateful that's not voice-specific** — keep it in the existing contexts (`BagContext`, `LocationContext`, etc.)
- **Hand-edits to vendored JSON** — they'll be clobbered by `refresh-voice-data`. Edit upstream instead.
- **The data pipeline itself** — Playwright scrapers, merge build, locations scraper. They live in the sibling repo for a reason (different lifecycle, heavy deps).
