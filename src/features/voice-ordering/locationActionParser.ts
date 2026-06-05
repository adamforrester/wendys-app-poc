/**
 * Parses Claude's `\`\`\`location` JSON fence — used today only to ask
 * the app to resolve a customer-supplied ZIP into a real Wendy's store.
 *
 * Mirrors orderParser + handoffParser in shape. The agent never touches
 * the locations dataset directly; it emits this fence and the screen
 * runs `useNearestLocation.resolveByZip()` and feeds the result back via
 * the next turn's runtime context.
 */

import type { LocationAction } from './types';

const LOCATION_FENCE = /```location\s*\n?([\s\S]*?)```/;

/** True when a `\`\`\`location` block exists in the reply, regardless of its
 * payload validity. Used to know whether to strip and whether to surface
 * a recovery nudge when the payload is malformed. */
export function hasLocationFence(responseText: string): boolean {
  return LOCATION_FENCE.test(responseText);
}

export function extractLocationAction(responseText: string): LocationAction | null {
  const match = responseText.match(LOCATION_FENCE);
  if (!match) return null;
  const body = match[1];
  // Strict path: well-formed JSON with action + zip.
  try {
    const parsed = JSON.parse(body);
    if (parsed && parsed.action === 'resolve_zip' && typeof parsed.zip === 'string') {
      const zip = parsed.zip.trim();
      if (zip) return { action: 'resolve_zip', zip };
    }
  } catch {
    // fall through to lenient extraction
  }
  // Lenient fallback: pull any 5-digit ZIP from the fence body. Catches
  // the case where the model invented a wrong field name ("city": ...,
  // "zipcode": ...) or got the JSON shape slightly off. Better to recover
  // than leave the user staring at a leaked code fence.
  const zipMatch = body.match(/\b(\d{5})\b/);
  if (zipMatch) return { action: 'resolve_zip', zip: zipMatch[1] };
  return null;
}

export function stripLocationFence(responseText: string): string {
  return responseText.replace(LOCATION_FENCE, '').trim();
}
