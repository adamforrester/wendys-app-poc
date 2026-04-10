import { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { buttonPress } from '../../animations/presets';
import { haptics } from '../../animations/haptics';
import { Spinner } from '../Spinner/Spinner';

export type ButtonType =
  | 'filled'
  | 'outline'
  | 'text'
  | 'filled-reversed'
  | 'outline-reversed'
  | 'text-reversed';

export type ButtonSize = 'large' | 'small';
export type ButtonColorScheme = 'secondary' | 'primary';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual style variant */
  variant?: ButtonType;
  /** Brand color scheme — secondary (teal, default) or primary (red) */
  colorScheme?: ButtonColorScheme;
  /** Button size */
  size?: ButtonSize;
  /** Adds drop shadow (only applies to filled and outline variants) */
  elevated?: boolean;
  /** Removes horizontal padding (only applies to text and text-reversed variants) */
  noPadding?: boolean;
  /** Shows loading spinner, replaces content */
  loading?: boolean;
  /** Icon name for left slot (filename without .svg from /icons/) */
  leftIcon?: string;
  /** Render left icon as multi-color image instead of tinted mask */
  leftIconMultiColor?: boolean;
  /** Icon name for right slot */
  rightIcon?: string;
  /** Render right icon as multi-color image instead of tinted mask */
  rightIconMultiColor?: boolean;
  /** Makes button full width */
  fullWidth?: boolean;
  /** Button label */
  children: React.ReactNode;
}

