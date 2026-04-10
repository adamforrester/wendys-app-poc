import { useState } from 'react';
import { motion } from 'framer-motion';
import { buttonPress } from '../../animations/presets';

export interface CategoryCardProps {
  /** Category title */
  title: string;
  /** Image source */
  imageSrc: string;
  /** Fallback image when loading or on error — defaults to Wendy's W logo */
  fallbackSrc?: string;
  /** Disabled state — grayed out */
  disabled?: boolean;
  /** Tap handler */
  onPress?: () => void;
}

export function CategoryCard({
  title,
  imageSrc,
  fallbackSrc = '/images/wendys-wave-red.svg',
  disabled = false,
  onPress,
}: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const showFallback = imgError || !imgLoaded;
  const displaySrc = imgError ? fallbackSrc : imageSrc;

  return (
    <motion.button
      className="flex flex-col items-center border-none p-0"
      style={{
        width: '100%',
        borderRadius: 8,
        backgroundColor: disabled ? 'var(--color-bg-disabled-default)' : 'var(--color-bg-primary-default)',
        paddingTop: 8,
        paddingBottom: 8,
      }}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      variants={buttonPress}
      initial="idle"
      whileTap={disabled ? undefined : 'pressed'}
    >
      {/* Image area */}
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        {/* Fallback W logo — visible while loading */}
        {showFallback && !imgError && (
          <img
            src={fallbackSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto"
            style={{ width: 48, height: 48, opacity: 0.3 }}
          />
        )}
        <img
          src={displaySrc}
          alt=""
          className="w-full h-full object-contain"
          style={{
            opacity: disabled ? 0.4 : imgLoaded ? 1 : 0,
            filter: disabled ? 'grayscale(100%)' : undefined,
            transition: 'opacity 0.2s ease',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Title */}
      <div className="flex items-center justify-center px-wds-8" style={{ width: '100%' }}>
        <span
          className="font-display text-[16px] leading-[20px] font-bold text-center"
          style={{
            color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)',
          }}
        >
          {title}
        </span>
      </div>
    </motion.button>
  );
}
