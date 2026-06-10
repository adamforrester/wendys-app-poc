/**
 * Drive-thru-screen-style tile for the voice-local draft order.
 *
 * Two layouts:
 *   - Single item:   one image circle + name + price          (a pill row)
 *   - Combo:         header pill ("Dave's Single Combo" + total price)
 *                    above three itemized sub-rows:
 *                      • entrée            (e.g. Dave's Single)
 *                      • sized side        (e.g. Medium Fries)
 *                      • sized drink       (e.g. Medium Strawberry Lemonade)
 *                    Sub-rows fill in as the agent confirms each piece.
 *
 * Identity-stable across turns: parent uses `draftId` as the React key, and
 * `motion.div layout` morphs in-place when the same item changes shape
 * (single → combo → drink picked → size upgraded).
 *
 * Pricing comes from semantic_menu_v3.json `base_price` on the resolved
 * entrée and (for combos) the resolved drink/side. Items that don't
 * resolve render without a price line.
 */

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResolvedDraftItem, SemanticItem } from './types';

const FALLBACK_IMAGE = '/images/wendys-wave.png';
const GENERIC_DRINK_IMAGE = '/images/product-images/food_beverages_coca-cola-freestyle_425.png';
const GENERIC_SIDE_IMAGE = '/images/product-images/food_fries-sides_french-fries_165.png';
const IMAGE_PATH_PREFIX = '/images/product-images/';

function imageForItem(item: { image?: string | null } | null | undefined): string | null {
  if (!item?.image) return null;
  return `${IMAGE_PATH_PREFIX}${item.image}`;
}

function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `$${price.toFixed(2)}`;
}

/**
 * Capitalize a freeform size string ("medium", "lg") into display form
 * ("Medium", "Lg"). Treat anything other than the canonical small/
 * medium/large as a passthrough since the agent might emit "kids" etc.
 */
function formatSize(size: string | null | undefined, fallback = 'Medium'): string {
  const s = (size ?? '').trim().toLowerCase();
  if (!s) return fallback;
  if (s === 'small' || s === 'sm') return 'Small';
  if (s === 'medium' || s === 'med' || s === 'md') return 'Medium';
  if (s === 'large' || s === 'lg') return 'Large';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface VoiceDraftItemTileProps {
  item: ResolvedDraftItem;
}

export function VoiceDraftItemTile({ item }: VoiceDraftItemTileProps) {
  const isCombo = !!item.source.is_combo;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
    >
      {isCombo ? <ComboTile item={item} /> : <SingleTile item={item} />}
    </motion.div>
  );
}

/* ── Single item — one pill row with image + name + price ── */

function SingleTile({ item }: { item: ResolvedDraftItem }) {
  const image = imageForItem(item.resolved) ?? FALLBACK_IMAGE;
  const name = item.resolved?.name ?? item.source.name;
  const quantity = item.source.quantity || 1;
  const price = formatPrice(item.resolved?.base_price);

  // Surface only "remove" / "no" modifiers as red pills — adds and
  // extras usually don't need visual confirmation.
  const removed =
    item.source.modifiers
      ?.filter(m => m.type === 'remove' || m.type === 'no')
      .map(m => m.ingredient) ?? [];

  return (
    <PillRow
      image={image}
      name={quantity > 1 ? `${name} × ${quantity}` : name}
      price={price}
      removed={removed}
    />
  );
}

/* ── Combo — header pill + 3 itemized sub-rows ── */

function ComboTile({ item }: { item: ResolvedDraftItem }) {
  // Header reads "[entrée] Combo" — driven by the entrée name when we
  // have one (so "Dave's Single Combo", not the menu's own "Dave's
  // Combo" abbreviation). Idempotent if the resolved name already
  // contains "Combo".
  const headerName = item.resolved?.name
    ? formatComboTitle(item.resolved.name)
    : formatComboTitle(item.source.name);
  // Header image stays the entrée — it's the visual anchor of the combo.
  const headerImage = imageForItem(item.resolved) ?? FALLBACK_IMAGE;
  const size = formatSize(item.source.combo_size, 'Medium');

  // Header price prefers the resolved combo product (e.g. Dave's Combo
  // base_price), with the standalone's price as a fallback when the
  // agent didn't supply combo_id. Either way, sub-row prices for the
  // entrée stay null — the header carries the combo total.
  const headerPrice = formatPrice(
    item.comboProduct?.base_price ?? item.resolved?.base_price ?? null,
  );

  const entreeName = item.resolved?.name ?? item.source.name;
  const entreePrice = null as string | null; // Don't double-charge — header carries the combo price.
  const entreeImage = imageForItem(item.resolved) ?? FALLBACK_IMAGE;

  // Side: defaults to fries — that's how Wendy's combos work, and the
  // user only needs to interact with it if they want something else.
  // Render as confirmed (not pending) regardless of whether the agent
  // emitted `combo_side`, unless the agent picked a different side.
  // Drink: stays pending until the user picks; renders as a faded
  // "Medium Drink" placeholder so the order's shape is visible.
  const sideRow = item.comboSide
    ? buildAccompanimentRow(item.comboSide, GENERIC_SIDE_IMAGE, 'Fries', size)
    : { image: GENERIC_SIDE_IMAGE, name: `${size} Fries`, price: null, pending: false };
  const drinkRow = buildAccompanimentRow(item.comboDrink, GENERIC_DRINK_IMAGE, 'Drink', size);

  // Surface remove/no modifiers as red pills under the entrée sub-row,
  // not the header — they only apply to the entrée.
  const removed =
    item.source.modifiers
      ?.filter(m => m.type === 'remove' || m.type === 'no')
      .map(m => m.ingredient) ?? [];

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <PillRow
        image={headerImage}
        name={headerName}
        price={headerPrice}
        emphasis
      />
      <motion.div
        layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingLeft: 16,
        }}
      >
        <SubRow image={entreeImage} name={entreeName} price={entreePrice} removed={removed} />
        <SubRow image={sideRow.image} name={sideRow.name} price={sideRow.price} pending={sideRow.pending} />
        <SubRow image={drinkRow.image} name={drinkRow.name} price={drinkRow.price} pending={drinkRow.pending} />
      </motion.div>
    </motion.div>
  );
}

