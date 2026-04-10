export type ChipType = 'select' | 'dismissible';

export interface ChipProps {
  /** Chip type — select (toggleable) or dismissible (removable) */
  type?: ChipType;
  /** Label text */
  label: string;
  /** Meta text (e.g., price, size) — displayed after label */
  meta?: string;
  /** Caption text below the chip */
  caption?: string;
  /** Leading icon name */
  leadingIcon?: string;
  /** Whether this chip is currently selected (select type only) */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Tap handler (select type) */
  onPress?: () => void;
  /** Dismiss handler (dismissible type) */
  onDismiss?: () => void;
}

function ChipIcon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block flex-shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: 'var(--color-icon-secondary-default)',
        maskImage: `url(/icons/${name}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function Chip({
  type = 'select',
  label,
  meta,
  caption,
  leadingIcon,
  selected = false,
  disabled = false,
  onPress,
  onDismiss,
}: ChipProps) {
  const isSelect = type === 'select';
  const isDismissible = type === 'dismissible';
  const isSelected = isSelect && selected && !disabled;

  const getBorderColor = () => {
    if (disabled) return 'var(--color-border-disabled-default)';
    if (isSelected) return 'var(--color-border-brand-secondary-default)';
    return 'var(--color-border-primary-default)';
  };

  const getBgColor = () => {
    if (disabled) return 'var(--color-bg-disabled-default)';
    return 'var(--color-bg-primary-default)';
  };

  const getLabelColor = () => {
    if (disabled) return 'var(--color-text-disabled-default)';
    return 'var(--color-text-primary-default)';
  };

  const getMetaColor = () => {
    if (disabled) return 'var(--color-text-disabled-default)';
    return 'var(--color-text-secondary-default)';
  };

  const handleClick = () => {
    if (disabled) return;
    onPress?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%' }}>
      {/* Touch target */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, width: '100%' }}>
        {/* Content pill */}
        <button
          className="flex items-center justify-center border-none"
          style={{
            height: 40,
            width: '100%',
            borderRadius: 9999,
            border: `${isSelected ? 2 : 1}px solid ${getBorderColor()}`,
            backgroundColor: getBgColor(),
            padding: '0 8px',
            gap: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
          disabled={disabled}
          onClick={handleClick}
          aria-pressed={isSelect ? selected : undefined}
        >
          {/* Selected teal overlay */}
          {isSelected && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--color-bg-brand-secondary-default)',
                opacity: 0.12,
                borderRadius: 9999,
              }}
            />
          )}

          {/* Leading icon */}
          {leadingIcon && <ChipIcon name={leadingIcon} />}

          {/* Label */}
          <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>
            <span
              className="font-body text-[14px] leading-[20px] whitespace-nowrap"
              style={{
                color: getLabelColor(),
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {label}
            </span>
          </div>

          {/* Meta */}
          {meta && (
            <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              <span
                className="font-body text-[14px] leading-[20px] font-bold whitespace-nowrap"
                style={{ color: getMetaColor() }}
              >
                {meta}
              </span>
            </div>
          )}

          {/* Trailing dismiss icon */}
          {isDismissible && (
            <button
              type="button"
              aria-label="Dismiss"
              disabled={disabled}
              style={{ padding: '0 0 0 4px', display: 'flex', alignItems: 'center', background: 'none', border: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onDismiss?.();
              }}
            >
              <span
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: 24, height: 24,
                  backgroundColor: disabled ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-brand-secondary-default)',
                  maskImage: 'url(/icons/close.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                  WebkitMaskImage: 'url(/icons/close.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                }}
              />
            </button>
          )}
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div style={{ paddingBottom: 4 }}>
          <span
            className="font-body text-[12px] leading-[16px] text-center"
            style={{ color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-secondary-default)' }}
          >
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}
