import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { BagButton } from './BagButton';
import { useBag } from '../../context/BagContext';
import { useCompactViewport } from '../../hooks/useCompactViewport';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { resolveRetro } from '../../config/featureFlags';
import { useStatusBarMode } from '../../context/StatusBarModeContext';

export type TitleMode = 'logo' | 'title';
export type TitlePlacement = 'center' | 'left';
export type TitleWeight = 'black' | 'semibold';
export type TopAppBarColorScheme = 'classic' | 'retro';

export interface TopAppBarProps {
  /** Show the Wendy's wave logo or a text title */
  titleMode?: TitleMode;
  /** Logo image path — defaults to Wendy's wave, can be swapped for campaigns */
  logoSrc?: string;
  /** Title text (only used when titleMode='title') */
  title?: string;
  /** Title alignment (only used when titleMode='title') */
  titlePlacement?: TitlePlacement;
  /** Title font weight — 'black' (800, TitleL/Black) or 'semibold' (600, TitleL/SemiBold) */
  titleWeight?: TitleWeight;
  /**
   * Color scheme — defaults to the resolved `topAppBarStyle` flag, so no
   * screen needs to pass it. An explicit value wins, which is what makes
   * the variant selectable in Storybook.
   */
  colorScheme?: TopAppBarColorScheme;
  /** Show back arrow as leading icon */
  showBackButton?: boolean;
  /** Custom back handler — defaults to router navigate(-1) */
  onBack?: () => void;
  /** Show the Points button in trailing actions */
  showPoints?: boolean;
  /** Rewards points value to display */
  points?: number;
  /** Points button is loading (shimmer state — future) */
  pointsLoading?: boolean;
  /** Show indeterminate loading bar at bottom of app bar */
  showLoadingBar?: boolean;
  /** Show the Find button in trailing actions */
  showFind?: boolean;
  /** Find button handler */
  onFind?: () => void;
  /** Show the Bag button in trailing actions */
  showBag?: boolean;
  /** Bag button handler */
  onBag?: () => void;
  /** Optional additional trailing content */
  trailingContent?: ReactNode;
}

