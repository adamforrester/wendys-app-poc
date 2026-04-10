import { useNavigate } from 'react-router-dom';

export type TransparentTopBarLeadingIcon = 'back' | 'close';

export interface TransparentTopBarProps {
  /** Leading icon — back arrow or close X */
  leadingIcon?: TransparentTopBarLeadingIcon;
  /** Back/close handler — defaults to router navigate(-1) */
  onBack?: () => void;
  /** Whether the item is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: (favorited: boolean) => void;
  /** Show favorite button */
  showFavorite?: boolean;
}

export function TransparentTopBar({
  leadingIcon = 'back',
  onBack,
  isFavorited = false,
  onFavoriteToggle,
  showFavorite = false,
}: TransparentTopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const iconName = leadingIcon === 'close' ? 'close' : 'arrow-left';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Status bar safe area */}
      <div style={{ height: 54 }} />

      {/* Icon row */}
      <div
        className="flex items-center justify-between"
        style={{ height: 48, padding: '0 4px', pointerEvents: 'auto' }}
      >
        {/* Leading icon */}
        <button
          className="flex items-center justify-center border-none bg-transparent"
          style={{ width: 48, height: 48, padding: 0 }}
          onClick={handleBack}
          aria-label={leadingIcon === 'close' ? 'Close' : 'Go back'}
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 24, height: 24,
              backgroundColor: 'var(--color-icon-primary-default)',
              maskImage: `url(/icons/${iconName}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: `url(/icons/${iconName}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }}
          />
        </button>

        {/* Trailing favorite */}
        {showFavorite && (
          <button
            className="flex items-center justify-center border-none bg-transparent"
            style={{ width: 48, height: 48, padding: 0 }}
            onClick={() => onFavoriteToggle?.(!isFavorited)}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 24, height: 24,
                backgroundColor: isFavorited ? 'var(--color-icon-brand-primary-default)' : 'var(--color-icon-primary-default)',
                maskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}
