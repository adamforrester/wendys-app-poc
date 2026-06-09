/**
 * Parses Claude's `\`\`\`draft` JSON fence — a per-turn snapshot of the
 * current order as the user builds it. Mirrors orderParser.ts but
 * resolves combo accompaniments (drink, side) to semantic items too,
 * so tiles can render real product imagery for the three image circles
 * in a combo viz.
 *
 * The draft fence is emitted on every order-mutating turn. The existing
 * `order` fence remains the close signal — the agent stops emitting
 * drafts once it emits an order. Both can coexist in a single closing
 * reply (the draft is the final state; the order tells the screen
 * "we're done, surface the Review CTA").
 *
 * `draft_id` is the stable identity key. The agent picks short strings
 * ("i-1", "i-2") and re-uses them across turns when modifying an
 * existing tile (e.g. single → combo → size upgrade). The screen uses
 * draftId as the React key so Framer Motion's layout animations can
 * morph the tile in place rather than unmount + remount.
 */

import type {
  DraftJson,
  DraftJsonItem,
  ParsedDraft,
  ResolvedDraftItem,
  SemanticItem,
} from './types';

const DRAFT_FENCE = /```draft\s*\n([\s\S]*?)```/;

/** Extract the fenced JSON block, parse it, return null if missing or invalid. */
export function extractDraftJson(responseText: string): DraftJson | null {
  const match = responseText.match(DRAFT_FENCE);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed as DraftJson;
  } catch {
    return null;
  }
}

/** Strip the `\`\`\`draft` block from a response so it isn't shown to the user. */
export function stripDraftFence(responseText: string): string {
  return responseText.replace(DRAFT_FENCE, '').trim();
}

interface ResolverArgs {
  getItemById: (id: string) => SemanticItem | undefined;
  resolveByName: (name: string) => SemanticItem | undefined;
}

/**
 * Try a few strategies to map a freeform string ("Strawberry Lemonade",
 * "Medium Fry", "Coke") to a semantic item. Returns null when the agent
 * supplies no string OR resolution fails — caller renders the generic
 * fallback in that case.
 */
function resolveAccompaniment(
  raw: string | null | undefined,
  resolver: ResolverArgs,
): SemanticItem | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const byName = resolver.resolveByName(trimmed);
  return byName ?? null;
}

function resolveDraftItem(source: DraftJsonItem, resolver: ResolverArgs): ResolvedDraftItem {
  // Entrée resolution — same precedence as orderParser: id_pending → name,
  // then id, then name with a contains-by-word fallback.
  let resolved: SemanticItem | null = null;
  let resolutionWarning: string | undefined;

  if (source.id_pending) {
    resolved = resolver.resolveByName(source.name) ?? null;
    if (!resolved) {
      resolutionWarning = `LTO/unknown item "${source.name}" — needs manual review.`;
    }
  } else {
    if (source.id) {
      resolved = resolver.getItemById(source.id) ?? null;
    }
    if (!resolved) {
      resolved = resolver.resolveByName(source.name) ?? null;
    }
    if (!resolved) {
      resolutionWarning = `Could not resolve "${source.name}" — name not found in menu.`;
    }
  }

  // Combo accompaniments — null when not a combo OR when the agent left
  // them blank (mid-conversation, before the user has picked a drink).
  // Tiles render a generic placeholder for unresolved drinks/sides so
  // the third circle isn't empty mid-flow.
  const comboDrink = source.is_combo ? resolveAccompaniment(source.combo_drink, resolver) : null;
  const comboSide = source.is_combo ? resolveAccompaniment(source.combo_side, resolver) : null;

  return {
    draftId: source.draft_id,
    source,
    resolved,
    comboDrink,
    comboSide,
    resolutionWarning,
  };
}

export function resolveDraft(draft: DraftJson, resolver: ResolverArgs): ParsedDraft {
  // Filter out items missing draft_id — without identity we can't morph
  // tiles correctly across turns. Treat as agent error and drop silently;
  // the next turn's draft should be cleaner.
  const items: ResolvedDraftItem[] = draft.items
    .filter(i => typeof i.draft_id === 'string' && i.draft_id.length > 0)
    .map(source => resolveDraftItem(source, resolver));
  return { items, notes: draft.notes ?? '' };
}

/** Parse + resolve in one step. Returns null when there's no draft fence. */
export function parseAndResolveDraft(
  responseText: string,
  resolver: ResolverArgs,
): ParsedDraft | null {
  const json = extractDraftJson(responseText);
  if (!json) return null;
  return resolveDraft(json, resolver);
}