interface AccompanimentRow {
  image: string;
  name: string;
  price: string | null;
  pending: boolean;
}

function buildAccompanimentRow(
  resolved: SemanticItem | null,
  fallbackImage: string,
  fallbackName: string,
  size: string,
): AccompanimentRow {
  if (resolved) {
    return {
      image: imageForItem(resolved) ?? fallbackImage,
      name: `${size} ${stripSizeFromName(resolved.name)}`,
      price: formatPrice(resolved.base_price),
      pending: false,
    };
  }
  // Placeholder while the user hasn't picked yet — keeps the row
  // visible so the order's shape is obvious. Lower opacity in the
  // SubRow when `pending`.
  return {
    image: fallbackImage,
    name: `${size} ${fallbackName}`,
    price: null,
    pending: true,
  };
}

/**
 * "Dave's Single" → "Dave's Single Combo".
 * Idempotent: if the resolved name already ends in "Combo", leave it.
 * Some category-prefixed names ("Dave's Combo", "Baconator Combo")
 * also pass through unchanged.
 */
function formatComboTitle(name: string): string {
  if (/\bcombo\b/i.test(name)) return name;
  return `${name} Combo`;
}

/**
 * Strip a leading size word ("Small ", "Medium ", "Large ") from an
 * accompaniment item name so we can prefix our own size word from
 * combo_size. The semantic menu sometimes carries items as
 * "Medium Fries" already; we don't want "Large Medium Fries".
 */
function stripSizeFromName(name: string): string {
  return name.replace(/^(small|medium|large|sm|md|lg)\s+/i, '').trim();
}

/* ── Subcomponents ── */

interface PillRowProps {
  image: string;
  name: string;
  price?: string | null;
  removed?: string[];
  /** Slightly bolder weight for combo header; sub-rows use lighter. */
  emphasis?: boolean;
}

function PillRow({ image, name, price, removed, emphasis }: PillRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px 8px 8px',
        borderRadius: 9999,
        backgroundColor: 'var(--color-bg-primary-default)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-border-tertiary-default)',
      }}
    >
      <ItemImage src={image} size={44} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          className="font-display"
          style={{
            color: 'var(--color-text-primary-default)',
            fontWeight: emphasis ? 800 : 700,
            fontSize: 14,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {removed && removed.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {removed.map((ing, i) => (
              <RemovedPill key={`${ing}-${i}`}>no {ing}</RemovedPill>
            ))}
          </div>
        )}
      </div>
      {price && <PriceText>{price}</PriceText>}
    </div>
  );
}

interface SubRowProps {
  image: string;
  name: string;
  price: string | null;
  removed?: string[];
  /** True for placeholder rows (e.g. "Medium Drink" before the user picks). */
  pending?: boolean;
}

function SubRow({ image, name, price, removed, pending }: SubRowProps) {
  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 12px 4px 4px',
        opacity: pending ? 0.55 : 1,
      }}
    >
      <ItemImage src={image} size={28} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          className="font-body"
          style={{
            color: 'var(--color-text-primary-default)',
            fontWeight: 600,
            fontSize: 13,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {removed && removed.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {removed.map((ing, i) => (
              <RemovedPill key={`${ing}-${i}`}>no {ing}</RemovedPill>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {price && (
          <motion.span
            key="price"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="font-body"
            style={{
              color: 'var(--color-text-secondary-default)',
              fontWeight: 600,
              fontSize: 12,
              lineHeight: '16px',
              flexShrink: 0,
            }}
          >
            {price}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItemImage({ src, size }: { src: string; size: number }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        objectFit: 'cover',
        backgroundColor: 'var(--color-bg-secondary-default)',
        flexShrink: 0,
      }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
      }}
    />
  );
}

function PriceText({ children }: { children: string }) {
  return (
    <span
      className="font-display"
      style={{
        color: 'var(--color-text-primary-default)',
        fontWeight: 700,
        fontSize: 13,
        lineHeight: '18px',
        flexShrink: 0,
        marginLeft: 4,
      }}
    >
      {children}
    </span>
  );
}

function RemovedPill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        lineHeight: '14px',
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 9999,
        backgroundColor: 'var(--color-bg-validation-critical)',
        color: 'var(--color-text-onbrand-default)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
