/**
 * Voice Ordering — type definitions.
 *
 * Mirrors the shape of semantic_menu_v3.json and the conversation/order
 * structures used between the LLM, parser, and BagContext. The semantic
 * menu types are deliberately lenient (`?`-marked fields) because v3
 * coverage is partial (76/180 items have modifiers, 25/180 have voice).
 */

/* ── semantic_menu_v3.json ── */

export interface SemanticNutrition {
  calories?: number | null;
  total_fat_g?: number | null;
  saturated_fat_g?: number | null;
  trans_fat_g?: number | null;
  cholesterol_mg?: number | null;
  sodium_mg?: number | null;
  total_carbs_g?: number | null;
  fiber_g?: number | null;
  sugars_g?: number | null;
  protein_g?: number | null;
  source?: string | null;
}

export interface SemanticModifierIngredient {
  id: string;
  name: string;
  category?: string;
  modifiers?: string[];
}

export interface SemanticModifierAddOn {
  id: string;
  name: string;
  price?: number;
  calories?: number;
  isFeaturedUpsell?: boolean;
  maxQuantity?: number;
}

export interface SemanticModifiers {
  removable?: SemanticModifierIngredient[];
  addable?: SemanticModifierAddOn[];
  addOnGroup?: string;
}

export interface SemanticTags {
  intent_tags?: string[];
  context_tags?: string[];
  value_tier?: string;
  pairs_with?: string[];
  customizable?: boolean;
}

export interface VoiceEntryUtterance {
  pattern: string;
  turns: number;
}

export interface VoiceMetadata {
  spoken_names_en?: string[];
  spoken_names_es?: string[];
  disambiguation_group?: string | null;
  combo_eligible?: boolean;
  requires_disambiguation?: boolean;
  entry_utterances?: VoiceEntryUtterance[];
  _source?: string;
  _umbrella?: string;
}

export interface SemanticItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productType: string;
  isCombo: boolean;
  base_price: number | null;
  calories_estimated?: { min: number; max: number } | null;
  nutrition?: SemanticNutrition;
  allergens?: string[];
  description?: string;
  ingredients_text?: string;
  modifiers?: SemanticModifiers;
  semantic?: SemanticTags;
  voice?: VoiceMetadata;
  comboConfig?: unknown; // not consumed by voice context
  isLTO?: boolean;
  daypart?: string;
  pending?: { real_id?: boolean; price?: boolean; image?: boolean; nutrition?: boolean };
}

export interface SemanticCategory {
  id: string;
  name: string;
  description?: string | null;
  items: SemanticItem[];
}

export interface SemanticMenu {
  _meta?: Record<string, unknown>;
  categories: SemanticCategory[];
}

/* ── Conversation ── */

export type Speaker = 'user' | 'assistant' | 'system';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationMessage extends ConversationTurn {
  id: string;
  timestamp: number;
  /** Optional parsed-order summary attached to assistant messages that completed an order. */
  parsedOrder?: ParsedOrder;
  /** Optional resolution diagnostics — IDs that were missing or pending. */
  resolutionNotes?: string[];
}

/* ── Parsed order JSON (output by Claude) ── */

export interface OrderJsonModifier {
  type: 'remove' | 'add' | 'extra' | 'light' | 'no';
  ingredient: string;
}

export interface OrderJsonItem {
  id?: string;
  name: string;
  quantity: number;
  modifiers?: OrderJsonModifier[];
  is_combo?: boolean;
  combo_drink?: string | null;
  combo_size?: string | null;
  id_pending?: boolean;
}

export interface OrderJson {
  items: OrderJsonItem[];
  estimated_subtotal?: number | null;
  notes?: string;
}

export interface ResolvedOrderItem {
  /** The raw item from Claude's order JSON. */
  source: OrderJsonItem;
  /** The semantic item we resolved it to. Null if no resolution was possible. */
  resolved: SemanticItem | null;
  /** Why we couldn't resolve, if applicable. */
  resolutionWarning?: string;
}

export interface ParsedOrder {
  items: ResolvedOrderItem[];
  estimated_subtotal: number | null;
  notes: string;
  /** True when every source item resolved to a real SemanticItem. */
  fullyResolved: boolean;
}

/* ── Draft order (build-as-you-go, output every order-mutating turn) ── */

/**
 * The agent emits a ```draft fence after every turn that adds, modifies,
 * or removes an item. Identical shape to OrderJsonItem plus a stable
 * `draft_id` string the agent picks (e.g. "i-1", "i-2") so the screen
 * can morph the existing tile in place rather than blink it out and
 * back in for size/combo/drink mutations.
 *
 * The draft is voice-local — it never touches BagContext until the
 * user taps "Review in bag" (atomic transfer). The existing ```order
 * fence remains the close signal; the agent emits it ONCE the user
 * is done and stops emitting drafts after that.
 */