export function TopAppBar({
  titleMode = 'logo',
  logoSrc,
  title = '',
  titlePlacement = 'center',
  titleWeight = 'black',
  colorScheme,
  showBackButton = false,
  onBack,
  showPoints = false,
  points = 0,
  pointsLoading = false,
  showLoadingBar = false,
  showFind = false,
  onFind,
  showBag = false,
  onBag,
  trailingContent,
}: TopAppBarProps) {
  const navigate = useNavigate();
  const { state: bagState } = useBag();
  const bagCount = bagState.items.reduce((sum, item) => sum + item.quantity, 0);
  const compact = useCompactViewport();

  const { flags } = useFeatureFlags();
  const scheme = colorScheme ?? resolveRetro(flags).topAppBar;
  const retro = scheme === 'retro';

  // Figma's retro bar draws the clock, wifi and battery in black. Owned here
  // rather than by the 11 consuming screens so the tint can't drift out of
  // sync with the bar color. The hook restores the previous mode on unmount.
  useStatusBarMode(retro ? 'dark' : 'light');

  // Retro's dark content comes from reading the non-reversed tokens here — NOT
  // from remapping the onBrand tokens, which are still correct for white labels
  // on red filled buttons elsewhere in the app.
  // Full static class strings: Tailwind v4 can't resolve interpolation.
  const headerBgClass = retro
    ? 'bg-[var(--color-bg-brand-retro-default)]'
    : 'bg-[var(--color-bg-brand-primary-default)]';
  const titleColorClass = retro
    ? 'text-[var(--color-text-primary-default)]'
    : 'text-[var(--color-text-onbrand-default)]';
  const backIconClass = retro
    ? 'inline-block w-[24px] h-[24px] bg-[var(--color-icon-primary-default)]'
    : 'inline-block w-[24px] h-[24px] bg-[var(--color-icon-onbrand-default)]';
  const trailingVariant = retro ? 'text' : 'text-reversed';
  // `text` only drops the reversed-white treatment — it resolves to
  // `text-brand-secondary-default`, so the labels would read teal (or red under
  // `.theme-retro-red`), not the black Figma draws. No `Button` variant maps to
  // `text-primary-default`, and a `className` arbitrary utility would tie on
  // specificity with the variant's own text color (sheet order picks the winner).
  // An inline style is deterministic, still token-only, and reaches the <button>
  // through Button's `...rest`. `bg-current` carries it to the masked icon.
  // Undefined in classic, so React emits no style attribute there.
  const trailingStyle = retro
    ? { color: 'var(--color-text-primary-default)' }
    : undefined;
  const loadingTrackClass = retro
    ? 'relative w-full h-[3px] overflow-hidden bg-[var(--color-red-200)]'
    : 'relative w-full h-[3px] overflow-hidden bg-white/20';
  const loadingBarClass = retro
    ? 'absolute top-0 left-0 h-full w-[40%] bg-[var(--color-bg-brand-primary-default)] rounded-wds-full'
    : 'absolute top-0 left-0 h-full w-[40%] bg-white rounded-wds-full';
  const resolvedLogoSrc =
    logoSrc ?? (retro ? '/images/wendys-retro-logo.svg' : '/images/wendys-wave-white.svg');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Default bag navigation — most screens just want to land on /order/bag.
  // Pass `onBag` explicitly if a screen needs custom behavior (e.g. clearing
  // a flow-local state before navigating).
  const handleBag = () => {
    if (onBag) onBag();
    else navigate('/order/bag');
  };

  const hasTrailingButtons = showPoints || showFind || showBag || !!trailingContent;

  const titleWeightClass = titleWeight === 'black' ? 'font-[800]' : 'font-semibold';

  return (
    <header className={`w-full ${headerBgClass} flex-shrink-0 sticky top-0 z-10`}>
      {/* Safe area padding — pushes content below the status bar/notch.
          Compact viewport: real OS draws the status bar, so honor the device's
          safe-area inset (notch in standalone PWA, 0 in mobile Safari). Framed
          viewport: clear the fake 54px StatusBar overlay drawn by DeviceFrame. */}
      <div
        style={{
          height: compact ? 'env(safe-area-inset-top)' : 54,
        }}
      />
      <div className="relative flex items-center px-wds-16 py-wds-4 h-[56px]">

        {/* Center title — absolutely positioned for true center alignment */}
        {titleMode === 'title' && titlePlacement === 'center' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className={`font-display text-[23px] leading-[32px] ${titleWeightClass} ${titleColorClass} m-0 truncate`}>
              {title}
            </h1>
          </div>
        )}

        {/* Leading slot */}
        {titleMode === 'logo' ? (
          <div className="flex items-center h-[40px]">
            <img
              src={resolvedLogoSrc}
              alt="Wendy's"
              className="h-[40px] w-auto"
            />
          </div>
        ) : showBackButton ? (
          <div className="flex items-center w-[32px] overflow-visible flex-shrink-0">
            <button
              className="flex items-center justify-center w-[48px] h-[48px] -ml-[8px] rounded-full bg-transparent border-none"
              onClick={handleBack}
              aria-label="Go back"
            >
              <span
                aria-hidden="true"
                className={backIconClass}
                style={{
                  maskImage: 'url(/icons/arrow-left.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: 'url(/icons/arrow-left.svg)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                }}
              />
            </button>
          </div>
        ) : null}

        {/* Left-aligned title — flows inline after back button */}
        {titleMode === 'title' && titlePlacement === 'left' && (
          <div className="flex items-center min-w-0 h-[32px] ml-wds-8">
            <h1 className={`font-display text-[23px] leading-[32px] ${titleWeightClass} ${titleColorClass} m-0 truncate`}>
              {title}
            </h1>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Trailing buttons slot — always right-aligned, 12px gap */}
        {hasTrailingButtons && (
          <div className="flex items-center gap-wds-12 flex-shrink-0">
            {showPoints && (
              pointsLoading ? (
                <div className="flex items-center gap-wds-8 h-[32px]">
                  <img src="/icons/rewards-simple.svg" alt="" aria-hidden="true" width={16} height={16} />
                  <div
                    className="h-[14px] w-[72px] rounded-wds-s overflow-hidden"
                    style={{ background: retro ? 'var(--color-red-200)' : 'rgba(255,255,255,0.2)' }}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        background: retro
                          ? 'linear-gradient(90deg, transparent 0%, var(--color-red-100) 50%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                  <style>{`
                    @keyframes shimmer {
                      0% { background-position: 200% 0; }
                      100% { background-position: -200% 0; }
                    }
                  `}</style>
                </div>
              ) : (
                <Button
                  variant={trailingVariant}
                  size="small"
                  noPadding
                  leftIcon="rewards-simple"
                  leftIconMultiColor
                  style={trailingStyle}
                  onClick={() => navigate('/earn')}
                >
                  {points.toLocaleString()} Points
                </Button>
              )
            )}
            {showFind && (
              <Button
                variant={trailingVariant}
                size="small"
                noPadding
                leftIcon="location-filled"
                style={trailingStyle}
                onClick={onFind}
              >
                Find
              </Button>
            )}
            {showBag && (
              <BagButton count={bagCount} onClick={handleBag} colorScheme={scheme} />
            )}
            {trailingContent}
          </div>
        )}
      </div>

      {/* Indeterminate linear loading bar */}
      {showLoadingBar && (
        <div className={loadingTrackClass}>
          <div
            className={loadingBarClass}
            style={{
              animation: 'topbar-loading 1.4s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes topbar-loading {
              0% { left: -40%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      )}
    </header>
  );
}
