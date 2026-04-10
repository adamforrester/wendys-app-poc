export type IconButtonSize = 'large' | 'small';
export type IconButtonStyle = 'squared' | 'rounded';

export interface IconButtonProps {
  /** Icon name from /icons/ */
  icon: string;
  /** Whether the icon is multi-color (renders as img instead of mask) */
  multiColor?: boolean;
  /** Custom icon color (default: icon/primary for mono icons) */
  iconColor?: string;
  /** Headline text below icon (large sizes only) */
  headline?: string;
  /** Size variant */
  size?: IconButtonSize;
  /** Shape style */
  buttonStyle?: IconButtonStyle;
  /** Disabled state */
  disabled?: boolean;
  /** Tap handler */
  onPress?: () => void;
  /** Accessible label */
  'aria-label'?: string;
}

function IconImage({ name, size, multiColor, disabled, color }: { name: string; size: number; multiColor: boolean; disabled: boolean; color?: string }) {
  if (multiColor) {
    return (
      <img
        src={`/icons/${name}.svg`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ opacity: disabled ? 0.4 : 1 }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block"
      style={{
        width: size, height: size,
        backgroundColor: disabled ? 'var(--color-icon-disabled-default)' : (color || 'var(--color-icon-primary-default)'),
        maskImage: `url(/icons/${name}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function IconButton({
  icon,
  multiColor = false,
  iconColor,
  headline,
  size = 'small',
  buttonStyle = 'rounded',
  disabled = false,
  onPress,
  ...rest
}: IconButtonProps) {
  const isLarge = size === 'large';
  const isSquared = buttonStyle === 'squared';

  // Small/Rounded — simple icon button (48x48 tap target, 24px icon)
  if (!isLarge) {
    return (
      <button
        className="flex items-center justify-center border-none bg-transparent p-0"
        style={{ width: 48, height: 48, borderRadius: 24 }}
        disabled={disabled}
        onClick={disabled ? undefined : onPress}
        {...rest}
      >
        <IconImage name={icon} size={24} multiColor={multiColor} disabled={disabled} color={iconColor} />
      </button>
    );
  }

  // Large/Squared — bordered tile with icon + headline
  if (isSquared) {
    return (
      <button
        className="flex flex-col items-center justify-center border-none"
        style={{
          width: 88,
          height: 88,
          borderRadius: 8,
          border: '1px solid var(--color-border-secondary-default)',
          backgroundColor: 'var(--color-bg-primary-default)',
          padding: '8px',
          gap: 4,
        }}
        disabled={disabled}
        onClick={disabled ? undefined : onPress}
        {...rest}
      >
        <IconImage name={icon} size={40} multiColor={multiColor} disabled={disabled} color={iconColor} />
        {headline && (
          <span
            className="font-display text-[12px] leading-[16px] font-bold text-center"
            style={{ color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)' }}
          >
            {headline}
          </span>
        )}
      </button>
    );
  }

  // Large/Rounded — circular bg with icon + headline below
  return (
    <button
      className="flex flex-col items-center border-none bg-transparent p-0"
      style={{ width: 96, gap: 4 }}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      {...rest}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 64, height: 64,
          backgroundColor: disabled ? 'var(--color-bg-disabled-default)' : 'var(--color-bg-secondary-default)',
        }}
      >
        <IconImage name={icon} size={40} multiColor={multiColor} disabled={disabled} color={iconColor} />
      </div>
      {headline && (
        <span
          className="font-body text-[14px] leading-[20px] font-bold text-center w-full"
          style={{ color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-secondary-default)' }}
        >
          {headline}
        </span>
      )}
    </button>
  );
}
