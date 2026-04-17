import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../../animations/haptics';

export interface UpsellCardProps {
  /** Overline text above the title */
  overline?: string;
  /** Product/add-on name */
  title: string;
  /** Price string (e.g., "+$1.99") */
  subtitle: string;
  /** Ingredient image URL */
  imageSrc?: string;
  /** Whether the upsell has been added */
  isAdded?: boolean;
  /** Called when user taps "Add it on" */
  onAdd?: () => void;
  /** Called when user taps "Remove it" */
  onRemove?: () => void;
}

export function UpsellCard({
  overline = 'Add a little bonus',
  title,
  subtitle,
  imageSrc,
  isAdded = false,
  onAdd,
  onRemove,
}: UpsellCardProps) {
  const handleAdd = () => {
    haptics.light();
    onAdd?.();
  };

  const handleRemove = () => {
    haptics.light();
    onRemove?.();
  };

  return (
    <div className="px-wds-16 pb-wds-16">
      <div
        className="flex items-start w-full"
        style={{
          backgroundColor: 'var(--color-bg-primary-default)',
          border: '1px solid var(--color-border-tertiary-default)',
          borderRadius: 8,
        }}
      >
        {/* Image frame */}
        {imageSrc && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 88, height: 72, padding: '8px 16px' }}
          >
            <img
              src={imageSrc}
              alt={title}
              className="object-contain"
              style={{ width: 56, height: 56 }}
            />
          </div>
        )}

        {/* Content frame */}
        <div
          className="flex flex-col flex-1 min-w-0"
          style={{ padding: '8px 16px 12px 0', gap: 8 }}
        >
          {/* Text content */}
          <div className="flex flex-col" style={{ gap: 4 }}>
            {overline && (
              <span
                className="font-display font-bold"
                style={{
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'var(--color-text-secondary-default)',
                }}
              >
                {overline}
              </span>
            )}
            <span
              className="font-display font-semibold"
              style={{
                fontSize: 16,
                lineHeight: '20px',
                color: 'var(--color-text-primary-default)',
              }}
            >
              {title}
            </span>
            <span
              className="font-body"
              style={{
                fontSize: 12,
                lineHeight: '16px',
                color: 'var(--color-text-secondary-default)',
              }}
            >
              {subtitle}
            </span>
          </div>

          {/* Label and CTA */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <AnimatePresence>
              {isAdded && (
                <motion.div
                  className="flex"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 24 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="inline-flex items-center gap-wds-4"
                    style={{
                      padding: '4px 12px 4px 8px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border-validation-positive)',
                      fontSize: 12,
                      lineHeight: '16px',
                      color: 'var(--color-text-validation-positive)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block"
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: 'var(--color-icon-validation-positive)',
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
                    <span className="font-display font-bold">Added</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA button */}
            <button
              onClick={isAdded ? handleRemove : handleAdd}
              className="self-start font-display font-bold underline"
              style={{
                fontSize: 14,
                lineHeight: '24px',
                color: 'var(--color-text-brand-secondary-default)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {isAdded ? 'Remove it' : 'Add it on'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
