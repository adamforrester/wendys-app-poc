import type { TopAppBarColorScheme } from './TopAppBar';

export interface BagButtonProps {
  count: number;
  onClick?: () => void;
  /**
   * Classic is a white pill with the red bag and a red count. Retro inverts
   * it — red pill, light bag, white count — per Figma's `onBrand-primary`
   * Bag Button variant, which is what reads correctly on the yellow bar.
   */
  colorScheme?: TopAppBarColorScheme;
}

export function BagButton({ count, onClick, colorScheme = 'classic' }: BagButtonProps) {
  if (count === 0) return null;

  const retro = colorScheme === 'retro';

  // Full static class strings — Tailwind v4's scanner can't resolve
  // interpolated segments.
  const pillClass = retro
    ? 'flex items-center h-[32px] px-wds-8 rounded-wds-full bg-[var(--color-bg-brand-primary-default)] gap-0 border-none'
    : 'flex items-center h-[32px] px-wds-8 rounded-wds-full bg-[var(--color-bg-onbrand-default)] gap-0 border-none';

  const countClass = retro
    ? 'font-body text-[12px] leading-[16px] font-black text-[var(--color-text-onbrand-default)]'
    : 'font-body text-[12px] leading-[16px] font-black text-[var(--color-text-brand-primary-default)]';

  return (
    <button
      className={pillClass}
      onClick={onClick}
      aria-label={`Bag, ${count} items`}
    >
      <img
        src={retro ? '/icons/bag-light.svg' : '/images/bag-red.svg'}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
      />
      <span className={countClass}>
        {count > 9 ? '9+' : count}
      </span>
    </button>
  );
}
