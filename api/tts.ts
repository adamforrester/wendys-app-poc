/**
 * Vercel-style serverless function: ElevenLabs TTS.
 *
 * STATUS: Not yet deployed. Stub is real code — set env vars (see api/README.md)
 * to go live. No SDK install needed; uses plain `fetch`.
 *
 * Browser request body:
 *   { text: string, voice_id?: string, model_id?: string }
 *
 * Response: audio/mpeg blob.
 */

type Req = { method?: string; body?: unknown };
type Res = {
  status: (n: number) => Res;
  json: (b: unknown) => void;
  send?: (b: unknown) => void;
  setHeader?: (k: string, v: string) => void;
  end?: (b?: unknown) => void;
};

interface TTSRequestBody {
  text?: string;
  voice_id?: string;
  model_id?: string;
}

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // ElevenLabs "Rachel" — safe default
const DEFAULT_MODEL_ID = 'eleven_turbo_v2';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = (req.body ?? {}) as TTSRequestBody;
  if (!body.text || typeof body.text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = body.voice_id ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
  if (!apiKey) {
    res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured.' });
    return;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: body.text,
        model_id: body.model_id ?? DEFAULT_MODEL_ID,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      res.status(502).json({ error: `ElevenLabs returned ${response.status}: ${detail}` });
      return;
    }

    const buf = Buffer.from(await response.arrayBuffer());
    res.setHeader?.('Content-Type', 'audio/mpeg');
    // Vercel-style: res.send(buffer) sets length and ends the response.
    if (res.send) res.send(buf);
    else if (res.end) res.end(buf);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown TTS error';
    res.status(502).json({ error: `TTS proxy failed: ${message}` });
  }
}
