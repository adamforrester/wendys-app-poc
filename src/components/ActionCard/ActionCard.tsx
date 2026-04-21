import { Button } from '../Button/Button';
import { Label } from '../Label/Label';

export type ActionCardTitleSize = 'title-m' | 'title-xs' | 'title-2xs';
export type ActionCardCTA = 'outline' | 'text' | 'none';
export type ActionCardImageSide = 'left' | 'right';
export type ActionCardImageSize = 112 | 48;

export interface ActionCardProps {
  /** Overline text above title */
  overline?: string;
  /** Main title */
  title: string;
  /** Subtitle below title */
  subtitle?: string;
  /** Title typography size */
  titleSize?: ActionCardTitleSize;
  /** Product/item image URL */
  imageSrc?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Image position — left or right of content */
  imageSide?: ActionCardImageSide;
  /** Image size in pixels */
  imageSize?: ActionCardImageSize;
  /** Optional label text (bordered pill) */
  label?: string;
  /** CTA style — outline button, text link, or none */
  ctaType?: ActionCardCTA;
  /** CTA button text */
  ctaLabel?: string;
  /** CTA click handler */
  onCtaPress?: () => void;
  /** Show loading skeleton */
  loading?: boolean;
}

/* ── Title size styles ── */
function getTitleStyles(size: ActionCardTitleSize) {
  if (size === 'title-m') {
    return { fontSize: 20, lineHeight: '24px', fontWeight: 800 };
  }
  if (size === 'title-xs') {
    return { fontSize: 16, lineHeight: '20px', fontWeight: 600 };
  }
  // title-2xs
  return { fontSize: 12, lineHeight: '16px', fontWeight: 800 };
}

/* ── Skeleton shimmer ── */
function Skeleton({ width, height, radius = 4 }: { width: number | string; height: number; radius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--color-bg-secondary-default) 25%, var(--color-bg-tertiary-default) 50%, var(--color-bg-secondary-default) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function ActionCard({
  overline,
  title,
  subtitle,
  titleSize = 'title-m',
  imageSrc,
  imageAlt,
  imageSide = 'left',
  imageSize = 112,
  label,
  ctaType = 'outline',
  ctaLabel,
  onCtaPress,
  loading = false,
}: ActionCardProps) {
  const imagePadding = 8;
  const imageFrameSize = imageSize + imagePadding * 2;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div
        className="flex"
        style={{
          width: 358,
          backgroundColor: 'var(--color-bg-primary-default)',
          border: '1px solid var(--color-border-tertiary-default)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div className="flex-shrink-0" style={{ padding: imagePadding, width: imageFrameSize, height: imageFrameSize }}>
          <Skeleton width={imageSize} height={imageSize} radius={8} />
        </div>
        <div className="flex flex-col flex-1" style={{ padding: '8px 16px 12px 4px', gap: 12 }}>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <Skeleton width={60} height={12} />
            <Skeleton width={120} height={20} />
            <Skeleton width={80} height={12} />
          </div>
          <Skeleton width={80} height={24} />
        </div>
      </div>
    );
  }

  /* ── Image element ── */
  const imageElement = imageSrc ? (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: imageFrameSize, height: imageFrameSize, padding: imagePadding }}
    >
      <img
        src={imageSrc}
        alt={imageAlt || title}
        className="object-contain"
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: 8,
        }}
      />
    </div>
  ) : null;

  /* ── Content element ── */
  const titleStyles = getTitleStyles(titleSize);

  const contentElement = (
    <div
      className="flex flex-col flex-1 min-w-0"
      style={{ padding: '8px 16px 12px 4px', gap: 12 }}
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
          className="font-display"
          style={{
            ...titleStyles,
            color: 'var(--color-text-primary-default)',
          }}
        >
          {title}
        </span>
        {subtitle && (
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
        )}
      </div>

      {/* Label + CTA */}
      {(label || (ctaType !== 'none' && ctaLabel)) && (
        <div className="flex flex-col" style={{ gap: 12 }}>
          {label && (
            <div className="flex">
              <Label>{label}</Label>
            </div>
          )}
          {ctaType === 'outline' && ctaLabel && (
            <div className="flex">
              <Button
                variant="outline"
                size="small"
                onClick={onCtaPress}
              >
                {ctaLabel}
              </Button>
            </div>
          )}
          {ctaType === 'text' && ctaLabel && (
            <button
              className="self-start font-display font-bold underline"
              style={{
                fontSize: 14,
                lineHeight: '20px',
                color: 'var(--color-text-brand-secondary-default)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={onCtaPress}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="flex"
      style={{
        width: 358,
        backgroundColor: 'var(--color-bg-primary-default)',
        border: '1px solid var(--color-border-tertiary-default)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {imageSide === 'left' && imageElement}
      {contentElement}
      {imageSide === 'right' && imageElement}
    </div>
  );
}
