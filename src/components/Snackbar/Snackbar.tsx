import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { snackbar as snackbarAnimation } from '../../animations/presets';

export interface SnackbarProps {
  /** Message text */
  message: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Show close button */
  showClose?: boolean;
  /** Close handler — called on close button tap or auto-dismiss */
  onClose: () => void;
  /** Auto-dismiss duration in ms (0 = persist until dismissed) */
  duration?: number;
  /** Whether multi-line text wraps (forces vertical layout) */
  multiLine?: boolean;
}

export function Snackbar({
  message,
  actionLabel,
  onAction,
  showClose = false,
  onClose,
  duration = 4000,
  multiLine = false,
}: SnackbarProps) {
  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const hasAction = !!actionLabel;
  const hasTrailing = hasAction || showClose;

  // Action button element
  const actionButton = hasAction && (
    <button
      className="flex items-center justify-center border-none bg-transparent font-body text-[14px] leading-[20px] font-bold"
      style={{
        color: 'var(--color-text-brand-secondary-inverse-default)',
        padding: '10px 12px',
        borderRadius: 100,
        height: 40,
      }}
      onClick={onAction}
    >
      {actionLabel}
    </button>
  );

  // Close button element
  const closeButton = showClose && (
    <button
      className="flex items-center justify-center border-none bg-transparent"
      style={{ width: 48, height: 48 }}
      onClick={onClose}
      aria-label="Dismiss"
    >
      <span
        aria-hidden="true"
        className="inline-block"
        style={{
          width: 24, height: 24,
          backgroundColor: 'var(--color-icon-primary-inverse)',
          maskImage: 'url(/icons/close.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
          WebkitMaskImage: 'url(/icons/close.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
        }}
      />
    </button>
  );

  // Multi-line layout (vertical: text on top, actions bottom-right)
  if (multiLine) {
    return (
      <motion.div
        className="flex flex-col mx-auto"
        style={{
          width: 342,
          backgroundColor: 'var(--color-bg-primary-inverse-default)',
          borderRadius: 4,
        }}
        variants={snackbarAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        role="alert"
      >
        {/* Text */}
        <div style={{ padding: '16px 16px 0 16px' }}>
          <p
            className="font-body text-[14px] leading-[20px] m-0"
            style={{ color: 'var(--color-text-primary-inverse)' }}
          >
            {message}
          </p>
        </div>

        {/* Action row — aligned to bottom-right */}
        {hasTrailing ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 8,
              height: 48,
              width: '100%',
            }}
          >
            {actionButton}
            {closeButton}
          </div>
        ) : (
          <div style={{ height: 16 }} />
        )}
      </motion.div>
    );
  }

  // Single-line layout (horizontal: text + actions on same row)
  return (
    <motion.div
      className="flex items-center mx-auto"
      style={{
        width: 342,
        minHeight: 48,
        backgroundColor: 'var(--color-bg-primary-inverse-default)',
        borderRadius: 4,
        padding: '0 8px 0 16px',
        gap: 4,
      }}
      variants={snackbarAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      role="alert"
    >
      {/* Text — fills remaining space */}
      <p
        className="font-body text-[14px] leading-[20px] m-0 flex-1"
        style={{ color: 'var(--color-text-primary-inverse)' }}
      >
        {message}
      </p>

      {/* Action + close */}
      {hasTrailing && (
        <div className="flex items-center flex-shrink-0">
          {actionButton}
          {closeButton}
        </div>
      )}
    </motion.div>
  );
}
