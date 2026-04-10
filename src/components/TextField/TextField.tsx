import { useState, useId, type InputHTMLAttributes } from 'react';
import { HelperMessage, type HelperMessageType } from '../HelperMessage/HelperMessage';

export type TextFieldValidation = 'none' | 'error' | 'caution' | 'success';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Floating label text */
  label: string;
  /** Current value (controlled) */
  value?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Validation state */
  validation?: TextFieldValidation;
  /** Helper/error message below the field */
  helperText?: string;
  /** Leading icon name */
  leadingIcon?: string;
  /** Trailing icon name */
  trailingIcon?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Keep label always in the floating/label position (never as inline placeholder) */
  persistLabel?: boolean;
}

const validationBorderColors: Record<TextFieldValidation, string> = {
  none: 'var(--color-border-primary-default)',
  error: 'var(--color-border-validation-critical)',
  caution: 'var(--color-border-validation-caution)',
  success: 'var(--color-border-validation-positive)',
};

const validationFocusBorderColors: Record<TextFieldValidation, string> = {
  none: 'var(--color-border-brand-secondary-default)',
  error: 'var(--color-border-validation-critical)',
  caution: 'var(--color-border-validation-caution)',
  success: 'var(--color-border-validation-positive)',
};

const validationLabelColors: Record<TextFieldValidation, string> = {
  none: 'var(--color-text-brand-secondary-default)',
  error: 'var(--color-text-validation-critical)',
  caution: 'var(--color-text-validation-caution)',
  success: 'var(--color-text-validation-positive)',
};

const validationHelperType: Record<TextFieldValidation, HelperMessageType> = {
  none: 'helper',
  error: 'error',
  caution: 'caution',
  success: 'success',
};

export function TextField({
  label,
  value = '',
  onValueChange,
  validation = 'none',
  helperText,
  leadingIcon,
  trailingIcon,
  disabled = false,
  fullWidth = false,
  persistLabel = false,
  type = 'text',
  placeholder,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const id = useId();

  const currentValue = onValueChange ? value : internalValue;
  const isFloating = persistLabel || focused || currentValue.length > 0;

  // Only show placeholder when label is floating (so they don't overlap)
  const showPlaceholder = isFloating && currentValue.length === 0 ? placeholder : undefined;

  const borderColor = disabled
    ? 'var(--color-border-disabled-default)'
    : focused
      ? validationFocusBorderColors[validation]
      : validationBorderColors[validation];

  const labelColor = disabled
    ? 'var(--color-text-disabled-default)'
    : isFloating
      ? (focused ? validationLabelColors[validation] : 'var(--color-text-secondary-default)')
      : 'var(--color-text-secondary-default)';

  const borderWidth = focused ? 2 : 1;
  const leftPad = leadingIcon ? 44 : 16;
  const rightPad = trailingIcon ? 44 : 16;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      {/* Field container */}
      <div
        className="relative"
        style={{
          height: 56,
          borderRadius: 4,
          border: `${borderWidth}px solid ${borderColor}`,
          backgroundColor: 'var(--color-bg-primary-default)',
          transition: 'border-color 0.2s',
          width: fullWidth ? '100%' : undefined,
        }}
      >
        {/* Leading icon */}
        {leadingIcon && (
          <span
            aria-hidden="true"
            className="absolute inline-block"
            style={{
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24, height: 24,
              backgroundColor: disabled ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-secondary-default)',
              maskImage: `url(/icons/${leadingIcon}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: `url(/icons/${leadingIcon}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }}
          />
        )}

        {/* Floating label */}
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: leftPad - 4,
            top: isFloating ? -10 : '50%',
            transform: isFloating ? 'none' : 'translateY(-50%)',
            color: labelColor,
            fontSize: isFloating ? 12 : 16,
            lineHeight: isFloating ? '16px' : '24px',
            fontFamily: 'var(--font-body)',
            padding: isFloating ? '0 6px' : 0,
            backgroundColor: isFloating ? 'var(--color-bg-primary-default)' : 'transparent',
            pointerEvents: 'none',
            transition: 'top 0.2s ease, font-size 0.2s ease, line-height 0.2s ease, color 0.2s ease, background-color 0.1s, transform 0.2s ease',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}
        >
          {label}
        </label>

        {/* Input */}
        <input
          id={id}
          type={type}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className="font-body text-[16px] leading-[24px] w-full h-full"
          style={{
            padding: `0 ${rightPad}px 0 ${leftPad}px`,
            color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none' as any,
            appearance: 'none' as any,
          }}
          placeholder={showPlaceholder}
          {...rest}
        />

        {/* Trailing icon */}
        {trailingIcon && (
          <span
            aria-hidden="true"
            className="absolute inline-block"
            style={{
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24, height: 24,
              backgroundColor: disabled ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-secondary-default)',
              maskImage: `url(/icons/${trailingIcon}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: `url(/icons/${trailingIcon}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }}
          />
        )}
      </div>

      {/* Helper message */}
      {helperText && (
        <div style={{ paddingTop: 4, paddingLeft: leftPad }}>
          <HelperMessage type={validation === 'none' ? 'helper' : validationHelperType[validation]}>
            {helperText}
          </HelperMessage>
        </div>
      )}
    </div>
  );
}
