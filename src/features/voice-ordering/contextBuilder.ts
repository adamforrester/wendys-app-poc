/**
 * Builds the runtime context block appended to the system prompt on every
 * Claude turn. Pure function — takes the live state and returns a single
 * markdown string that pretends to be more structured than markdown.
 *
 * Why fresh per-turn: bag, offers, and rewards all change as the conversation
 * progresses. Caching only the static system prompt is fine; the runtime
 * context must reflect now.
 */

import type { Offer } from '../../data/types';
import type { BagItem } from '../../context/BagContext';
import type {
  RuntimeContext,
  OfferContext,
  BagItemContext,
  RewardsContext,
} from './types';

interface BuildArgs {
  /** Lean menu summary string from useSemanticMenu().buildMenuSummary() */
  menuSummary: string;
  bagItems: BagItem[];
  offers: Offer[];
  rewards: RewardsContext | null;
}

/** Relevant offers only — available + in-progress, never redeemed/unavailable. */
function selectRelevantOffers(offers: Offer[]): OfferContext[] {
  return offers
    .filter(o => o.eligibility.state === 'available' || o.eligibility.state === 'progress')
    .map(o => ({
      id: o.id,
      title: o.title,
      description: o.description,
      state: o.eligibility.state,
      remainingToUnlock: o.eligibility.progress?.remaining ?? null,
      deliveryEligible: typeof o.deliveryEligible === 'boolean' ? o.deliveryEligible : undefined,
    }));
}

function bagToContext(items: BagItem[]): BagItemContext[] {
  return items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    price: i.price,
    removed: i.customizations?.removed ?? [],
  }));
}

export function buildRuntimeContext({ menuSummary, bagItems, offers, rewards }: BuildArgs): RuntimeContext {
  const bag = bagToContext(bagItems);
  const bagSubtotal = bag.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    menuSummary,
    offers: selectRelevantOffers(offers),
    rewards,
    bag,
    bagSubtotal,
  };
}

/**
 * Render the RuntimeContext as a markdown block to append to the system prompt.
 * The shape mirrors the spec from the chat agent's prompt #1.
 */
export function renderRuntimeContext(ctx: RuntimeContext): string {
  const lines: string[] = ['---', '## Current Session Context', ''];

  // Skip MENU when empty — caller may have stripped it because the menu lives
  // in a separately-cached prompt block.
  if (ctx.menuSummary) {
    lines.push('### MENU');
    lines.push(ctx.menuSummary);
    lines.push('');
  }

  lines.push('### OFFERS');
  if (!ctx.offers.length) {
    lines.push('(no relevant offers)');
  } else {
    for (const o of ctx.offers) {
      const remain = o.remainingToUnlock != null ? ` (need $${o.remainingToUnlock.toFixed(2)} more)` : '';
      const deliv = o.deliveryEligible === false ? ' [pickup only]' : '';
      lines.push(`- ${o.id} [${o.state}]: ${o.title}${remain}${deliv}`);
      lines.push(`  ${o.description}`);
    }
  }
  lines.push('');

  lines.push('### USER REWARDS');
  if (!ctx.rewards) {
    lines.push('(guest — no rewards profile)');
  } else {
    lines.push(
      `Points: ${ctx.rewards.points} | Tier: ${ctx.rewards.tier} | ${ctx.rewards.pointsToNextTier} points to ${ctx.rewards.nextTier}`,
    );
  }
  lines.push('');

  lines.push('### BAG');
  if (!ctx.bag.length) {
    lines.push('(empty)');
  } else {
    for (const b of ctx.bag) {
      const removed = b.removed.length ? ` (no ${b.removed.join(', ')})` : '';
      lines.push(`- ${b.quantity}× ${b.name} — $${(b.price * b.quantity).toFixed(2)}${removed}`);
    }
    lines.push(`Subtotal: $${ctx.bagSubtotal.toFixed(2)}`);
  }

  return lines.join('\n');
}
