import { useState } from 'react';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { haptics } from '../../animations/haptics';

/* ── Sub-item for combos ── */
export interface BagComboSubItem {
  /** Product name */
  name: string;
  /** Product image URL */
  imageSrc?: string;
}

export interface BagItemCardProps {
  /** Product name */
  name: string;
  /** Price display (e.g., "$10.49") */
  price: string;
  /** Product image URL */
  imageSrc?: string;
  /** Current quantity */
  quantity: number;
  /** Quantity change handler */
  onQuantityChange?: (qty: number) => void;
  /** Whether the item is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: (favorited: boolean) => void;
  /** Edit button handler */
  onEdit?: () => void;
  /** Remove button handler */
  onRemove?: () => void;
  /** Combo sub-items (renders nested cards below the header) */
  comboItems?: BagComboSubItem[];
}

/* ── Quantity selector button ── */
function QuantitySelector({
  quantity,
  onPress,
}: {
  quantity: number;
  onPress: () => void;
}) {
  return (
    <button
      className="flex items-center gap-wds-8 border-none"
      style={{
        padding: '4px 12px 4px 16px',
        borderRadius: 4,
        border: '1px solid var(--color-border-secondary-default)',
        backgroundColor: 'var(--color-bg-primary-default)',
        height: 40,
        cursor: 'pointer',
      }}
      onClick={onPress}
      aria-label={`Quantity: ${quantity}. Tap to change.`}
    >
      <span
        className="font-body"
        style={{
          fontSize: 16,
          lineHeight: '24px',
          color: 'var(--color-text-primary-default)',
        }}
      >
        {quantity}
      </span>
      <span
        aria-hidden="true"
        className="inline-block"
        style={{
          width: 16,
          height: 16,
          backgroundColor: 'var(--color-icon-secondary-default)',
          maskImage: 'url(/icons/caret-down.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/icons/caret-down.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </button>
  );
}

/* ── Quantity bottom sheet ── */
function QuantitySheet({
  isOpen,
  onClose,
  currentQuantity,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentQuantity: number;
  onSelect: (qty: number) => void;
}) {
  const quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height="60%" scrollable>
      <div className="flex flex-col items-center px-wds-16">
        <h3
          className="font-display font-bold text-center"
          style={{
            fontSize: 20,
            lineHeight: '24px',
            color: 'var(--color-text-primary-default)',
            margin: 0,
            paddingBottom: 8,
          }}
        >
          Choose Quantity:
        </h3>
        {quantities.map((qty) => {
          const isSelected = qty === currentQuantity;
          return (
            <button
              key={qty}
              className="w-full border-none bg-transparent"
              style={{
                padding: '12px 0',
                cursor: 'pointer',
                fontSize: isSelected ? 24 : 18,
                lineHeight: '32px',
                fontWeight: isSelected ? 800 : 400,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary-default)',
                textAlign: 'center',
              }}
              onClick={() => {
                haptics.light();
                onSelect(qty);
                onClose();
              }}
              aria-selected={isSelected}
            >
              {qty}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

/* ── Main BagItemCard component ── */
export function BagItemCard({
  name,
  price,
  imageSrc,
  quantity,
  onQuantityChange,
  isFavorited = false,
  onFavoriteToggle,
  onEdit,
  onRemove,
  comboItems,
}: BagItemCardProps) {
  const [showQuantitySheet, setShowQuantitySheet] = useState(false);

  const isCombo = comboItems && comboItems.length > 0;

  return (
    <div className="flex flex-col">
      {/* Product header row */}
      <div
        className="flex items-center"
        style={{ padding: '8px 16px', gap: 16 }}
      >
        {/* Leading image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="flex-shrink-0 object-contain"
            style={{ width: 56, height: 56, borderRadius: 4 }}
          />
        )}

        {/* Product name — fills remaining space */}
        <span
          className="font-display font-semibold flex-1 min-w-0"
          style={{
            fontSize: 16,
            lineHeight: '20px',
            color: 'var(--color-text-primary-default)',
          }}
        >
          {name}
        </span>

        {/* Price */}
        <span
          className="font-body font-bold flex-shrink-0"
          style={{
            fontSize: 16,
            lineHeight: '24px',
            color: 'var(--color-text-primary-default)',
          }}
        >
          {price}
        </span>
      </div>

      {/* Combo sub-items — inset to align with product name */}
      {isCombo && (
        <div className="flex flex-col pb-wds-8" style={{ gap: 8, paddingLeft: 88, paddingRight: 16 }}>
          {comboItems.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="flex items-center"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--color-border-tertiary-default)',
                backgroundColor: 'var(--color-bg-primary-default)',
                gap: 12,
              }}
            >
              {item.imageSrc && (
                <img
                  src={item.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="flex-shrink-0 object-contain"
                  style={{ width: 40, height: 40, borderRadius: 4 }}
                />
              )}
              <span
                className="font-display font-semibold"
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  color: 'var(--color-text-primary-default)',
                }}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div
        className="flex items-center"
        style={{ padding: '0 16px 16px 16px', gap: 0 }}
      >
        {/* Quantity selector */}
        <QuantitySelector
          quantity={quantity}
          onPress={() => setShowQuantitySheet(true)}
        />

        {/* Spacer between quantity and favorite */}
        <div style={{ width: 8 }} />

        {/* Favorite heart */}
        <button
          className="flex items-center justify-center border-none bg-transparent"
          style={{ width: 48, height: 48, padding: 0 }}
          onClick={() => {
            haptics.light();
            onFavoriteToggle?.(!isFavorited);
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 24,
              height: 24,
              backgroundColor: isFavorited
                ? 'var(--color-icon-brand-primary-default)'
                : 'var(--color-icon-primary-default)',
              maskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }}
          />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Edit button */}
        {onEdit && (
          <button
            className="font-display font-bold border-none bg-transparent underline"
            style={{
              fontSize: 18,
              lineHeight: '24px',
              color: 'var(--color-text-brand-secondary-default)',
              padding: '12px 0',
              cursor: 'pointer',
            }}
            onClick={() => {
              haptics.light();
              onEdit();
            }}
          >
            Edit
          </button>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            className="font-display font-bold border-none bg-transparent underline"
            style={{
              fontSize: 18,
              lineHeight: '24px',
              color: 'var(--color-text-brand-secondary-default)',
              padding: '12px 16px',
              cursor: 'pointer',
            }}
            onClick={() => {
              haptics.light();
              onRemove();
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--color-border-tertiary-default)',
          marginLeft: 16,
          marginRight: 16,
        }}
      />

      {/* Quantity bottom sheet */}
      <QuantitySheet
        isOpen={showQuantitySheet}
        onClose={() => setShowQuantitySheet(false)}
        currentQuantity={quantity}
        onSelect={(qty) => onQuantityChange?.(qty)}
      />
    </div>
  );
}
