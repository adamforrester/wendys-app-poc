import { haptics } from '../../animations/haptics';

export interface CounterProps {
  /** Current count value */
  value: number;
  /** Minimum value (default 0) */
  min?: number;
  /** Maximum value (default 999) */
  max?: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Show circular border around +/- buttons */
  bordered?: boolean;
  /** Disabled state — both buttons disabled */
  disabled?: boolean;
}

function CounterButton({
  icon,
  disabled,
  bordered,
  onClick,
  label,
}: {
  icon: 'minus' | 'add';
  disabled: boolean;
  bordered: boolean;
  onClick: () => void;
  label: string;
}) {
  const iconColor = disabled
    ? 'var(--color-icon-disabled-default)'
    : 'var(--color-icon-brand-secondary-default)';

  const borderColor = disabled
    ? 'var(--color-border-disabled-default)'
    : 'var(--color-border-brand-secondary-default)';

  return (
    <button
      className="flex items-center justify-center border-none bg-transparent p-0"
      style={{ width: 48, height: 48 }}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          haptics.light();
          onClick();
        }
      }}
      aria-label={label}
    >
      {bordered ? (
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'var(--color-bg-primary-default)',
            border: `1px solid ${borderColor}`,
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 32, height: 32,
              backgroundColor: iconColor,
              maskImage: `url(/icons/${icon}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: `url(/icons/${icon}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }}
          />
        </div>
      ) : (
        <span
          aria-hidden="true"
          className="inline-block"
          style={{
            width: 32, height: 32,
            backgroundColor: iconColor,
            maskImage: `url(/icons/${icon}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            WebkitMaskImage: `url(/icons/${icon}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
          }}
        />
      )}
    </button>
  );
}

export function Counter({
  value,
  min = 0,
  max = 999,
  onChange,
  bordered = true,
  disabled = false,
}: CounterProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        padding: bordered ? '8px 0' : '4px 0',
      }}
    >
      <CounterButton
        icon="minus"
        disabled={disabled || atMin}
        bordered={bordered}
        onClick={() => onChange(Math.max(min, value - 1))}
        label="Decrease quantity"
      />

      <span
        className="font-display text-[16px] leading-[20px] font-bold text-center"
        style={{
          color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)',
          minWidth: 24,
        }}
      >
        {value}
      </span>

      <CounterButton
        icon="add"
        disabled={disabled || atMax}
        bordered={bordered}
        onClick={() => onChange(Math.min(max, value + 1))}
        label="Increase quantity"
      />
    </div>
  );
}
