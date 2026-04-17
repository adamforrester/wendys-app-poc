import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button/Button';

export interface DialogAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button color scheme — secondary (teal, default) or primary (red) */
  colorScheme?: 'secondary' | 'primary';
}

export interface DialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Called when the dialog is dismissed (scrim tap, X button, or Escape) */
  onClose: () => void;
  /** Dialog style — standard (with optional close X) or prompt (no close X) */
  variant?: 'standard' | 'prompt';
  /** Whether the dialog covers the full screen */
  fullscreen?: boolean;
  /** Optional icon path (filename without .svg from /icons/) */
  icon?: string;
  /** Whether icon is multi-color (rendered as img instead of mask) */
  iconMultiColor?: boolean;
  /** Optional image URL displayed above headline */
  imageSrc?: string;
  /** Alt text for image */
  imageAlt?: string;
  /** Headline text */
  headline?: string;
  /** Supporting body text */
  supportText?: string;
  /** Primary action button */
  primaryAction?: DialogAction;
  /** Secondary action button (standard variant only) */
  secondaryAction?: DialogAction;
  /** Whether to show the close X button (standard variant only, default true) */
  showClose?: boolean;
  /** Optional custom content rendered below support text, above actions */
  children?: ReactNode;
}

/* ── Animation variants ── */
const scrimVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

const fullscreenVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: 40, transition: { duration: 0.15 } },
};

/* ── Icon component (same pattern as Button) ── */
function DialogIcon({ name, multiColor = false }: { name: string; multiColor?: boolean }) {
  if (multiColor) {
    return (
      <img
        src={`/icons/${name}.svg`}
        alt=""
        aria-hidden="true"
        width={56}
        height={56}
        className="flex-shrink-0"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 inline-block"
      style={{
        width: 56,
        height: 56,
        backgroundColor: 'var(--color-icon-brand-primary-default)',
        maskImage: `url(/icons/${name}.svg)`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

/* ── Close button ── */
function CloseButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-wds-full ${className}`}
      style={{ width: 48, height: 48 }}
      aria-label="Close dialog"
    >
      <span
        aria-hidden="true"
        className="inline-block bg-current"
        style={{
          width: 24,
          height: 24,
          color: 'var(--color-icon-secondary-default)',
          maskImage: 'url(/icons/close.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/icons/close.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </button>
  );
}

/* ── Shared content block ── */
function DialogContent({
  icon,
  iconMultiColor,
  imageSrc,
  imageAlt,
  headline,
  supportText,
  primaryAction,
  secondaryAction,
  children,
}: Pick<
  DialogProps,
  | 'icon'
  | 'iconMultiColor'
  | 'imageSrc'
  | 'imageAlt'
  | 'headline'
  | 'supportText'
  | 'primaryAction'
  | 'secondaryAction'
  | 'children'
>) {
  return (
    <>
      {/* Content: icon/image + headline + support text */}
      <div className="flex flex-col items-center gap-wds-16">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt || ''}
            className="flex-shrink-0 object-cover"
            style={{ width: 200, height: 200, borderRadius: 12 }}
          />
        )}
        {!imageSrc && icon && (
          <DialogIcon name={icon} multiColor={iconMultiColor} />
        )}
        {headline && (
          <h2
            className="font-display font-[800] text-center w-full"
            style={{
              fontSize: 23,
              lineHeight: '32px',
              color: 'var(--color-text-primary-default)',
            }}
          >
            {headline}
          </h2>
        )}
        {supportText && (
          <p
            className="font-body text-center w-full"
            style={{
              fontSize: 14,
              lineHeight: '20px',
              color: 'var(--color-text-secondary-default)',
            }}
          >
            {supportText}
          </p>
        )}
      </div>

      {/* Custom content */}
      {children && <div className="w-full">{children}</div>}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col gap-wds-8 w-full">
          {primaryAction && (
            <Button
              variant="filled"
              colorScheme={primaryAction.colorScheme || 'secondary'}
              fullWidth
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="text"
              colorScheme={secondaryAction.colorScheme || 'secondary'}
              fullWidth
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

/* ── Main Dialog component ── */
export function Dialog({
  isOpen,
  onClose,
  variant = 'standard',
  fullscreen = false,
  icon,
  iconMultiColor = false,
  imageSrc,
  imageAlt,
  headline,
  supportText,
  primaryAction,
  secondaryAction,
  showClose = true,
  children,
}: DialogProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isStandard = variant === 'standard';
  // Prompt variant never shows close X or secondary action
  const shouldShowClose = isStandard && showClose;
  const resolvedSecondary = isStandard ? secondaryAction : undefined;

  if (fullscreen) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--color-bg-primary-default)' }}
            variants={fullscreenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={headline || 'Dialog'}
          >
            {/* Safe area spacer for status bar */}
            <div className="flex-shrink-0" style={{ height: 54 }} />

            {/* Close button row */}
            <div className="flex justify-end px-wds-16 flex-shrink-0">
              <CloseButton onClick={onClose} />
            </div>

            {/* Centered content area */}
            <div className="flex-1 flex flex-col items-center justify-center px-wds-24 pb-wds-24">
              <div className="flex flex-col items-center gap-wds-16 w-full" style={{ maxWidth: 310 }}>
                <DialogContent
                  icon={icon}
                  iconMultiColor={iconMultiColor}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  headline={headline}
                  supportText={supportText}
                  primaryAction={primaryAction}
                  secondaryAction={resolvedSecondary}
                >
                  {children}
                </DialogContent>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Non-fullscreen card dialog
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            variants={scrimVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-wds-16"
            style={{ pointerEvents: 'none' }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative flex flex-col items-center w-full"
              style={{
                backgroundColor: 'var(--color-bg-primary-default)',
                borderRadius: 24,
                padding: '40px 24px',
                pointerEvents: 'auto',
                maxWidth: 358,
              }}
              role="dialog"
              aria-modal="true"
              aria-label={headline || 'Dialog'}
            >
              {/* Close X — top right, positioned over padding */}
              {shouldShowClose && (
                <div className="absolute" style={{ top: 8, right: 8 }}>
                  <CloseButton onClick={onClose} />
                </div>
              )}

              {/* Content + actions */}
              <div className="flex flex-col items-center gap-wds-16 w-full">
                <DialogContent
                  icon={icon}
                  iconMultiColor={iconMultiColor}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  headline={headline}
                  supportText={supportText}
                  primaryAction={primaryAction}
                  secondaryAction={resolvedSecondary}
                >
                  {children}
                </DialogContent>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
