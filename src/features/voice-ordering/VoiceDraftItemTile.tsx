/**
 * Build-as-you-go tile rendered for each item in the voice-local draft
 * order. Replaces the post-bag-add VoiceBagItemTile in the /voice screen.
 *
 * Two layouts:
 *   - Single item:   one image circle + name + size/qty + removed-pills
 *   - Combo:         three image circles (entrée, side, drink) horizontally,
 *                    name + size badge + removed-pills
 *
 * Identity-stable across turns: parent uses `draftId` as the React key, and
 * `motion.div layout` morphs in-place when the same item changes shape
 * (single → combo, drink picked, size upgraded). AnimatePresence handles
 * mount/unmount fades for whole-item add/remove.
 *
 * Drink/side images come from the resolved SemanticItems when the agent
 * emits a name we can map; otherwise we fall back to a generic illustration
 * so the third circle is never empty mid-flow.
 */

import { motion } from 'framer-motion';
import type { ResolvedDraftItem } from './types';

const FALLBACK_IMAGE = '/images/wendys-wave.png';
// Stable generic illustrations for unresolved combo accompaniments. The
// agent emits combo_drink/combo_side as freeform strings; resolveByName
// can miss when the user says "Coke" but no item by that exact alias is
// in the menu (yet). Better to show something recognisable than blank.
const GENERIC_DRINK_IMAGE = '/images/product-images/food_beverages_coca-cola-freestyle_425.png';
const GENERIC_SIDE_IMAGE = '/images/product-images/food_fries-sides_french-fries_165.png';

const IMAGE_PATH_PREFIX = '/images/product-images/';

function imageForItem(item: { image?: string | null } | null): string | null {
  if (!item?.image) return null;
  return `${IMAGE_PATH_PREFIX}${item.image}`;
}

export interface VoiceDraftItemTileProps {
  item: ResolvedDraftItem;
}

export function VoiceDraftItemTile({ item }: VoiceDraftItemTileProps) {
  const isCombo = !!item.source.is_combo;
  const entreeImage = imageForItem(item.resolved) ?? FALLBACK_IMAGE;
  const drinkImage = imageForItem(item.comboDrink) ?? GENERIC_DRINK_IMAGE;
  const sideImage = imageForItem(item.comboSide) ?? GENERIC_SIDE_IMAGE;

  const name = item.resolved?.name ?? item.source.name;
  const quantity = item.source.quantity || 1;

  // Surface only the "remove" / "no" modifiers as red pills — adds and
  // extras are usually invisible in the spoken order ("just add bacon"
  // doesn't need a visual confirmation; "no pickles" does).
  const removed =
    item.source.modifiers
      ?.filter(m => m.type === 'remove' || m.type === 'no')
      .map(m => m.ingredient) ?? [];

  // Combo size shows as a small uppercase badge next to the name.
  const sizeBadge = item.source.combo_size
    ? item.source.combo_size.charAt(0).toUpperCase() + item.source.combo_size.slice(1)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
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
      {isCombo ? (
        <ComboImageCluster entree={entreeImage} side={sideImage} drink={drinkImage} />
      ) : (
        <ItemImage src={entreeImage} size={44} />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            className="font-display"
            style={{
              color: 'var(--color-text-primary-default)',
              fontWeight: 800,
              fontSize: 14,
              lineHeight: '18px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              minWidth: 0,
            }}
          >
            {name}
            {quantity > 1 && (
              <span style={{ opacity: 0.6, fontWeight: 600 }}> × {quantity}</span>
            )}
          </span>
          {sizeBadge && <SizeBadge label={sizeBadge} />}
        </div>

        {removed.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {removed.map((ing, i) => (
              <span
                key={`${ing}-${i}`}
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
                no {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Subcomponents ── */

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

/**
 * Three overlapping circles for combo viz: entrée full-size on the left,
 * side and drink slightly smaller and overlapping inward. Matches the
 * production app's combo-thumbnail convention from MenuCard / ListRow.
 */
function ComboImageCluster({
  entree,
  side,
  drink,
}: {
  entree: string;
  side: string;
  drink: string;
}) {
  return (
    <motion.div
      layout
      style={{
        position: 'relative',
        width: 76,
        height: 44,
        flexShrink: 0,
      }}
    >
      <CircleImg src={entree} size={40} style={{ left: 0, top: 2, zIndex: 3 }} />
      <CircleImg src={side} size={32} style={{ left: 28, top: 6, zIndex: 2 }} />
      <CircleImg src={drink} size={32} style={{ left: 48, top: 6, zIndex: 1 }} />
    </motion.div>
  );
}

function CircleImg({
  src,
  size,
  style,
}: {
  src: string;
  size: number;
  style: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: 9999,
        objectFit: 'cover',
        backgroundColor: 'var(--color-bg-secondary-default)',
        // Thin white ring so overlapping circles read as distinct.
        boxShadow: '0 0 0 2px var(--color-bg-primary-default)',
        ...style,
      }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
      }}
    />
  );
}

function SizeBadge({ label }: { label: string }) {
  return (
    <span
      className="font-display"
      style={{
        fontSize: 10,
        lineHeight: '14px',
        fontWeight: 800,
        padding: '2px 6px',
        borderRadius: 9999,
        backgroundColor: 'var(--color-bg-secondary-default)',
        color: 'var(--color-text-secondary-default)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
