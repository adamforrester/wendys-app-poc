import { useState } from 'react';

export interface HeroImageProps {
  /** Image source */
  imageSrc: string;
  /** Fallback image on error */
  fallbackSrc?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Extra top padding (56px) for transparent app bar overlay on SPP */
  extraPadding?: boolean;
}

export function HeroImage({
  imageSrc,
  fallbackSrc = '/images/fallback.png',
  alt = '',
  extraPadding = false,
}: HeroImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const displaySrc = imgError ? fallbackSrc : imageSrc;

  return (
    <div
      style={{
        width: '100%',
        height: extraPadding ? 376 : 320,
        backgroundColor: 'var(--color-bg-primary-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: extraPadding ? 56 : 0,
        overflow: 'hidden',
      }}
    >
      <div
        className="relative"
        style={{ width: 320, height: 320, flexShrink: 0 }}
      >
        {/* Fallback while loading */}
        {!imgLoaded && !imgError && (
          <img
            src={fallbackSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto"
            style={{ width: 64, height: 64, opacity: 0.2 }}
          />
        )}
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full"
          style={{
            objectFit: 'contain',
            opacity: imgLoaded || imgError ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      </div>
    </div>
  );
}
