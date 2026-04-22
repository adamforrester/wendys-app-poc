export interface OrderSummaryLine {
  /** Line label (e.g., "Subtotal", "Tax") */
  label: string;
  /** Formatted value (e.g., "$10.89") */
  value: string;
  /** Color variant — default (primary), discount (red), or total (bold) */
  variant?: 'default' | 'discount' | 'total';
}

export interface OrderSummaryProps {
  /** Summary line items */
  lines: OrderSummaryLine[];
}

export function OrderSummary({ lines }: OrderSummaryProps) {
  return (
    <div className="flex flex-col px-wds-16" style={{ gap: 8 }}>
      {lines.map((line, i) => {
        const isTotal = line.variant === 'total';
        const isDiscount = line.variant === 'discount';

        return (
          <div
            key={`${line.label}-${i}`}
            className="flex items-center justify-between"
            style={{ minHeight: 24 }}
          >
            <span
              className={isTotal ? 'font-display' : 'font-body'}
              style={{
                fontSize: isTotal ? 18 : 16,
                lineHeight: '24px',
                fontWeight: isTotal ? 800 : 400,
                color: isDiscount
                  ? 'var(--color-text-validation-critical)'
                  : 'var(--color-text-primary-default)',
              }}
            >
              {line.label}
            </span>
            <span
              className={isTotal ? 'font-display' : 'font-body'}
              style={{
                fontSize: isTotal ? 18 : 16,
                lineHeight: '24px',
                fontWeight: isTotal ? 800 : isDiscount ? 700 : 400,
                color: isDiscount
                  ? 'var(--color-text-validation-critical)'
                  : 'var(--color-text-primary-default)',
              }}
            >
              {line.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
