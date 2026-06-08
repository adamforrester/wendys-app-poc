/**
 * Orchestrates a turn-based conversation with Claude (or the mock).
 *
 * Owns:
 *   - Conversation history
 *   - Per-turn runtime context assembly (menu summary + bag + offers + rewards)
 *   - System prompt + context injection
 *   - Mock vs. live routing via the `voiceOrdering` feature flag
 *   - Parse + resolve `\`\`\`order` JSON blocks → BagContext.addItem()
 *
 * Boundary with the rest of the app: BagContext (read state, dispatch ADD_ITEM).
 * Everything else is voice-internal.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import offersJson from '../../data/offers.json';
import systemPromptRaw from './data/system_prompt.md?raw';
import { useBag } from '../../context/BagContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { useNearestLocation } from '../../hooks/useNearestLocation';
import { useSemanticMenu } from './useSemanticMenu';
import { useMockConversation } from './useMockConversation';
import { buildRuntimeContext, renderRuntimeContext } from './contextBuilder';
import { parseAndResolveOrder, stripOrderFence } from './orderParser';
import { extractHandoff, stripHandoffFence } from './handoffParser';
import { extractLocationAction, hasLocationFence, stripLocationFence } from './locationActionParser';
import { cleanReplyForDisplay, expandSpokenAbbreviations } from './cleanReply';
import type {
  ConversationMessage,
  Handoff,
  ParsedOrder,
  PickupContext,
  RewardsContext,
} from './types';
import type { Offer } from '../../data/types';
import userJson from '../../data/user.json';

const allOffers = (offersJson as { offers: Offer[] }).offers;
const userData = userJson as unknown as {
  authenticatedUser: {
    rewardsProfile: {
      points: number;
      tier: string;
      tierProgress: { nextTier: string; pointsToNextTier: number };
    };
  };
};

/**
 * Strip frontmatter from system_prompt.md raw import. The frontmatter is
 * for human/agent context, not for Claude.
 */
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  if (end === -1) return md;
  return md.slice(end + 4).trimStart();
}

const SYSTEM_PROMPT_BODY = stripFrontmatter(systemPromptRaw);

let messageIdSeq = 0;
const nextId = () => `msg_${++messageIdSeq}_${Date.now().toString(36)}`;

export interface UseClaudeConversationOptions {
  /** Override the proxy URL when in 'live' mode. Default: '/api/claude'. */
  liveEndpoint?: string;
}

