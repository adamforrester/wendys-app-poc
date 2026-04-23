export interface OrderSummaryLine {
  /** Line label (e.g., "Subtotal", "Tax") */
  label: string;
  /** Formatted value (e.g., "$10.89") */
  value: string;
  /** Color variant — default (primary), discount (green), or total (bold) */
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

        const color = isDiscount
          ? 'var(--color-text-validation-positive)'
          : 'var(--color-text-primary-default)';

        return (
          <div
            key={`${line.label}-${i}`}
            className="flex items-center justify-between"
            style={{ minHeight: 24 }}
          >
            {/* Label — always bold, total uses display font */}
            <span
              className={isTotal ? 'font-display' : 'font-body'}
              style={{
                fontSize: isTotal ? 18 : 14,
                lineHeight: '20px',
                fontWeight: 700,
                color,
              }}
            >
              {line.label}
            </span>
            {/* Value — regular weight except total (bold) */}
            <span
              className={isTotal ? 'font-display' : 'font-body'}
              style={{
                fontSize: isTotal ? 18 : 14,
                lineHeight: '20px',
                fontWeight: isTotal ? 700 : 400,
                color,
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
