import { motion } from 'framer-motion';

export interface ToggleProps {
  /** Whether the toggle is on */
  checked?: boolean;
  /** Show check/× icons in the handle */
  showIcon?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Accessible label */
  'aria-label'?: string;
}

const TRACK_W = 52;
const TRACK_H = 32;
const HANDLE_ON = 24;
const HANDLE_OFF_NO_ICON = 16;
const HANDLE_OFF_ICON = 24;
const TRACK_PAD = 4; // padding from track edge to handle center area

export function Toggle({
  checked = false,
  showIcon = false,
  disabled = false,
  onChange,
  ...rest
}: ToggleProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleSize = checked ? HANDLE_ON : (showIcon ? HANDLE_OFF_ICON : HANDLE_OFF_NO_ICON);
  // Handle left position: off = left-aligned, on = right-aligned
  const handleX = checked
    ? TRACK_W - handleSize - TRACK_PAD
    : TRACK_PAD;

  // Track colors
  const getTrackBg = () => {
    if (disabled && checked) return 'var(--color-bg-disabled-default)';
    if (disabled) return 'var(--color-bg-primary-default)';
    if (checked) return 'var(--color-bg-brand-secondary-default)';
    return 'var(--color-bg-secondary-default)';
  };

  const getTrackBorder = () => {
    if (checked && !disabled) return 'transparent';
    if (checked && disabled) return 'transparent';
    if (disabled) return 'var(--color-border-disabled-default)';
    return 'var(--color-border-primary-default)';
  };

  // Handle colors
  const getHandleBg = () => {
    if (disabled && checked) return 'var(--color-bg-disabled-ondisabled)';
    if (disabled) return 'var(--color-bg-disabled-default)';
    if (checked) return 'var(--color-bg-onbrand-default)';
    return 'var(--color-bg-secondary-inverse-default)';
  };

  // Icon color
  const getIconColor = () => {
    if (checked) return 'var(--color-icon-brand-secondary-default)';
    return 'var(--color-icon-primary-inverse)';
  };

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className="relative p-0 bg-transparent border-none"
      style={{ width: TRACK_W, height: TRACK_H }}
      {...rest}
    >
      {/* Track */}
      <div
        className="absolute inset-0 rounded-wds-full transition-colors duration-200"
        style={{
          backgroundColor: getTrackBg(),
          border: `2px solid ${getTrackBorder()}`,
        }}
      />

      {/* Handle */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: handleSize,
          height: handleSize,
          top: (TRACK_H - handleSize) / 2,
          backgroundColor: getHandleBg(),
        }}
        animate={{ left: handleX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Icon inside handle */}
        {showIcon && (
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 16,
              height: 16,
              backgroundColor: getIconColor(),
              maskImage: `url(/icons/${checked ? 'check' : 'close'}.svg)`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(/icons/${checked ? 'check' : 'close'}.svg)`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }}
          />
        )}
      </motion.div>
    </button>
  );
}
