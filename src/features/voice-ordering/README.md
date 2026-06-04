# Voice Ordering (POC)

AI-powered voice ordering for the Wendy's prototype. Customer speaks → Web Speech API STT → Claude (Haiku 4.5 via Bedrock) → ElevenLabs TTS → order lands in the existing `BagContext`.

This module is **isolated** — its only shared boundary with the rest of the app is `BagContext`. Everything else (Claude calls, TTS, conversation state) lives here. To remove the feature cleanly, delete this directory and the `voiceOrdering` flag.

## Status

Step 1 (data plumbing) complete — see `data/`. App code is not yet built.

## Directory layout (planned)

```
src/features/voice-ordering/
├── README.md                    ← you are here
├── data/                        ← vendored, regenerable
│   ├── system_prompt.md         ← LLM behavioral spec
│   ├── semantic_menu_v3.json    ← LLM menu context (180 items, voice-aware)
│   └── wendys-locations.json    ← 5,629 stores (NOT yet wired)
├── VoiceOrderingPanel.tsx       ← UI
├── useVoiceOrdering.ts          ← orchestration hook
├── useSpeechInput.ts            ← Web Speech API + Whisper-fallback adapter
├── useTTS.ts                    ← ElevenLabs TTS REST wrapper
├── useClaudeConversation.ts     ← Claude API + conversation history
├── useSemanticMenu.ts           ← read-only access to v3 (for context builder)
├── contextBuilder.ts            ← assembles runtime context for Claude
└── orderParser.ts               ← parses ```order JSON, maps to addItem()
```

## Data files — provenance

| File | Source | Refresh | Notes |
|---|---|---|---|
| `data/system_prompt.md` | Authored from FreshAI conversation design (chat-agent draft + Adam's edits) | Hand-edit | Treat as production-grade behavior spec — encodes real FreshAI rules. Frontmatter has full provenance. |
| `data/semantic_menu_v3.json` | Built by sibling `Menu Images/voice-ordering/` repo from `src/data/menu.json` + `ingredients.json` + scraped nutrition + FreshAI flows | `npm run refresh-voice-data` | 180 items including 6 Jalapeño LTOs. Carries voice aliases, disambiguation groups, allergens, ingredients_text. |
| `data/wendys-locations.json` | Scraped by sibling repo from `locations.wendys.com` | `npm run refresh-voice-data` | 5,629 real Wendy's stores with lat/lng, address, hours. Not yet consumed. Reserved for nearest-store lookup (voice POC + future Order tab integration). |

## Single source of truth

The prototype's `src/data/menu.json` and `src/data/ingredients.json` are the source of truth for menu data. `semantic_menu_v3.json` is a **derived artifact** built by the sibling voice-ordering repo. The sibling repo is a one-way data factory; this prototype is the consumer.

When you edit `menu.json` or `ingredients.json`, run:

```bash
npm run refresh-voice-data
```

This shells into `../Menu Images/voice-ordering/`, runs `npm run sync && npm run build` there, and copies `semantic_menu_v3.json` + `wendys_locations.json` back into `data/`. Don't hand-edit the vendored JSON — it'll be overwritten on the next refresh.

If the sibling repo moves, edit `VOICE_REPO` in `scripts/refresh-voice-data.js`.

## Feature flag

The voice ordering UI is gated behind the `voiceOrdering` flag in `src/config/featureFlags.ts` (default: on for POC). When off, no voice UI is rendered and no LLM calls fire.

## Architecture decisions

**Why isolate?** The prototype must remain shippable as a UX demo without the voice feature. Everything voice-specific lives here so the feature can be removed by deleting one folder. The bag never knows whether items came from the menu UI or voice — `BagContext.addItem()` is the contract.

**Why vendor data instead of importing from the sibling repo?** The prototype is a deployable app; the sibling is a build pipeline (Playwright, scrapers, ~5MB locations file). Different lifecycles, different dependency footprints. Vendoring keeps the prototype self-contained; the refresh script keeps the data current.

**Why Bedrock for Claude?** The user's existing Claude/AWS setup. A serverless proxy holds AWS credentials (never the browser) and accepts `/api/claude` and `/api/tts` requests. See parent CLAUDE.md when proxy is added.

**Why Web Speech API?** Browser-native, no key management. Caveat: Safari iOS support is historically weak. `useSpeechInput.ts` will be built with an adapter interface so a Whisper fallback (via the proxy) can be swapped in for iOS demos.

## Locations data — deferred

`wendys-locations.json` is vendored now to settle the "single source of truth" question, but no UI consumes it yet. When we wire it up:

1. Voice POC: nearest-store lookup via haversine when voice opens (so the agent can say "your nearest Wendy's is on State Street, want to order pickup?")
2. Order tab (future): replace the 5 mock locations in `src/data/locations.json` with real-data lookup based on geolocation

Both consumers should share a single haversine utility (probably `useNearestLocation.ts`).

## Future cross-references

- `src/contexts/BagContext.tsx` — order integration boundary
- `src/data/offers.json` — offer eligibility surfaced to LLM via `contextBuilder`
- `src/data/user.json` — rewards balance surfaced to LLM via `contextBuilder`
- `src/config/featureFlags.ts` — `voiceOrdering` flag
- `assets/wendys-prototype-prd.md` — overall prototype spec
- `../Menu Images/voice-ordering/` — sibling data pipeline repo
