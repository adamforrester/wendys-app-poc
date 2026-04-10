export interface BagButtonProps {
  count: number;
  onClick?: () => void;
}

export function BagButton({ count, onClick }: BagButtonProps) {
  if (count === 0) return null;

  return (
    <button
      className="flex items-center h-[32px] px-wds-8 rounded-wds-full bg-[var(--color-bg-onbrand-default)] gap-0 border-none"
      onClick={onClick}
      aria-label={`Bag, ${count} items`}
    >
      <img
        src="/images/bag-red.svg"
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
      />
      <span className="font-body text-[12px] leading-[16px] font-black text-[var(--color-text-brand-primary-default)]">
        {count > 9 ? '9+' : count}
      </span>
    </button>
  );
}
