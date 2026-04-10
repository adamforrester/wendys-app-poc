import { useNavigate } from 'react-router-dom';

export interface MediumTopAppBarProps {
  /** Product title — wraps to multiple lines */
  title: string;
  /** Subtitle — typically price + calories (e.g., "$10.29 | 860 Cal") */
  subtitle: string;
  /** Whether the item is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: (favorited: boolean) => void;
  /** Custom back handler */
  onBack?: () => void;
  /** Whether the bar is visible (controlled by scroll position) */
  visible?: boolean;
}

export function MediumTopAppBar({
  title,
  subtitle,
  isFavorited = false,
  onFavoriteToggle,
  onBack,
}: MediumTopAppBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary-default)',
      }}
    >
      {/* Status bar safe area */}
      <div style={{ height: 54 }} />

      {/* Leading & trailing icons */}
      <div
        className="flex items-center justify-between"
        style={{ height: 48, padding: '0 4px' }}
      >
        {/* Back button */}
        <button
          className="flex items-center justify-center border-none bg-transparent"
          style={{ width: 48, height: 48, padding: 0 }}
          onClick={handleBack}
          aria-label="Go back"
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 24, height: 24,
              backgroundColor: 'var(--color-icon-primary-default)',
              maskImage: 'url(/icons/arrow-left.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: 'url(/icons/arrow-left.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }}
          />
        </button>

        {/* Favorite button */}
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
      </div>

      {/* Text content */}
      <div style={{ padding: '0 16px 16px' }}>
        <h1
          className="font-display text-[23px] leading-[32px]"
          style={{ color: 'var(--color-text-brand-primary-default)', margin: 0, fontWeight: 800 }}
        >
          {title}
        </h1>
        <span
          className="font-body text-[18px] leading-[24px] font-bold"
          style={{ color: 'var(--color-text-primary-default)' }}
        >
          {subtitle}
        </span>
      </div>

      {/* Bottom divider */}
      <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)' }} />
    </div>
  );
}
