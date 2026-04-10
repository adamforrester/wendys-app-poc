import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { BagButton } from './BagButton';
import { useBag } from '../../context/BagContext';

export type TitleMode = 'logo' | 'title';
export type TitlePlacement = 'center' | 'left';
export type TitleWeight = 'black' | 'semibold';

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
  logoSrc = '/images/wendys-wave-white.svg',
  title = '',
  titlePlacement = 'center',
  titleWeight = 'black',
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const hasTrailingButtons = showPoints || showFind || showBag || !!trailingContent;

  const titleWeightClass = titleWeight === 'black' ? 'font-[800]' : 'font-semibold';

  return (
    <header className="w-full bg-[var(--color-bg-brand-primary-default)] flex-shrink-0 sticky top-0 z-10">
      {/* Safe area padding — pushes content below the status bar/notch */}
      <div className="h-[54px]" />
      <div className="relative flex items-center px-wds-16 py-wds-4 h-[56px]">

        {/* Center title — absolutely positioned for true center alignment */}
        {titleMode === 'title' && titlePlacement === 'center' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className={`font-display text-[23px] leading-[32px] ${titleWeightClass} text-[var(--color-text-onbrand-default)] m-0 truncate`}>
              {title}
            </h1>
          </div>
        )}

        {/* Leading slot */}
        {titleMode === 'logo' ? (
          <div className="flex items-center h-[40px]">
            <img
              src={logoSrc}
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
                className="inline-block w-[24px] h-[24px] bg-[var(--color-icon-onbrand-default)]"
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
            <h1 className={`font-display text-[23px] leading-[32px] ${titleWeightClass} text-[var(--color-text-onbrand-default)] m-0 truncate`}>
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
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
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
                  variant="text-reversed"
                  size="small"
                  noPadding
                  leftIcon="rewards-simple"
                  leftIconMultiColor
                  onClick={() => navigate('/earn')}
                >
                  {points.toLocaleString()} Points
                </Button>
              )
            )}
            {showFind && (
              <Button
                variant="text-reversed"
                size="small"
                noPadding
                leftIcon="location-filled"
                onClick={onFind}
              >
                Find
              </Button>
            )}
            {showBag && (
              <BagButton count={bagCount} onClick={onBag} />
            )}
            {trailingContent}
          </div>
        )}
      </div>

      {/* Indeterminate linear loading bar */}
      {showLoadingBar && (
        <div className="relative w-full h-[3px] overflow-hidden bg-white/20">
          <div
            className="absolute top-0 left-0 h-full w-[40%] bg-white rounded-wds-full"
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
