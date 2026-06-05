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

const LOCATION_FENCE = /```location\s*\n([\s\S]*?)```/;

export function extractLocationAction(responseText: string): LocationAction | null {
  const match = responseText.match(LOCATION_FENCE);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (!parsed || typeof parsed.action !== 'string') return null;
    if (parsed.action !== 'resolve_zip') return null;
    if (typeof parsed.zip !== 'string') return null;
    const zip = parsed.zip.trim();
    if (!zip) return null;
    return { action: 'resolve_zip', zip };
  } catch {
    return null;
  }
}

export function stripLocationFence(responseText: string): string {
  return responseText.replace(LOCATION_FENCE, '').trim();
}
