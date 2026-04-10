export type CheckboxState = 'selected' | 'indeterminate' | 'unselected';

export interface CheckboxProps {
  /** Check state */
  checked?: CheckboxState;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler — returns the new state */
  onChange?: (checked: CheckboxState) => void;
  /** Accessible label */
  'aria-label'?: string;
}

export function Checkbox({
  checked = 'unselected',
  disabled = false,
  onChange,
  ...rest
}: CheckboxProps) {
  const handleClick = () => {
    if (disabled) return;
    const next = checked === 'selected' ? 'unselected' : 'selected';
    onChange?.(next);
  };

  const isSelected = checked === 'selected';
  const isIndeterminate = checked === 'indeterminate';
  const isFilled = isSelected || isIndeterminate;

  const getBoxBg = () => {
    if (disabled && isFilled) return 'var(--color-bg-disabled-default)';
    if (isFilled) return 'var(--color-bg-brand-secondary-default)';
    return 'transparent';
  };

  const getBoxBorder = () => {
    if (isFilled) return 'transparent';
    if (disabled) return 'var(--color-icon-disabled-default)';
    return 'var(--color-icon-primary-default)';
  };

  const iconName = isSelected ? 'check' : 'minus';

  return (
    <button
      role="checkbox"
      aria-checked={isIndeterminate ? 'mixed' : isSelected}
      disabled={disabled}
      onClick={handleClick}
      className="flex items-center justify-center w-[48px] h-[48px] bg-transparent border-none p-0 group"
      {...rest}
    >
      <div className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full transition-colors group-hover:bg-[var(--color-bg-primary-hover)] group-active:bg-[var(--color-bg-primary-active)]">
        {/* Box container */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 2,
            backgroundColor: getBoxBg(),
            border: `2px solid ${getBoxBorder()}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Icon (check or minus) */}
          {isFilled && (
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 16,
                height: 16,
                backgroundColor: 'var(--color-icon-onbrand-default)',
                maskImage: `url(/icons/${iconName}.svg)`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(/icons/${iconName}.svg)`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          )}
        </div>
      </div>
    </button>
  );
}
