import { Label, type LabelState } from '../Label/Label';
import { ItemSelector } from '../ItemSelector/ItemSelector';

export interface LocationLabel {
  text: string;
  state: LabelState;
}

export interface PickupMethod {
  id: string;
  name: string;
  imageSrc: string;
  status: 'Open' | 'Closed' | 'Closing Soon';
  disabled?: boolean;
}

export interface OrderLocationCardProps {
  /** Card number in the list (1-based) */
  number: number;
  /** Store name */
  storeName: string;
  /** Full address string */
  address: string;
  /** Distance in miles */
  distance: number;
  /** Whether the card is expanded/selected */
  isExpanded: boolean;
  /** Expand/collapse toggle handler */
  onToggle: () => void;
  /** Whether this location is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: (favorited: boolean) => void;
  /** Labels to show (e.g., Nearest Location, Closing Soon) */
  labels?: LocationLabel[];
  /** Pickup method options shown when expanded */
  pickupMethods?: PickupMethod[];
  /** Currently selected pickup method id */
  selectedPickupMethod?: string;
  /** Pickup method selection handler */
  onPickupMethodSelect?: (methodId: string) => void;
  /** Info button handler */
  onInfoPress?: () => void;
}

export function OrderLocationCard({
  number,
  storeName,
  address,
  distance,
  isExpanded,
  onToggle,
  isFavorited = false,
  onFavoriteToggle,
  labels = [],
  pickupMethods = [],
  selectedPickupMethod,
  onPickupMethodSelect,
  onInfoPress,
}: OrderLocationCardProps) {

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(!isFavorited);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInfoPress?.();
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary-default)',
        borderRadius: isExpanded ? 8 : 0,
        border: isExpanded ? '2px solid var(--color-border-brand-secondary-default)' : 'none',
        borderBottom: isExpanded ? '2px solid var(--color-border-brand-secondary-default)' : '1px solid var(--color-border-tertiary-default)',
        overflow: 'hidden',
        transition: 'border-radius 0.3s ease, border-color 0.3s ease',
        margin: '0 4px',
      }}
    >
      {/* Tappable header row */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Location info row */}
        <div style={{ display: 'flex', padding: 0 }}>
          {/* Left: store details */}
          <div style={{ flex: 1, padding: '12px 0 0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="font-display text-[16px] leading-[20px] font-semibold" style={{ color: 'var(--color-text-primary-default)' }}>
              {number}. {storeName}
            </span>
            <span className="font-body text-[12px] leading-[16px]" style={{ color: 'var(--color-text-secondary-default)' }}>
              {address}
            </span>
          </div>

          {/* Right: actions + distance */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
            {/* Heart + Info buttons */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="flex items-center justify-center border-none bg-transparent"
                style={{ width: 36, height: 36, padding: 0 }}
                onClick={handleFavoriteClick}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 24, height: 24,
                    backgroundColor: isFavorited ? 'var(--color-bg-brand-primary-default)' : 'var(--color-icon-secondary-default)',
                    maskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                    maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                    WebkitMaskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                    WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                  }}
                />
              </button>
              <button
                className="flex items-center justify-center border-none bg-transparent"
                style={{ width: 36, height: 36, padding: 0 }}
                onClick={handleInfoClick}
                aria-label="Location details"
              >
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 24, height: 24,
                    backgroundColor: 'var(--color-icon-secondary-default)',
                    maskImage: 'url(/icons/info-outline.svg)',
                    maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                    WebkitMaskImage: 'url(/icons/info-outline.svg)',
                    WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                  }}
                />
              </button>
            </div>

            {/* Distance */}
            <span
              className="font-body text-[12px] leading-[16px]"
              style={{ color: 'var(--color-text-secondary-default)', paddingRight: 12 }}
            >
              {distance.toFixed(1)} mi
            </span>
          </div>
        </div>

        {/* Labels row */}
        {labels.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '4px 12px 0 12px', flexWrap: 'wrap' }}>
            {labels.map((label, i) => (
              <Label key={i} state={label.state}>{label.text}</Label>
            ))}
          </div>
        )}

        {/* Bottom padding for collapsed state */}
        {!isExpanded && <div style={{ height: 12 }} />}
      </div>

      {/* Pickup methods — animated expand/collapse via CSS grid */}
      {pickupMethods.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateRows: isExpanded ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.3s ease-in-out',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 23,
              padding: '8px 40px 12px 40px',
            }}>
              {pickupMethods.map((method) => (
                <ItemSelector
                  key={method.id}
                  title={method.name}
                  caption={method.status}
                  captionColor={method.status === 'Open' ? 'positive' : method.status === 'Closing Soon' ? 'critical' : 'critical'}
                  imageSrc={method.imageSrc}
                  size="large"
                  selected={selectedPickupMethod === method.id}
                  disabled={method.disabled || method.status === 'Closed'}
                  onPress={() => onPickupMethodSelect?.(method.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