export interface DraftJsonItem extends OrderJsonItem {
  /** Stable id chosen by the agent to identify this tile across turns. */
  draft_id: string;
  /** Optional combo side override (default: medium fries). */
  combo_side?: string | null;
  /**
   * Optional combo product id (e.g. "2488" for Dave's Combo) when the
   * item is a combo. The tile uses this to fetch the combo's combo
   * `base_price` for the header price line, while the entrée sub-row
   * keeps showing the entrée's own image + name. Falls back to the
   * standalone item's price when not provided.
   */
  combo_id?: string | null;
}

export interface DraftJson {
  items: DraftJsonItem[];
  notes?: string;
}

export interface ResolvedDraftItem {
  /** Stable identity for tile-level animation continuity. */
  draftId: string;
  /** The raw item from the agent's draft JSON. */
  source: DraftJsonItem;
  /** Resolved entrée / standalone item from the semantic menu. */
  resolved: SemanticItem | null;
  /**
   * Resolved combo product (the menu item that carries the combo
   * `base_price` like "Dave's Combo"). Tile uses this for the header
   * price; the entrée sub-row stays driven by `resolved`.
   */
  comboProduct: SemanticItem | null;
  /** Resolved combo drink, if a combo and the drink string mapped to a real item. */
  comboDrink: SemanticItem | null;
  /** Resolved combo side, if a combo and the side string mapped to a real item. */
  comboSide: SemanticItem | null;
  /** Why we couldn't resolve the entrée, if applicable. */
  resolutionWarning?: string;
}

export interface ParsedDraft {
  items: ResolvedDraftItem[];
  notes: string;
}

/* ── Handoff (output by Claude when voice should yield to another flow) ── */

/**
 * Emitted as a ```handoff JSON fence when the agent decides the rest of the
 * order belongs in another part of the app. Today the only destination is
 * `delivery` — voice asks pickup-or-delivery up front, and on delivery the
 * screen routes to `/order/delivery` (the static landing page).
 */
export interface Handoff {
  destination: 'delivery';
  /** Optional human-readable reason; not displayed, useful for debugging. */
  reason?: string;
}

/* ── Runtime context (sent to Claude each turn) ── */

export interface OfferContext {
  id: string;
  title: string;
  description: string;
  state: string;
  remainingToUnlock?: number | null;
  deliveryEligible?: boolean;
}

export interface BagItemContext {
  name: string;
  quantity: number;
  price: number;
  removed: string[];
}

export interface RewardsContext {
  points: number;
  tier: string;
  pointsToNextTier: number;
  nextTier: string;
}

/**
 * Snapshot of the user's pickup location passed to the agent each turn.
 *
 * `permission` mirrors LocationContext.locationPermission so the agent
 * can adapt its dialogue: granted with a store → confirm; denied → ask
 * for ZIP; prompt → home hasn't resolved yet, agent should wait.
 *
 * `fulfillmentMethod` is the user's last-confirmed pickup method (if any)
 * so the agent doesn't ask again on a return visit.
 */
export interface PickupContext {
  permission: 'granted' | 'denied' | 'prompt';
  storeName: string | null;
  storeAddress: string | null;
  storeId: string | null;
  fulfillmentMethod: string | null;
}

export interface RuntimeContext {
  menuSummary: string;
  offers: OfferContext[];
  rewards: RewardsContext | null;
  bag: BagItemContext[];
  bagSubtotal: number;
  pickup: PickupContext;
}

/* ── Location action fence (output by Claude when location/fulfillment changes) ── */

/**
 * `FulfillmentMethod` is owned by `LocationContext` (the canonical reducer
 * lives there). We re-import it here so the voice-internal types/parser
 * speak the same string union without redefining.
 */
import type { FulfillmentMethod } from '../../context/LocationContext';

/**
 * Emitted as a ```location JSON fence whenever the agent needs the app to
 * mutate location-or-fulfillment state mid-conversation. Two flavors today:
 *
 * - `resolve_zip` — customer just said a 5-digit ZIP; the screen runs
 *   `useNearestLocation.resolveByZip()` and dispatches the result.
 * - `set_fulfillment` — customer just chose drive-thru / dine-in / carryout;
 *   the screen dispatches `SET_FULFILLMENT` so the visible tile state and
 *   the conversation context agree (and any tap-equivalent UI flashes the
 *   matching tile).
 *
 * Both kinds are followed by a synthetic `[system: ...]` nudge that gives
 * the agent a turn to take next.
 */
export type LocationAction =
  | { action: 'resolve_zip'; zip: string }
  | { action: 'set_fulfillment'; method: FulfillmentMethod };