export function useClaudeConversation(options: UseClaudeConversationOptions = {}) {
  const { liveEndpoint = '/api/claude' } = options;
  const { flags } = useFeatureFlags();
  const { state: bagState, dispatch: bagDispatch } = useBag();
  const { state: authState } = useAuth();
  const { state: locationState, dispatch: locationDispatch } = useLocationCtx();
  // The voice flow does NOT auto-prompt — Home owns the geo prompt.
  // We just want resolveByZip for the denied-geo branch.
  const nearest = useNearestLocation({ autoRun: false });
  const semanticMenu = useSemanticMenu();
  const mock = useMockConversation();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsedOrder, setLastParsedOrder] = useState<ParsedOrder | null>(null);
  const [lastHandoff, setLastHandoff] = useState<Handoff | null>(null);
  // Synthetic input queued from inside a turn (e.g. after a ZIP resolves)
  // and fired after that turn's `pending` flag clears. State (not ref)
  // so a useEffect downstream can react when it lands. See the
  // resolve_zip branch in `send` for context.
  const [pendingNudge, setPendingNudge] = useState<string | null>(null);

  // Cache the menu summary — it's static per build, expensive-ish to format.
  const menuSummaryRef = useRef<string | null>(null);
  if (menuSummaryRef.current == null) {
    menuSummaryRef.current = semanticMenu.buildMenuSummary();
  }

  /** Build the rewards context fragment, or null for guests. */
  const buildRewardsContext = useCallback((): RewardsContext | null => {
    if (!authState.isAuthenticated || !userData.authenticatedUser) return null;
    const rp = userData.authenticatedUser.rewardsProfile;
    return {
      points: rp.points,
      tier: rp.tier,
      pointsToNextTier: rp.tierProgress.pointsToNextTier,
      nextTier: rp.tierProgress.nextTier,
    };
  }, [authState.isAuthenticated]);

  /**
   * Build the pickup context fragment from LocationContext. The home
   * screen sets this when geolocation resolves; the voice flow reads it
   * to decide whether to confirm an existing store, ask for a ZIP, or
   * wait for the home screen to finish loading.
   */
  const buildPickupContext = useCallback((): PickupContext => {
    const loc = locationState.selectedLocation;
    // Expand abbreviations BEFORE handing to the agent — the agent reads
    // the context verbatim, and ElevenLabs reads "Nw" letter-by-letter.
    // Doing it here means cleanReply doesn't have to catch every shape
    // the agent might surface in its reply.
    return {
      permission: locationState.locationPermission,
      storeName: loc?.name ? expandSpokenAbbreviations(loc.name) : null,
      storeAddress: loc
        ? expandSpokenAbbreviations(
            `${loc.address.street}, ${loc.address.city}, ${loc.address.state} ${loc.address.zip}`,
          )
        : null,
      storeId: loc?.id ?? null,
      fulfillmentMethod: locationState.fulfillmentMethod ?? null,
    };
  }, [locationState]);

  /**
   * Compose the system prompt as a two-block array so the static prefix
   * (behavior spec + menu — ~6k tokens, never changes within a session) is
   * cacheable, and only the small dynamic block (bag/offers/rewards — a
   * couple hundred tokens) re-flows each turn.
   *
   * Anthropic's prompt cache: `cache_control: { type: 'ephemeral' }` on a
   * content block tells the API to cache that block (5-min TTL by default).
   * Subsequent requests that prefix-match the cached block read from cache
   * at ~10% of normal input cost. Bedrock supports the same shape.
   *
   * Effective per-turn cost: ~$0.001 instead of ~$0.005.
   */
  const composeSystemPrompt = useCallback(() => {
    const ctx = buildRuntimeContext({
      menuSummary: menuSummaryRef.current!,
      bagItems: bagState.items,
      offers: allOffers,
      rewards: buildRewardsContext(),
      pickup: buildPickupContext(),
    });
    return [
      {
        type: 'text' as const,
        // Static across the session: behavior spec + menu summary.
        text: `${SYSTEM_PROMPT_BODY}\n\n## MENU\n${menuSummaryRef.current!}`,
        cache_control: { type: 'ephemeral' as const },
      },
      {
        type: 'text' as const,
        // Dynamic per turn: bag, offers, rewards. Not cached.
        text: renderRuntimeContext({ ...ctx, menuSummary: '' }),
      },
    ];
  }, [bagState.items, buildRewardsContext, buildPickupContext]);

  /** Send a user message, get a reply, route order JSON to the bag. */
  const send = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || pending) return;
      setError(null);

      const userMsg: ConversationMessage = {
        id: nextId(),
        role: 'user',
        content: userInput,
        timestamp: Date.now(),
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setPending(true);

      try {
        let assistantText: string;
        if (flags.voiceOrdering === 'mock') {
          assistantText = await mock.generate(userInput);
        } else if (flags.voiceOrdering === 'live') {
          assistantText = await callLiveProxy({
            endpoint: liveEndpoint,
            system: composeSystemPrompt(),
            messages: nextHistory.map(m => ({ role: m.role, content: m.content })),
          });
        } else {
          throw new Error('Voice ordering is off — flip the flag to "mock" or "live".');
        }

        // Try to parse an order block. Strip it from the visible text.
        const parsed = parseAndResolveOrder(assistantText, {
          getItemById: semanticMenu.getItemById,
          resolveByName: semanticMenu.resolveByName,
        });

        // Try to parse a handoff block (e.g. delivery routing).
        const handoff = extractHandoff(assistantText);

        // Try to parse a location action (ZIP → resolve nearest store).
        // We track fence presence separately from action validity: if a
        // fence exists but the JSON is malformed, we still want to strip
        // it from the visible reply (otherwise the user sees raw JSON).
        const locationAction = extractLocationAction(assistantText);
        const locationFenceLeaked = hasLocationFence(assistantText) && !locationAction;

        let cleanedSource = assistantText;
        if (parsed) cleanedSource = stripOrderFence(cleanedSource);
        if (handoff) cleanedSource = stripHandoffFence(cleanedSource);
        if (locationAction || locationFenceLeaked) cleanedSource = stripLocationFence(cleanedSource);
        const visibleText = cleanReplyForDisplay(cleanedSource);
        const resolutionNotes = parsed
          ? parsed.items.flatMap(i => (i.resolutionWarning ? [i.resolutionWarning] : []))
          : undefined;

        const assistantMsg: ConversationMessage = {
          id: nextId(),
          role: 'assistant',
          content: visibleText,
          timestamp: Date.now(),
          parsedOrder: parsed ?? undefined,
          resolutionNotes,
        };
        setMessages(h => [...h, assistantMsg]);

        if (handoff) {
          setLastHandoff(handoff);
        }

        // Apply a fulfillment-method choice the agent heard. Mirrors the
        // tap-tile path on screen — same dispatch, same nudge — so voice
        // and tap stay in sync. Tile flash is driven off the resulting
        // null→set transition in fulfillmentMethod, not from here.
        if (locationAction?.action === 'set_fulfillment') {
          locationDispatch({ type: 'SET_FULFILLMENT', method: locationAction.method });
          setPendingNudge(`[system: pickup_method_selected: ${locationAction.method}]`);
        }
        // Resolve a customer-supplied ZIP into a real store. The next
        // turn's runtime context (built by contextBuilder.ts) will see
        // the freshly-set selectedLocation so the agent can confirm by
        // name without inventing one. Errors are silent here — the
        // agent will see permission still denied/no store on the next
        // turn and can re-ask. Fire-and-forget — do not block this turn.
        if (locationAction?.action === 'resolve_zip') {
          // Resolve, dispatch, then nudge a follow-up turn so the agent
          // can confirm the store by name. Without the synthetic nudge
          // the agent has no way to "speak" again — the conversation's
          // only trigger is a user utterance. The nudge is queued in
          // pendingNudgeRef and fired in the `finally` block below,
          // after `pending` has reset (otherwise `send` would early-
          // return on the pending guard).
          //
          // The sentinel string is documented in the system prompt so
          // the model knows what to do when it sees it. It's not read
          // aloud — only assistant messages drive TTS.
          void nearest.resolveByZip(locationAction.zip).then(loc => {
            if (!loc) {
              setPendingNudge('[system: zip_not_found]');
              return;
            }
            locationDispatch({ type: 'SET_LOCATION', location: loc });
            locationDispatch({ type: 'SET_PERMISSION', permission: 'granted' });
            setPendingNudge('[system: location_resolved]');
          });
        } else if (locationFenceLeaked) {
          // Malformed fence (e.g. agent guessed at a "city" field). Tell
          // the agent to recover with a real ZIP — same nudge path as a
          // genuinely missed lookup.
          setPendingNudge('[system: zip_not_found]');
        }

        // If we got a complete, fully-resolved order, push items to the bag.
        if (parsed) {
          setLastParsedOrder(parsed);
          for (const item of parsed.items) {
            if (!item.resolved) continue;
            bagDispatch({
              type: 'ADD_ITEM',
              item: {
                id: `${item.resolved.id}-voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                menuItemId: item.resolved.id,
                name: item.resolved.name,
                quantity: item.source.quantity || 1,
                price: item.resolved.base_price ?? 0,
                customizations: {
                  removed:
                    item.source.modifiers
                      ?.filter(m => m.type === 'remove' || m.type === 'no')
                      .map(m => m.ingredient) ?? [],
                },
                comboSelections: item.source.is_combo
                  ? {
                      side: { id: 'fries-medium', name: 'French Fries (Medium)' },
                      drink: {
                        id: 'voice-drink',
                        name: item.source.combo_drink ?? 'Drink',
                      },
                      sizeUpgrade: item.source.combo_size === 'large',
                    }
                  : null,
              },
            });
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error contacting the assistant.';
        setError(msg);
      } finally {
        setPending(false);
      }
    },
    [bagDispatch, composeSystemPrompt, flags.voiceOrdering, liveEndpoint, locationDispatch, messages, mock, nearest, pending, semanticMenu.getItemById, semanticMenu.resolveByName],
  );

  // Drain a queued nudge once the previous turn finishes. The send ref
  // dance is just to satisfy the deps lint without re-firing the effect
  // when send identity changes between renders (it does, every turn).
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  useEffect(() => {
    if (!pendingNudge || pending) return;
    const nudge = pendingNudge;
    setPendingNudge(null);
    void sendRef.current(nudge);
  }, [pendingNudge, pending]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastParsedOrder(null);
    setLastHandoff(null);
    setPendingNudge(null);
    mock.reset();
  }, [mock]);

  /**
   * Queue a synthetic `[system: ...]` nudge from outside the turn loop —
   * e.g. when the user taps a UI control whose effect should look the
   * same to the agent as a customer utterance the parser would have
   * intercepted (pickup-method tiles).
   *
   * Goes through the same drain queue as fence-driven nudges so it
   * waits politely if a reply is mid-flight.
   */
  const queueNudge = useCallback((nudge: string) => {
    setPendingNudge(nudge);
  }, []);

  return useMemo(
    () => ({
      messages,
      pending,
      error,
      lastParsedOrder,
      lastHandoff,
      send,
      queueNudge,
      reset,
      mode: flags.voiceOrdering,
      systemPrompt: SYSTEM_PROMPT_BODY,
    }),
    [messages, pending, error, lastParsedOrder, lastHandoff, send, queueNudge, reset, flags.voiceOrdering],
  );
}

/* ── Live proxy call ── */

interface SystemContentBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

interface LiveCallArgs {
  endpoint: string;
  system: string | SystemContentBlock[];
  messages: { role: 'user' | 'assistant'; content: string }[];
}

async function callLiveProxy({ endpoint, system, messages }: LiveCallArgs): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Model defaults handled server-side based on transport (anthropic vs bedrock).
      max_tokens: 1024,
      system,
      messages,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Proxy returned ${response.status}: ${detail || response.statusText}`);
  }
  const json = await response.json();
  // Anthropic-shaped response: { content: [{ type: 'text', text: '...' }, ...] }
  const text = Array.isArray(json?.content)
    ? json.content
        .filter((c: { type: string }) => c.type === 'text')
        .map((c: { text: string }) => c.text)
        .join('\n')
    : typeof json?.text === 'string'
      ? json.text
      : '';
  if (!text) throw new Error('Proxy response had no text content.');
  return text;
}
