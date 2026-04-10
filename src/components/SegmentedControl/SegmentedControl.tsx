import { motion } from 'framer-motion';

export type SegmentedControlDensity = 'xl' | 'lg' | 'md' | 'sm';
export type SegmentedControlColorScheme = 'default' | 'onBrand';

export interface SegmentItem {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  /** Segment items (max 5) */
  segments: SegmentItem[];
  /** Active segment id */
  activeSegment: string;
  /** Change handler */
  onSegmentChange: (segmentId: string) => void;
  /** Size density */
  density?: SegmentedControlDensity;
  /** Full width — stretches to fill container */
  fullWidth?: boolean;
  /** Color scheme — 'default' (teal on white) or 'onBrand' (white on brand bg) */
  colorScheme?: SegmentedControlColorScheme;
  /** Accessible label for the radiogroup */
  'aria-label'?: string;
}

const densityHeights: Record<SegmentedControlDensity, { outer: number; inner: number }> = {
  xl: { outer: 48, inner: 40 },
  lg: { outer: 44, inner: 36 },
  md: { outer: 40, inner: 32 },
  sm: { outer: 36, inner: 28 },
};

export function SegmentedControl({
  segments,
  activeSegment,
  onSegmentChange,
  density = 'xl',
  fullWidth = false,
  colorScheme = 'default',
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  const { outer, inner } = densityHeights[density];
  const vertPad = (outer - inner) / 2;
  const count = segments.length;
  const isOnBrand = colorScheme === 'onBrand';

  const getColors = (isActive: boolean) => {
    if (isOnBrand) {
      return {
        bg: isActive ? 'var(--color-bg-onbrand-default)' : 'transparent',
        text: isActive ? 'var(--color-text-brand-primary-default)' : 'var(--color-text-onbrand-default)',
        border: 'var(--color-border-onbrand-default)',
      };
    }
    return {
      bg: isActive ? 'var(--color-bg-brand-secondary-default)' : 'var(--color-bg-primary-default)',
      text: isActive ? 'var(--color-text-onbrand-default)' : 'var(--color-text-primary-default)',
      border: 'var(--color-border-primary-default)',
    };
  };

  return (
    <div
      className={`inline-flex ${fullWidth ? 'w-full' : ''}`}
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ height: outer }}
    >
      {segments.map((segment, index) => {
        const isActive = segment.id === activeSegment;
        const isFirst = index === 0;
        const isLast = index === count - 1;
        const colors = getColors(isActive);

        // Border radius for pill ends
        const radius = inner / 2;
        const borderRadius = [
          isFirst ? radius : 0,
          isLast ? radius : 0,
          isLast ? radius : 0,
          isFirst ? radius : 0,
        ].map(r => `${r}px`).join(' ');

        return (
          <button
            key={segment.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onSegmentChange(segment.id)}
            className="relative border-none p-0"
            style={{
              height: outer,
              flex: fullWidth ? '1 1 0' : '0 0 auto',
              paddingTop: vertPad,
              paddingBottom: vertPad,
              background: 'transparent',
              marginLeft: index > 0 ? -1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            <motion.div
              className="flex items-center justify-center"
              style={{
                height: inner,
                padding: '0 12px',
                borderRadius,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bg,
                color: colors.text,
                minWidth: fullWidth ? 0 : undefined,
              }}
              animate={{ backgroundColor: colors.bg }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-display text-[16px] leading-[20px] font-bold whitespace-nowrap">
                {segment.label}
              </span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
