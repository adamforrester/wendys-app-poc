import { Checkbox } from '../Checkbox/Checkbox';

export type IngredientCardState = 'selected' | 'unselected' | 'required';

export interface IngredientCardProps {
  /** Ingredient name */
  name: string;
  /** Ingredient image */
  imageSrc: string;
  /** Card state */
  state?: IngredientCardState;
  /** Whether this ingredient can be edited (shows Edit CTA) */
  editable?: boolean;
  /** Checkbox toggle handler (selected/unselected) */
  onToggle?: () => void;
  /** Edit CTA handler (opens modifier bottom sheet) */
  onEdit?: () => void;
}

export function IngredientCard({
  name,
  imageSrc,
  state = 'selected',
  editable = false,
  onToggle,
  onEdit,
}: IngredientCardProps) {
  const isRequired = state === 'required';
  const isSelected = state === 'selected';
  const isUnselected = state === 'unselected';
  const showCheckbox = !isRequired;
  const showEdit = editable;

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        borderRadius: 8,
        border: '1px solid var(--color-border-secondary-default)',
        backgroundColor: isUnselected ? 'var(--color-bg-disabled-default)' : 'var(--color-bg-primary-default)',
      }}
    >
      {/* Checkbox — top right, absolutely positioned */}
      {showCheckbox && (
        <div className="absolute" style={{ top: 0, right: 0, zIndex: 1 }}>
          <Checkbox
            checked={isSelected ? 'selected' : 'unselected'}
            onChange={onToggle ? () => onToggle() : undefined}
          />
        </div>
      )}

      {/* Main content — tappable to toggle, fills available space */}
      <button
        className="flex flex-col items-center flex-1 border-none bg-transparent p-0"
        onClick={showCheckbox ? onToggle : undefined}
        style={{ minHeight: 0 }}
      >
        {/* Image area */}
        <div
          className="flex items-center justify-center"
          style={{ width: '100%', paddingTop: 24, paddingBottom: 4 }}
        >
          <img
            src={imageSrc}
            alt={name}
            style={{
              width: 88,
              height: 88,
              objectFit: 'contain',
              opacity: isUnselected ? 0.5 : 1,
              filter: isUnselected ? 'grayscale(40%)' : undefined,
              transition: 'opacity 0.15s, filter 0.15s',
            }}
          />
        </div>

        {/* Title */}
        <div style={{ padding: '0 8px 8px 8px', width: '100%' }}>
          <span
            className="font-display text-[14px] leading-[16px] font-bold text-center block truncate"
            style={{
              color: isUnselected ? 'var(--color-text-disabled-default)' : 'var(--color-text-primary-default)',
            }}
          >
            {name}
          </span>
        </div>
      </button>

      {/* Edit CTA — always renders to maintain consistent height, but invisible when not editable */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          height: showEdit ? 40 : 0,
          overflow: 'hidden',
        }}
      >
        {showEdit && (
          <button
            className="font-display text-[14px] leading-[20px] font-bold border-none bg-transparent underline"
            style={{
              color: isUnselected ? 'var(--color-text-disabled-default)' : 'var(--color-text-brand-secondary-default)',
              padding: '8px 16px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
