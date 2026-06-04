# Voice Ordering Proxy

Serverless functions that hold Anthropic / AWS / ElevenLabs credentials and proxy them on behalf of the browser. The browser **never** sees keys.

## TL;DR — go live locally (Anthropic-direct, fastest path)

1. Sign up at **console.anthropic.com**, generate an API key (starts with `sk-ant-...`).
2. Copy `.env.example` → `.env.local`, paste your key as `ANTHROPIC_API_KEY=sk-ant-...`.
3. Restart `npm run dev`.
4. In the running app: Account → Developer Tools → **Voice Ordering** → **Live**.
5. Open the panel and try a turn.

That's it. No deploy required for local testing — Vite serves the proxy via dev middleware. Errors surface as red banners in the panel; full server-side errors print to the dev-server terminal.

## Two transports, one endpoint

`api/claude.ts` automatically picks transport based on which env vars are set:

| Priority | Env vars | Transport | When to use |
|---|---|---|---|
| 1 (preferred) | `ANTHROPIC_API_KEY` | Anthropic API direct via `@anthropic-ai/sdk` | Default for POC. Simplest setup. $5 free credit. Personal billing. |
| 2 (fallback) | `AWS_REGION` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | Bedrock via `@anthropic-ai/bedrock-sdk` | When running on AWS or when company billing is preferred. |
| — | (none) | None | Returns a clean configuration error. |

Same Claude Haiku 4.5 model on both paths. Same response shape. The browser doesn't know which transport was used.

## Endpoints

| File | Purpose | Body shape |
|---|---|---|
| `claude.ts` | Calls Claude Haiku 4.5 (Anthropic or Bedrock). Returns Anthropic-shaped `{ content: [{ type: 'text', text }] }`. | `{ model?, max_tokens?, system, messages }` where `system` may be a string or `[{ type, text, cache_control? }]` array (for prompt caching). |
| `tts.ts` | Calls ElevenLabs TTS REST endpoint, returns `audio/mpeg`. | `{ text, voice_id?, model_id? }` |

## Prompt caching

The voice client sends `system` as a two-block array: a static prefix (behavior spec + menu summary, ~6k tokens) marked `cache_control: { type: 'ephemeral' }`, and a small dynamic suffix (current bag, offers, rewards) without cache control. Anthropic caches the prefix for ~5 minutes; subsequent turns within a session read from cache at 10% of normal input cost.

Effective per-turn cost: **~$0.001 instead of ~$0.005** (5× reduction). Both Anthropic and Bedrock support the same cache_control format.

## Required env vars

```bash
# Pick ONE Claude transport:

# (preferred)
ANTHROPIC_API_KEY=sk-ant-...

# (fallback — Bedrock)
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# TTS (separate)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM   # optional; default Rachel
```

## Local dev (no deploy)

`scripts/vite-api-middleware.ts` mounts these handlers at `/api/claude` and `/api/tts` during `npm run dev`. It also loads `.env.local` at boot.

- Edit `.env.local` → restart `npm run dev` → endpoints work at `http://localhost:5173/api/...`
- Browser fetches `/api/claude` (relative URL); same-origin, no CORS.
- Server-side errors print under `[voice-ordering:dev-api]` in the dev terminal.

## Deploying

**Vercel (recommended).** Push to a Vercel project; the `api/` directory is auto-discovered. Set env vars in the Vercel project settings (not in `.env.local`).

**Netlify.** Move handlers into `netlify/functions/` and adapt to Netlify's `{ statusCode, body, headers }` signature.

## Going from `mock` to `live`

Once env vars are in place and the server is restarted:

1. **Developer Tools** → Voice Ordering → **Live**.
2. Optionally pass `useClaudeConversation({ liveEndpoint: 'https://...' })` to point at a deployed proxy instead of the local middleware.
3. The mock script (`useMockConversation.ts`) is no longer invoked.

## Troubleshooting

| Error in panel | Cause | Fix |
|---|---|---|
| `No Claude transport configured.` | No env vars set or dev server not restarted | `cp .env.example .env.local`, fill in `ANTHROPIC_API_KEY`, restart `npm run dev` |
| `anthropic call failed: 401` | Bad API key, expired, or revoked | Regenerate at console.anthropic.com |
| `anthropic call failed: 429` | Rate limited or out of credits | Check usage at console.anthropic.com/settings/billing |
| `bedrock call failed: AccessDenied` | IAM lacks `bedrock:InvokeModel` for the model | Update IAM policy or model ID |
| `bedrock call failed: ValidationException` | Wrong model ID for region | Try `us-east-2`, or use the cross-region inference profile (default) |
| `bedrock call failed: UnrecognizedClientException` | Wrong/expired AWS access key | Regenerate IAM credentials |
| `ELEVENLABS_API_KEY not configured` | TTS env var missing (only blocks TTS, not chat) | Set `ELEVENLABS_API_KEY` if you need TTS |
| Proxy returned 500 (no detail) | Server-side error not surfaced | Check the dev-server terminal — full stack is logged under `[voice-ordering:dev-api]` |
