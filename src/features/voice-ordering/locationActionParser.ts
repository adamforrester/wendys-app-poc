/**
 * Parses Claude's `\`\`\`location` JSON fence. Two action shapes today:
 *
 *   { "action": "resolve_zip",    "zip": "43215"         }
 *   { "action": "set_fulfillment", "method": "drive-thru" }
 *
 * Mirrors orderParser + handoffParser in shape. The agent never touches
 * LocationContext directly; it emits this fence and `useClaudeConversation`
 * runs the corresponding side effect (resolveByZip, or SET_FULFILLMENT)
 * and feeds the result back via the next turn's runtime context plus a
 * synthetic `[system: ...]` nudge.
 */

import type { LocationAction } from './types';
import type { FulfillmentMethod } from '../../context/LocationContext';

const LOCATION_FENCE = /```location\s*\n?([\s\S]*?)```/;

const FULFILLMENT_METHODS: FulfillmentMethod[] = ['drive-thru', 'dine-in', 'carry-out'];

/** Normalize anything spoken-ish ("drive thru", "DriveThru", "carry out", "carryout")
 *  into our canonical hyphenated id. Returns null if it doesn't match. */
function normalizeMethod(raw: unknown): FulfillmentMethod | null {
  if (typeof raw !== 'string') return null;
  const slug = raw.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z-]/g, '');
  // collapse "carryout" → "carry-out", "drivethru" → "drive-thru", "dinein" → "dine-in"
  const collapsed =
    slug === 'carryout' ? 'carry-out'
    : slug === 'drivethru' ? 'drive-thru'
    : slug === 'dinein' ? 'dine-in'
    : slug;
  return (FULFILLMENT_METHODS as string[]).includes(collapsed)
    ? (collapsed as FulfillmentMethod)
    : null;
}

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
  // Strict path: well-formed JSON.
  try {
    const parsed = JSON.parse(body);
    if (parsed && parsed.action === 'resolve_zip' && typeof parsed.zip === 'string') {
      const zip = parsed.zip.trim();
      if (zip) return { action: 'resolve_zip', zip };
    }
    if (parsed && parsed.action === 'set_fulfillment') {
      const method = normalizeMethod(parsed.method);
      if (method) return { action: 'set_fulfillment', method };
    }
  } catch {
    // fall through to lenient extraction
  }
  // Lenient fallbacks for slight JSON drift. Order matters: prefer the
  // explicit "set_fulfillment" signal over the raw ZIP regex so a fence
  // that mentions both (unusual) routes correctly.
  if (/set_fulfillment/.test(body)) {
    // Pull a method-ish word out of the body.
    const methodMatch = body.match(/"method"\s*:\s*"([^"]+)"/i)
      ?? body.match(/\b(drive[- ]?thru|dine[- ]?in|carry[- ]?out|carryout)\b/i);
    const method = normalizeMethod(methodMatch?.[1]);
    if (method) return { action: 'set_fulfillment', method };
  }
  // Lenient fallback for ZIP shape: pull any 5-digit ZIP from the fence body.
  // Catches the case where the model invented a wrong field name
  // ("city": ..., "zipcode": ...) or got the JSON shape slightly off.
  const zipMatch = body.match(/\b(\d{5})\b/);
  if (zipMatch) return { action: 'resolve_zip', zip: zipMatch[1] };
  return null;
}

export function stripLocationFence(responseText: string): string {
  return responseText.replace(LOCATION_FENCE, '').trim();
}
