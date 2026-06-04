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

export interface RuntimeContext {
  menuSummary: string;
  offers: OfferContext[];
  rewards: RewardsContext | null;
  bag: BagItemContext[];
  bagSubtotal: number;
}
