export type ItemSelectorSize = 'large' | 'small';
export type CaptionColor = 'default' | 'positive' | 'critical' | 'warning';

export interface ItemSelectorProps {
  /** Title text below image */
  title: string;
  /** Caption text below title (large size only) */
  caption?: string;
  /** Caption text color variant */
  captionColor?: CaptionColor;
  /** Image source for the circular image */
  imageSrc: string;
  /** Size — large (with caption, 120px) or small (no caption, 96px) */
  size?: ItemSelectorSize;
  /** Whether this item is currently selected */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Tap handler */
  onPress?: () => void;
}

const captionColorTokens: Record<CaptionColor, string> = {
  default: 'var(--color-text-secondary-default)',
  positive: 'var(--color-text-validation-positive)',
  critical: 'var(--color-text-validation-critical)',
  warning: 'var(--color-text-validation-caution)',
};

export function ItemSelector({
  title,
  caption,
  captionColor = 'default',
  imageSrc,
  size = 'large',
  selected = false,
  disabled = false,
  onPress,
}: ItemSelectorProps) {
  const isLarge = size === 'large';
  const showCaption = isLarge && !!caption;

  // Image circle border
  const getBorderColor = () => {
    if (disabled) return 'var(--color-border-disabled-default)';
    if (selected) return 'var(--color-border-brand-secondary-default)';
    return 'var(--color-border-tertiary-default)';
  };

  const getBorderWidth = () => selected ? 2 : 1;

  const getBgColor = () => {
    if (disabled) return 'var(--color-bg-disabled-default)';
    return 'var(--color-bg-secondary-default)';
  };

  const getTitleColor = () => {
    if (disabled) return 'var(--color-text-disabled-default)';
    return 'var(--color-text-secondary-default)';
  };

  const getCaptionColor = () => {
    if (disabled && captionColor === 'default') return 'var(--color-text-disabled-default)';
    return captionColorTokens[captionColor];
  };

  return (
    <button
      className="flex flex-col items-center border-none bg-transparent p-0"
      style={{ width: 96, borderRadius: 8 }}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
    >
      {/* Image circle */}
      <div className="relative" style={{ width: 72, height: 72 }}>
        <div
          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{
            backgroundColor: getBgColor(),
            border: `${getBorderWidth()}px solid ${getBorderColor()}`,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{
              opacity: disabled ? 0.4 : 1,
              filter: disabled ? 'grayscale(100%)' : undefined,
            }}
          />
        </div>

        {/* Selected check badge */}
        {selected && (
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: -2,
              right: -2,
              width: 24,
              height: 24,
              backgroundColor: 'var(--color-bg-brand-secondary-default)',
              border: '2px solid var(--color-border-onbrand-default)',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 16, height: 16,
                backgroundColor: 'var(--color-icon-primary-inverse)',
                maskImage: 'url(/icons/check.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/check.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col items-center w-full" style={{ marginTop: 8, gap: 0 }}>
        <span
          className="font-display text-[16px] leading-[20px] font-bold text-center w-full"
          style={{ color: getTitleColor() }}
        >
          {title}
        </span>
        {showCaption && (
          <span
            className="font-body text-[12px] leading-[16px] font-black text-center w-full"
            style={{ color: getCaptionColor() }}
          >
            {caption}
          </span>
        )}
      </div>
    </button>
  );
}
