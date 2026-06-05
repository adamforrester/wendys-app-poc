/**
 * Parses Claude's `\`\`\`handoff` JSON code fence.
 *
 * Mirrors orderParser.ts in shape and intent: the agent emits a small
 * structured block when it decides the rest of the flow belongs somewhere
 * else (today only `destination: "delivery"`), and the screen routes
 * accordingly. Keeping order + handoff as separate fences means a single
 * turn could in principle do both — though in practice they don't overlap.
 */

import type { Handoff } from './types';

const HANDOFF_FENCE = /```handoff\s*\n([\s\S]*?)```/;

/** Extract the fenced JSON, parse it, return null if missing or invalid. */
export function extractHandoff(responseText: string): Handoff | null {
  const match = responseText.match(HANDOFF_FENCE);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (!parsed || typeof parsed.destination !== 'string') return null;
    if (parsed.destination !== 'delivery') return null;
    return {
      destination: parsed.destination,
      reason: typeof parsed.reason === 'string' ? parsed.reason : undefined,
    };
  } catch {
    return null;
  }
}

/** Strip the `\`\`\`handoff` block so it isn't shown to the user. */
export function stripHandoffFence(responseText: string): string {
  return responseText.replace(HANDOFF_FENCE, '').trim();
}
