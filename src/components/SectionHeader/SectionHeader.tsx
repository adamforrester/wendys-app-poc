import { Button } from '../Button/Button';

export type SectionHeaderSize = 'large' | 'small';

export interface SectionHeaderProps {
  /** Title text */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Show rewards icon next to subtitle */
  showRewardsIcon?: boolean;
  /** Size variant */
  size?: SectionHeaderSize;
  /** Include horizontal padding (16px) */
  padding?: boolean;
  /** CTA button label (e.g., "View All") */
  ctaLabel?: string;
  /** CTA button handler */
  onCtaPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  showRewardsIcon = false,
  size = 'large',
  padding = true,
  ctaLabel,
  onCtaPress,
}: SectionHeaderProps) {
  const isLarge = size === 'large';

  const titleStyle: React.CSSProperties = {
    fontSize: isLarge ? 26 : 18,
    lineHeight: isLarge ? '32px' : '24px',
    fontWeight: 800,
    color: 'var(--color-text-primary-default)',
    margin: 0,
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: isLarge ? 104 : 56,
    padding: padding ? '0 16px' : undefined,
    backgroundColor: 'var(--color-bg-primary-default)',
  };

  const textPadding = isLarge ? '24px 0' : '4px 0';

  return (
    <div style={containerStyle}>
      {/* Text content — fills available space */}
      <div style={{ flex: 1, padding: textPadding, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 className="font-display" style={titleStyle}>
          {title}
        </h2>
        {subtitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {showRewardsIcon && (
              <img
                src="/icons/rewards-simple.svg"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            )}
            <span
              className="font-body text-[14px] leading-[20px]"
              style={{ color: 'var(--color-text-secondary-default)' }}
            >
              {subtitle}
            </span>
          </div>
        )}
      </div>

      {/* CTA button */}
      {ctaLabel && (
        <Button
          variant="text"
          size="small"
          noPadding
          onClick={onCtaPress}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
