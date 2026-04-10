export interface NutritionRow {
  label: string;
  value: string;
  /** Indented sub-item (e.g., Saturated Fat under Total Fat) */
  indent?: boolean;
}

export interface IngredientTableProps {
  /** Rows of nutrition data */
  rows: NutritionRow[];
}

export function IngredientTable({ rows }: IngredientTableProps) {
  return (
    <div style={{ width: '100%' }}>
      {rows.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          className="flex items-center justify-between"
          style={{
            height: 32,
            paddingLeft: row.indent ? 40 : 0,
            borderBottom: i < rows.length - 1 ? '1px solid var(--color-border-tertiary-default)' : 'none',
          }}
        >
          <span
            className="font-body text-[14px] leading-[20px]"
            style={{ color: 'var(--color-text-primary-default)' }}
          >
            {row.label}
          </span>
          <span
            className="font-body text-[14px] leading-[20px]"
            style={{ color: 'var(--color-text-secondary-default)' }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
