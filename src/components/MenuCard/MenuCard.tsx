import { useState } from 'react';
import { motion } from 'framer-motion';
import { buttonPress } from '../../animations/presets';
import { Label, type LabelState } from '../Label/Label';

export interface MenuCardLabel {
  text: string;
  state?: LabelState;
}

export interface MenuCardProps {
  /** Product title */
  title: string;
  /** Subtitle text — typically price (e.g., "$8.99") */
  subtitle?: string;
  /** Caption text below subtitle — typically calories (e.g., "590-1010 Cal") */
  caption?: string;
  /** Show rewards icon before subtitle */
  showRewardsIcon?: boolean;
  /** Product image source */
  imageSrc: string;
  /** Fallback image */
  fallbackSrc?: string;
  /** Optional label at bottom of card */
  label?: MenuCardLabel;
  /** Disabled state */
  disabled?: boolean;
  /** Tap handler */
  onPress?: () => void;
}

export function MenuCard({
  title,
  subtitle,
  caption,
  showRewardsIcon = false,
  imageSrc,
  fallbackSrc = '/images/wendys-wave-red.svg',
  label,
  disabled = false,
  onPress,
}: MenuCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const displaySrc = imgError ? fallbackSrc : imageSrc;

  return (
    <motion.button
      className="flex flex-col border-none p-0 text-left"
      style={{
        width: '100%',
        borderRadius: 8,
        backgroundColor: disabled ? 'var(--color-bg-disabled-default)' : 'var(--color-bg-primary-default)',
        boxShadow: disabled ? 'none' : 'var(--onlight-s)',
        overflow: 'hidden',
      }}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      variants={buttonPress}
      initial="idle"
      whileTap={disabled ? undefined : 'pressed'}
    >
      {/* Image area */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
        {/* Fallback while loading */}
        {!imgLoaded && !imgError && (
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
          className="w-full h-full object-cover"
          style={{
            opacity: disabled ? 0.4 : imgLoaded ? 1 : 0,
            filter: disabled ? 'grayscale(100%)' : undefined,
            transition: 'opacity 0.2s ease',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Text content */}
      <div className="flex flex-col flex-1" style={{ padding: 12, gap: 4 }}>
        <span
          className="font-display text-[16px] leading-[20px] font-bold"
          style={{
            color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <div className="flex items-center gap-wds-4">
            {showRewardsIcon && (
              <img
                src="/icons/rewards-simple.svg"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="flex-shrink-0"
                style={{ opacity: disabled ? 0.4 : 1 }}
              />
            )}
            <span
              className="font-body text-[14px] leading-[20px]"
              style={{
                color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-secondary-default)',
              }}
            >
              {subtitle}
            </span>
          </div>
        )}
        {caption && (
          <span
            className="font-body text-[14px] leading-[20px]"
            style={{
              color: disabled ? 'var(--color-text-disabled-default)' : 'var(--color-text-secondary-default)',
            }}
          >
            {caption}
          </span>
        )}
      </div>

      {/* Docked label */}
      {label && (
        <Label state={label.state || 'primary'} docked>
          {label.text}
        </Label>
      )}
    </motion.button>
  );
}
