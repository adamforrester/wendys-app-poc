import { useState } from 'react';
import { Button } from '../Button/Button';

export interface ProductHeaderProps {
  /** Product name */
  title: string;
  /** Price string (e.g., "$6.49") */
  price: string;
  /** Calorie string (e.g., "860 Cal") */
  calories?: string;
  /** Current size label (e.g., "Med") — shows size selector button */
  sizeLabel?: string;
  /** Size selector handler — triggers bottom sheet */
  onSizePress?: () => void;
  /** Whether the product is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: (favorited: boolean) => void;
  /** Nutrition link handler — scrolls to nutrition section */
  onNutritionPress?: () => void;
}

export function ProductHeader({
  title,
  price,
  calories,
  sizeLabel,
  onSizePress,
  isFavorited: controlledFavorited,
  onFavoriteToggle,
  onNutritionPress,
}: ProductHeaderProps) {
  const [internalFavorited, setInternalFavorited] = useState(false);
  const isFavorited = controlledFavorited ?? internalFavorited;

  const handleFavoriteToggle = () => {
    const next = !isFavorited;
    setInternalFavorited(next);
    onFavoriteToggle?.(next);
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        padding: '16px 16px 8px 16px',
        gap: 12,
        alignItems: 'flex-start',
        backgroundColor: 'var(--color-bg-primary-default)',
      }}
    >
      {/* Left: text content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Product name — brand red */}
        <h1
          className="font-display"
          style={{
            fontSize: 26,
            lineHeight: '32px',
            fontWeight: 800,
            color: 'var(--color-text-brand-primary-default)',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Price + Calories */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            className="font-body"
            style={{ fontSize: 18, lineHeight: '24px', fontWeight: 700, color: 'var(--color-text-primary-default)' }}
          >
            {price}
          </span>
          {calories && (
            <>
              <span
                className="font-body"
                style={{ fontSize: 18, lineHeight: '24px', fontWeight: 700, color: 'var(--color-text-primary-default)' }}
              >
                |
              </span>
              <span
                className="font-body"
                style={{ fontSize: 18, lineHeight: '24px', fontWeight: 700, color: 'var(--color-text-primary-default)' }}
              >
                {calories}
              </span>
            </>
          )}
        </div>

        {/* Nutrition link */}
        {onNutritionPress && (
          <button
            className="font-body border-none bg-transparent p-0 text-left"
            style={{
              fontSize: 16,
              lineHeight: '24px',
              fontWeight: 700,
              color: 'var(--color-text-brand-secondary-default)',
              textDecoration: 'underline',
              minHeight: 32,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onNutritionPress}
          >
            Nutrition
          </button>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0, flexShrink: 0 }}>
        {/* Favorite heart */}
        <button
          className="flex items-center justify-center border-none bg-transparent"
          style={{ width: 48, height: 48, padding: 0 }}
          onClick={handleFavoriteToggle}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 32,
              height: 32,
              backgroundColor: isFavorited ? 'var(--color-bg-brand-primary-default)' : 'var(--color-icon-primary-default)',
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

        {/* Size selector */}
        {sizeLabel && (
          <Button
            variant="outline"
            size="small"
            rightIcon="caret-down"
            onClick={onSizePress}
          >
            {sizeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
