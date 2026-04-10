import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '../Checkbox/Checkbox';
import { Chip } from '../Chip/Chip';
import { Counter } from '../Counter/Counter';

export type IngredientModifierType = 'chips' | 'counter' | 'none';
export type IngredientLeading = 'image' | 'icon' | 'none';

export interface ChipOption {
  id: string;
  label: string;
  meta?: string;
  caption?: string;
}

export interface IngredientCollapseProps {
  /** Ingredient name */
  headline: string;
  /** Subtitle text (second line) */
  subtitle?: string;
  /** Trailing text (e.g., price like "+$1.80") */
  trailing?: string;
  /** Caption below trailing */
  caption?: string;
  /** Leading element type */
  leading?: IngredientLeading;
  /** Image source (when leading='image') */
  imageSrc?: string;
  /** Icon name (when leading='icon') */
  iconName?: string;
  /** Whether this ingredient is selected/checked */
  checked: boolean;
  /** Check toggle handler */
  onCheckedChange: (checked: boolean) => void;
  /** What type of modifier appears when expanded */
  modifierType?: IngredientModifierType;
  /** Chip options (when modifierType='chips') */
  chipOptions?: ChipOption[];
  /** Currently selected chip id */
  selectedChip?: string;
  /** Chip selection handler */
  onChipSelect?: (chipId: string) => void;
  /** Counter value (when modifierType='counter') */
  counterValue?: number;
  /** Counter min */
  counterMin?: number;
  /** Counter max */
  counterMax?: number;
  /** Counter change handler */
  onCounterChange?: (value: number) => void;
  /** Show bottom divider */
  showDivider?: boolean;
}

export function IngredientCollapse({
  headline,
  subtitle,
  trailing,
  caption,
  leading = 'none',
  imageSrc,
  iconName = 'FPO-default-icon',
  checked,
  onCheckedChange,
  modifierType = 'none',
  chipOptions = [],
  selectedChip,
  onChipSelect,
  counterValue = 0,
  counterMin = 0,
  counterMax = 10,
  onCounterChange,
  showDivider = true,
}: IngredientCollapseProps) {
  const showExpanded = checked && modifierType !== 'none';

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Main row — tappable to toggle checkbox */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center w-full border-none bg-transparent p-0 cursor-pointer"
        style={{
          padding: leading === 'image' ? '8px 8px 8px 16px' : '8px 8px 8px 16px',
          gap: 16,
          backgroundColor: 'var(--color-bg-primary-default)',
          minHeight: leading === 'image' ? 80 : 56,
        }}
        onClick={() => onCheckedChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (e.key === ' ') e.preventDefault();
            onCheckedChange(!checked);
          }
        }}
      >
        {/* Leading */}
        {leading === 'image' && imageSrc && (
          <div className="flex-shrink-0" style={{ width: 64, height: 64 }}>
            <img src={imageSrc} alt="" className="w-full h-full object-contain" />
          </div>
        )}
        {leading === 'icon' && (
          <div className="flex-shrink-0" style={{ width: 40, height: 40 }}>
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 40, height: 40,
                backgroundColor: 'var(--color-icon-secondary-default)',
                maskImage: `url(/icons/${iconName}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: `url(/icons/${iconName}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </div>
        )}

        {/* Content — headline + subtitle */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            className="font-body text-[16px] leading-[24px] font-bold text-left"
            style={{ color: 'var(--color-text-primary-default)' }}
          >
            {headline}
          </span>
          {subtitle && (
            <span
              className="font-body text-[14px] leading-[20px] text-left"
              style={{ color: 'var(--color-text-secondary-default)' }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Trailing text + caption */}
        {(trailing || caption) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            {trailing && (
              <span
                className="font-body text-[14px] leading-[20px] font-bold"
                style={{ color: 'var(--color-text-primary-default)' }}
              >
                {trailing}
              </span>
            )}
            {caption && (
              <span
                className="font-body text-[12px] leading-[16px]"
                style={{ color: 'var(--color-text-secondary-default)' }}
              >
                {caption}
              </span>
            )}
          </div>
        )}

        {/* Checkbox */}
        <div
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checked ? 'selected' : 'unselected'}
            onChange={() => onCheckedChange(!checked)}
          />
        </div>
      </div>

      {/* Expanded modifier area */}
      <AnimatePresence initial={false}>
        {showExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {modifierType === 'chips' && chipOptions.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: '12px 0 24px 0',
                }}
              >
                {chipOptions.map((chip) => (
                  <div key={chip.id} style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Chip
                      label={chip.label}
                      meta={chip.meta}
                      caption={chip.caption}
                      selected={selectedChip === chip.id}
                      onPress={() => onChipSelect?.(chip.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {modifierType === 'counter' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0 0 0' }}>
                <Counter
                  value={counterValue}
                  min={counterMin}
                  max={counterMax}
                  onChange={onCounterChange || (() => {})}
                  bordered
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      {showDivider && (
        <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)' }} />
      )}
    </div>
  );
}
