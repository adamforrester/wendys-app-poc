export type RadioButtonType = 'standard' | 'checked';

export interface RadioButtonProps {
  /** Visual type — 'standard' (dot) or 'checked' (checkmark) */
  type?: RadioButtonType;
  /** Whether this option is selected */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (selected: boolean) => void;
  /** Accessible label (required when no visible label) */
  'aria-label'?: string;
}

export function RadioButton({
  type = 'standard',
  selected = false,
  disabled = false,
  onChange,
  ...rest
}: RadioButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!selected);
  };

  // Colors based on state
  const getIconColor = () => {
    if (disabled && selected) return 'var(--color-bg-disabled-default)';
    if (disabled) return 'var(--color-border-disabled-default)';
    if (selected) return 'var(--color-bg-brand-secondary-default)';
    return 'var(--color-border-primary-default)';
  };

  const iconColor = getIconColor();

  if (type === 'checked') {
    return (
      <button
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={handleClick}
        className="flex items-center justify-center w-[48px] h-[48px] bg-transparent border-none p-0 group"
        {...rest}
      >
        <div className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full transition-colors group-hover:bg-[var(--color-bg-primary-hover)] group-active:bg-[var(--color-bg-primary-active)]">
          {selected ? (
            <>
              {/* Filled circle */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: iconColor,
                }}
              />
              {/* Check icon */}
              <span
                aria-hidden="true"
                className="relative inline-block"
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--color-icon-onbrand-default)',
                  maskImage: 'url(/icons/check.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: 'url(/icons/check.svg)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                }}
              />
            </>
          ) : (
            /* Unselected — empty circle */
            <div
              className="rounded-full"
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${iconColor}`,
              }}
            />
          )}
        </div>
      </button>
    );
  }

  // Standard type — dot style using radio-button SVG icons
  return (
    <button
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={handleClick}
      className="flex items-center justify-center w-[48px] h-[48px] bg-transparent border-none p-0 group"
      {...rest}
    >
      <div className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full transition-colors group-hover:bg-[var(--color-bg-primary-hover)] group-active:bg-[var(--color-bg-primary-active)]">
        {selected ? (
          /* Filled circle with inner dot */
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${iconColor}`,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: iconColor,
              }}
            />
          </>
        ) : (
          /* Empty circle */
          <div
            className="rounded-full"
            style={{
              width: 20,
              height: 20,
              border: `2px solid ${iconColor}`,
            }}
          />
        )}
      </div>
    </button>
  );
}
