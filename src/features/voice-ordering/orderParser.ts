/**
 * Parses Claude's `\`\`\`order` JSON code fence and resolves item names
 * to SemanticItems. Returns a ParsedOrder ready for the bag flow.
 *
 * Resolution rules:
 *   1. If `id` is present and we know it, use that.
 *   2. Else look up `name` via useSemanticMenu().resolveByName().
 *   3. Else flag a resolution warning so the panel can surface "needs review".
 */

import type {
  OrderJson,
  OrderJsonItem,
  ParsedOrder,
  ResolvedOrderItem,
  SemanticItem,
} from './types';

const ORDER_FENCE = /```order\s*\n([\s\S]*?)```/;

/** Extract the fenced JSON block, parse it, return null if missing or invalid. */
export function extractOrderJson(responseText: string): OrderJson | null {
  const match = responseText.match(ORDER_FENCE);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    // Minimal shape validation; we don't bail on missing optional fields.
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed as OrderJson;
  } catch {
    return null;
  }
}

/** Strip the `\`\`\`order` block from a response so it isn't shown to the user. */
export function stripOrderFence(responseText: string): string {
  return responseText.replace(ORDER_FENCE, '').trim();
}

interface ResolverArgs {
  getItemById: (id: string) => SemanticItem | undefined;
  resolveByName: (name: string) => SemanticItem | undefined;
}

export function resolveOrder(order: OrderJson, resolver: ResolverArgs): ParsedOrder {
  const items: ResolvedOrderItem[] = order.items.map(source => resolveItem(source, resolver));
  const fullyResolved = items.every(i => i.resolved !== null);
  return {
    items,
    estimated_subtotal: order.estimated_subtotal ?? null,
    notes: order.notes ?? '',
    fullyResolved,
  };
}

function resolveItem(source: OrderJsonItem, resolver: ResolverArgs): ResolvedOrderItem {
  if (source.id_pending) {
    // LLM explicitly flagged the ID isn't known yet — try by name as a courtesy.
    const byName = resolver.resolveByName(source.name);
    if (byName) return { source, resolved: byName };
    return {
      source,
      resolved: null,
      resolutionWarning: `LTO/unknown item "${source.name}" — needs manual review.`,
    };
  }

  if (source.id) {
    const direct = resolver.getItemById(source.id);
    if (direct) return { source, resolved: direct };
    // Fall through — id miss isn't fatal if name resolves.
  }

  const byName = resolver.resolveByName(source.name);
  if (byName) return { source, resolved: byName };

  return {
    source,
    resolved: null,
    resolutionWarning: `Could not resolve "${source.name}" — name not found in menu.`,
  };
}

/**
 * Parse + resolve in one step. Returns null when there's no order fence
 * (the assistant is still mid-conversation).
 */
export function parseAndResolveOrder(
  responseText: string,
  resolver: ResolverArgs,
): ParsedOrder | null {
  const json = extractOrderJson(responseText);
  if (!json) return null;
  return resolveOrder(json, resolver);
}
