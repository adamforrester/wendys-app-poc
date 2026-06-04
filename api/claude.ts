/**
 * Vercel-style serverless function: Claude proxy with two transports.
 *
 * Picks transport based on env:
 *   1. ANTHROPIC_API_KEY  → Anthropic API direct (preferred — simpler, cheaper, instant setup)
 *   2. AWS_*              → Bedrock (when running on AWS/VML infrastructure)
 *   neither set           → returns a clear configuration error
 *
 * Both transports are real code; the prototype builds without either SDK
 * being installed thanks to dynamic imports. We DO install both SDKs in
 * package.json so live mode works without an extra `npm i`.
 *
 * Browser request body (Anthropic SDK shape — same on both transports):
 *   { model?, max_tokens?, system, messages }
 *
 * Response: Anthropic SDK shape, e.g.
 *   { id, type, role, content: [{ type: 'text', text: '...' }], stop_reason, ... }
 */

type Req = { method?: string; body?: unknown };
type Res = {
  status: (n: number) => Res;
  json: (b: unknown) => void;
  send?: (b: unknown) => void;
  setHeader?: (k: string, v: string) => void;
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * The body shape the prototype sends. `system` may be a plain string
 * (mock-mode style) or an array of content blocks (with cache_control)
 * once we wire prompt caching client-side. Both work on both transports.
 */
interface ClaudeRequestBody {
  model?: string;
  max_tokens?: number;
  system?: string | Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }>;
  messages?: ChatMessage[];
}

const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5';
const DEFAULT_BEDROCK_MODEL = 'us.anthropic.claude-haiku-4-5-v1:0';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = (req.body ?? {}) as ClaudeRequestBody;
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }
  if (!body.system) {
    res.status(400).json({ error: 'system prompt is required' });
    return;
  }

  // Pick transport.
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const awsRegion = process.env.AWS_REGION;
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

  const transport: 'anthropic' | 'bedrock' | 'none' = anthropicKey
    ? 'anthropic'
    : awsRegion && awsAccessKey && awsSecretKey
      ? 'bedrock'
      : 'none';

  if (transport === 'none') {
    res.status(500).json({
      error:
        'No Claude transport configured. Set ANTHROPIC_API_KEY (preferred), or AWS_REGION + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY for Bedrock. See api/README.md.',
    });
    return;
  }

  try {
    const response =
      transport === 'anthropic'
        ? await callAnthropic(body, anthropicKey!)
        : await callBedrock(body, awsRegion!, awsAccessKey!, awsSecretKey!);
    res.status(200).json(response);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(502).json({ error: `${transport} call failed: ${message}` });
  }
}

/* ── Anthropic API direct ── */

async function callAnthropic(body: ClaudeRequestBody, apiKey: string) {
  // Dynamic import so the prototype builds without the SDK.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk: any = await import('@anthropic-ai/sdk').catch(() => null);
  if (!sdk) {
    throw new Error('@anthropic-ai/sdk is not installed. Run `npm i @anthropic-ai/sdk`.');
  }

  const client = new sdk.default({ apiKey });

  return await client.messages.create({
    model: body.model ?? DEFAULT_ANTHROPIC_MODEL,
    max_tokens: body.max_tokens ?? 1024,
    system: body.system,
    messages: body.messages,
  });
}

/* ── Bedrock ── */

async function callBedrock(
  body: ClaudeRequestBody,
  awsRegion: string,
  awsAccessKey: string,
  awsSecretKey: string,
) {
  // Dynamic import so the prototype builds without the SDK.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk: any = await import('@anthropic-ai/bedrock-sdk').catch(() => null);
  if (!sdk) {
    throw new Error('@anthropic-ai/bedrock-sdk is not installed. Run `npm i @anthropic-ai/bedrock-sdk`.');
  }

  const client = new sdk.AnthropicBedrock({
    awsRegion,
    awsAccessKey,
    awsSecretKey,
  });

  return await client.messages.create({
    model: body.model ?? DEFAULT_BEDROCK_MODEL,
    max_tokens: body.max_tokens ?? 1024,
    system: body.system,
    messages: body.messages,
  });
}