/* ── Icon component ── */
function ButtonIcon({ name, size, multiColor = false }: { name: string; size: number; multiColor?: boolean }) {
  if (multiColor) {
    return (
      <img
        src={`/icons/${name}.svg`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="flex-shrink-0"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 inline-block bg-current"
      style={{
        width: size,
        height: size,
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

/* ── Color token helpers ──
 * Returns Tailwind classes for a given variant + color scheme.
 * All class strings must be fully static (no template interpolation)
 * so Tailwind's scanner can detect them at build time.
 *
 * "secondary" uses brand.secondary tokens (teal/blue-600).
 * "primary" uses brand.primary tokens (red-500).
 */

function getBgStyles(variant: ButtonType, cs: ButtonColorScheme): string {
  if (variant === 'filled') {
    return cs === 'primary'
      ? 'bg-[var(--color-bg-brand-primary-default)] hover:bg-[var(--color-bg-brand-primary-hover)] active:bg-[var(--color-bg-brand-primary-active)]'
      : 'bg-[var(--color-bg-brand-secondary-default)] hover:bg-[var(--color-bg-brand-secondary-hover)] active:bg-[var(--color-bg-brand-secondary-active)]';
  }
  if (variant === 'outline') return 'bg-wds-bg-primary hover:bg-[var(--color-bg-primary-hover)] active:bg-[var(--color-bg-primary-active)]';
  if (variant === 'text') return 'bg-transparent hover:bg-[var(--color-bg-primary-hover)] active:bg-[var(--color-bg-primary-active)]';
  if (variant === 'filled-reversed') return 'bg-[var(--color-bg-onbrand-default)] hover:bg-[var(--color-bg-onbrand-hover)] active:bg-[var(--color-bg-onbrand-active)]';
  return 'bg-transparent'; // outline-reversed, text-reversed
}

function getTextStyles(variant: ButtonType, cs: ButtonColorScheme): string {
  if (variant === 'filled') return 'text-[var(--color-text-onbrand-default)]';
  if (variant === 'outline' || variant === 'text' || variant === 'filled-reversed') {
    return cs === 'primary'
      ? 'text-[var(--color-text-brand-primary-default)] hover:text-[var(--color-text-brand-primary-hover)] active:text-[var(--color-text-brand-primary-active)]'
      : 'text-[var(--color-text-brand-secondary-default)] hover:text-[var(--color-text-brand-secondary-hover)] active:text-[var(--color-text-brand-secondary-active)]';
  }
  // outline-reversed, text-reversed
  return 'text-[var(--color-text-onbrand-default)] hover:text-[var(--color-text-onbrand-hover)] active:text-[var(--color-text-onbrand-active)]';
}

function getBorderStyles(variant: ButtonType, cs: ButtonColorScheme): string {
  if (variant === 'outline') {
    return cs === 'primary'
      ? 'border-[var(--color-border-brand-primary-default)] hover:border-[var(--color-border-brand-primary-hover)] active:border-[var(--color-border-brand-primary-active)]'
      : 'border-[var(--color-border-brand-secondary-default)] hover:border-[var(--color-border-brand-secondary-hover)] active:border-[var(--color-border-brand-secondary-active)]';
  }
  if (variant === 'outline-reversed') return 'border-[var(--color-border-onbrand-default)] hover:border-[var(--color-border-onbrand-hover)] active:border-[var(--color-border-onbrand-active)]';
  return 'border-transparent'; // filled, text, filled-reversed, text-reversed
}

function getDisabledBgStyles(variant: ButtonType): string {
  if (variant === 'filled') return 'bg-wds-bg-disabled';
  if (variant === 'outline') return 'bg-wds-bg-primary';
  if (variant === 'filled-reversed') return 'bg-[var(--color-bg-disabled-onbrand)]';
  return 'bg-transparent'; // text, outline-reversed, text-reversed
}

function getDisabledTextStyles(variant: ButtonType): string {
  if (variant === 'filled' || variant === 'filled-reversed') return 'text-[var(--color-text-disabled-ondisabled)]';
  if (variant === 'outline' || variant === 'text') return 'text-wds-text-disabled';
  return 'text-[var(--color-text-disabled-onbrand)]'; // outline-reversed, text-reversed
}

function getDisabledBorderStyles(variant: ButtonType): string {
  if (variant === 'outline') return 'border-wds-border-disabled';
  if (variant === 'outline-reversed') return 'border-[var(--color-border-disabled-onbrand)]';
  return 'border-transparent'; // filled, text, filled-reversed, text-reversed
}

function getSpinnerColor(variant: ButtonType, cs: ButtonColorScheme): string {
  if (variant === 'filled') return 'text-[var(--color-text-onbrand-default)]';
  if (variant === 'outline' || variant === 'text' || variant === 'filled-reversed') {
    return cs === 'primary'
      ? 'text-[var(--color-text-brand-primary-default)]'
      : 'text-[var(--color-text-brand-secondary-default)]';
  }
  return 'text-[var(--color-text-onbrand-default)]'; // outline-reversed, text-reversed
}

function isTextVariant(variant: ButtonType): boolean {
  return variant === 'text' || variant === 'text-reversed';
}

function supportsElevated(variant: ButtonType): boolean {
  return (
    variant === 'filled' ||
    variant === 'outline' ||
    variant === 'filled-reversed' ||
    variant === 'outline-reversed'
  );
}

export function Button({
  variant = 'filled',
  colorScheme = 'secondary',
  size = 'large',
  elevated = false,
  noPadding = false,
  loading = false,
  disabled = false,
  leftIcon,
  leftIconMultiColor = false,
  rightIcon,
  rightIconMultiColor = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled;
  const isText = isTextVariant(variant);
  const showElevated = elevated && supportsElevated(variant) && !isDisabled && !loading;
  const showNoPadding = noPadding && isText;
  const iconSize = 16;

  // Typography classes
  const typographyClass =
    size === 'large'
      ? 'font-display text-[18px] leading-[24px] font-bold'
      : 'font-display text-[14px] leading-[20px] font-bold';

  // Text underline for text variants
  const textDecorationClass = isText ? 'underline' : '';

  // Build classes for the interactive button element
  const buildButtonClasses = () => {
    const base = [
      'inline-flex items-center justify-center',
      'rounded-wds-full',
      'border border-solid',
      'transition-colors duration-150',
      typographyClass,
      textDecorationClass,
    ];

    if (fullWidth) base.push('w-full');

    // Size-specific padding and min-width
    if (size === 'large') {
      base.push('h-[48px]');
      if (showNoPadding) {
        base.push('px-0 py-[12px]');
      } else {
        base.push('px-wds-16 py-[12px]');
        base.push('min-w-[96px]');
      }
      base.push('gap-wds-8');
    } else {
      base.push('h-[32px]');
      if (showNoPadding) {
        base.push('px-0 py-wds-4');
      } else {
        base.push('px-wds-24 py-wds-4');
        base.push('min-w-[96px]');
      }
      base.push('gap-wds-8');
    }

    // Color styles
    if (isDisabled) {
      base.push(getDisabledBgStyles(variant));
      base.push(getDisabledTextStyles(variant));
      base.push(getDisabledBorderStyles(variant));
      base.push('cursor-not-allowed');
    } else if (loading) {
      // Loading keeps enabled colors but prevents interaction
      base.push(getBgStyles(variant, colorScheme).split(' ')[0]);
      base.push(getTextStyles(variant, colorScheme).split(' ')[0]);
      base.push(getBorderStyles(variant, colorScheme).split(' ')[0]);
      base.push('pointer-events-none');
    } else {
      base.push(getBgStyles(variant, colorScheme));
      base.push(getTextStyles(variant, colorScheme));
      base.push(getBorderStyles(variant, colorScheme));
    }

    // Elevation shadow
    if (showElevated) {
      base.push('shadow-wds-s hover:shadow-wds-m active:shadow-none');
    }

    return base.filter(Boolean).join(' ');
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    haptics.light();
    onClick?.(e);
  };

  // Loading state — spinner replaces content
  if (loading) {
    return (
      <button
        className={`${buildButtonClasses()} ${className}`}
        aria-busy="true"
        aria-disabled="true"
        {...rest}
      >
        <Spinner size={size === 'large' ? 32 : 24} className={getSpinnerColor(variant, colorScheme)} />
      </button>
    );
  }

  // Small size wrapping: Figma has a 48px outer with 32px inner for tap target
  // Skip wrapper for noPadding text variants (used in compact contexts like TopAppBar)
  if (size === 'small') {
    if (showNoPadding) {
      return (
        <motion.button
          className={`${buildButtonClasses()} ${className}`}
          disabled={isDisabled}
          onClick={handleClick}
          variants={buttonPress}
          initial="idle"
          whileTap={isDisabled ? undefined : 'pressed'}
          {...(rest as any)}
        >
          {leftIcon && <ButtonIcon name={leftIcon} size={iconSize} multiColor={leftIconMultiColor} />}
          <span>{children}</span>
          {rightIcon && <ButtonIcon name={rightIcon} size={iconSize} multiColor={rightIconMultiColor} />}
        </motion.button>
      );
    }

    return (
      <motion.div
        className={`inline-flex items-center justify-center ${fullWidth ? 'w-full' : ''}`}
        style={{ minHeight: 48 }}
        variants={buttonPress}
        initial="idle"
        whileTap={isDisabled ? undefined : 'pressed'}
      >
        <button
          className={`${buildButtonClasses()} ${className}`}
          disabled={isDisabled}
          onClick={handleClick}
          {...rest}
        >
          {leftIcon && <ButtonIcon name={leftIcon} size={iconSize} multiColor={leftIconMultiColor} />}
          <span>{children}</span>
          {rightIcon && <ButtonIcon name={rightIcon} size={iconSize} multiColor={rightIconMultiColor} />}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      className={`${buildButtonClasses()} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      variants={buttonPress}
      initial="idle"
      whileTap={isDisabled ? undefined : 'pressed'}
      {...(rest as any)}
    >
      {leftIcon && <ButtonIcon name={leftIcon} size={iconSize} multiColor={leftIconMultiColor} />}
      <span>{children}</span>
      {rightIcon && <ButtonIcon name={rightIcon} size={iconSize} multiColor={rightIconMultiColor} />}
    </motion.button>
  );
}
