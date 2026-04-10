export type ContentCardSize = 'large' | 'small';

export interface ContentCardProps {
  /** Card size — large (224px) or small (144px) */
  size?: ContentCardSize;
  /** Image source */
  imageSrc?: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Loading state — shows shimmer */
  loading?: boolean;
  /** Tap handler */
  onPress?: () => void;
}

const sizeHeights: Record<ContentCardSize, number> = {
  large: 224,
  small: 144,
};

const defaultImages: Record<ContentCardSize, string> = {
  large: '/images/content-cards/content-card-large-placeholder-1.png',
  small: '/images/content-cards/content-card-small-placeholder-1.png',
};

export function ContentCard({
  size = 'large',
  imageSrc,
  imageAlt = '',
  loading = false,
  onPress,
}: ContentCardProps) {
  const height = sizeHeights[size];
  const src = imageSrc || defaultImages[size];

  const containerStyle: React.CSSProperties = {
    width: 358,
    height,
    borderRadius: 8,
    border: '1px solid var(--color-border-secondary-default)',
    overflow: 'hidden',
    position: 'relative',
    cursor: onPress ? 'pointer' : undefined,
  };

  if (loading) {
    return (
      <div style={containerStyle} aria-busy="true">
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(90deg, var(--color-bg-secondary-default) 0%, var(--color-bg-primary-default) 40%, var(--color-bg-secondary-default) 80%)',
            backgroundSize: '200% 100%',
            animation: 'content-card-shimmer 1.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes content-card-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (onPress) {
    return (
      <button
        style={{ ...containerStyle, padding: 0, background: 'none', border: '1px solid var(--color-border-secondary-default)' }}
        onClick={onPress}
      >
        <img
          src={src}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  return (
    <div style={containerStyle}>
      <img
        src={src}
        alt={imageAlt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
