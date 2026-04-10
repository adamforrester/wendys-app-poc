import { haptics } from '../../animations/haptics';

export interface OrderBarProps {
  /** Current quantity */
  quantity: number;
  /** Min quantity (default 1) */
  minQuantity?: number;
  /** Max quantity (default 99) */
  maxQuantity?: number;
  /** Quantity change handler */
  onQuantityChange: (quantity: number) => void;
  /** Add to bag handler */
  onAddToBag: () => void;
  /** Disabled state — disables the Add button */
  disabled?: boolean;
  /** Custom add button label (default "Add") */
  addLabel?: string;
}

export function OrderBar({
  quantity,
  minQuantity = 1,
  maxQuantity = 99,
  onQuantityChange,
  onAddToBag,
  disabled = false,
  addLabel = 'Add',
}: OrderBarProps) {
  const atMin = quantity <= minQuantity;
  const atMax = quantity >= maxQuantity;

  const handleDecrement = () => {
    if (!atMin) {
      haptics.light();
      onQuantityChange(Math.max(minQuantity, quantity - 1));
    }
  };

  const handleIncrement = () => {
    if (!atMax) {
      haptics.light();
      onQuantityChange(Math.min(maxQuantity, quantity + 1));
    }
  };

  const handleAdd = () => {
    if (!disabled) {
      haptics.success();
      onAddToBag();
    }
  };

  const counterIconColor = (isDisabled: boolean) =>
    isDisabled ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-brand-secondary-default)';

  return (
    <div
      style={{
        width: '100%',
        padding: '0 16px 32px 16px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* Floating pill bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 358,
          height: 56,
          borderRadius: 9999,
          backgroundColor: 'var(--color-bg-primary-default)',
          boxShadow: 'var(--onlight-m)',
          paddingLeft: 8,
          gap: 16,
        }}
      >
        {/* Counter section */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 24, justifyContent: 'center' }}>
          {/* Minus */}
          <button
            className="flex items-center justify-center border-none bg-transparent p-0"
            style={{ width: 48, height: 48 }}
            disabled={atMin}
            onClick={handleDecrement}
            aria-label="Decrease quantity"
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 32, height: 32,
                backgroundColor: counterIconColor(atMin),
                maskImage: 'url(/icons/minus.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/minus.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </button>

          {/* Count */}
          <span
            className="font-display text-center"
            style={{
              fontSize: 20,
              lineHeight: '24px',
              fontWeight: 800,
              color: 'var(--color-text-primary-default)',
              minWidth: 24,
            }}
          >
            {quantity}
          </span>

          {/* Plus */}
          <button
            className="flex items-center justify-center border-none bg-transparent p-0"
            style={{ width: 48, height: 48 }}
            disabled={atMax}
            onClick={handleIncrement}
            aria-label="Increase quantity"
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 32, height: 32,
                backgroundColor: counterIconColor(atMax),
                maskImage: 'url(/icons/add.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/add.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </button>
        </div>

        {/* Add to Bag button */}
        <button
          className="flex items-center justify-center border-none"
          style={{
            height: 56,
            minWidth: 160,
            borderRadius: 9999,
            backgroundColor: disabled ? 'var(--color-bg-disabled-default)' : 'var(--color-bg-brand-secondary-default)',
            padding: '12px 16px',
            gap: 8,
            flexShrink: 0,
          }}
          disabled={disabled}
          onClick={handleAdd}
        >
          <span
            className="font-display"
            style={{
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 700,
              color: disabled ? 'var(--color-text-disabled-ondisabled)' : 'var(--color-text-onbrand-default)',
            }}
          >
            {addLabel}
          </span>
          <img
            src="/icons/bag-light.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            style={{ opacity: disabled ? 0.4 : 1 }}
          />
        </button>
      </div>
    </div>
  );
}
