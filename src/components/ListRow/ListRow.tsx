import { type ReactNode } from 'react';
import { Label, type LabelState } from '../Label/Label';
import { HelperMessage, type HelperMessageType } from '../HelperMessage/HelperMessage';
import { Checkbox, type CheckboxState } from '../Checkbox/Checkbox';
import { RadioButton, type RadioButtonType } from '../RadioButton/RadioButton';
import { Toggle } from '../Toggle/Toggle';

export type ListRowStyle = 'standard' | 'rounded';
export type ListRowValidation = 'none' | 'critical' | 'caution' | 'success';
export type ListRowLeading = 'none' | 'icon' | 'image';
export type ListRowSupportText = 'none' | '1-line' | '2-line';
export type ListRowTrailing = 'none' | 'checkbox' | 'icon' | 'switch' | 'radio';

export interface ListRowLabel {
  text: string;
  state?: LabelState;
  icon?: string;
}

export interface ListRowProps {
  /** Standard (full-width, divider) or Rounded (bordered, padded) */
  style?: ListRowStyle;
  /** Validation state — affects border color on rounded, shows helper message */
  validation?: ListRowValidation;
  /** Leading element type */
  leading?: ListRowLeading;
  /** Icon name for leading icon (24px) */
  leadingIcon?: string;
  /** Color override for leading icon (default: icon/secondary) */
  leadingIconColor?: string;
  /** Whether the leading icon is multi-color (renders as img, not mask) */
  leadingIconMultiColor?: boolean;
  /** Image src for leading image (56px) */
  leadingImage?: string;
  /** Overline text above headline */
  overline?: string;
  /** Headline text (required) */
  headline: string;
  /** Support text below headline */
  supportText?: string;
  /** Support text variant — 1-line truncates, 2-line wraps */
  supportTextLines?: '1' | '2+';
  /** Metadata text in trailing area (e.g., price, count) */
  metadata?: string;
  /** Show/hide metadata */
  showMetadata?: boolean;
  /** Metadata text color override */
  metadataColor?: string;
  /** Metadata font weight override (default: 400) */
  metadataWeight?: number;
  /** Trailing element type */
  trailing?: ListRowTrailing;
  /** Trailing icon name (default: caret-right) */
  trailingIcon?: string;
  /** Checkbox state (when trailing=checkbox) */
  checkboxState?: CheckboxState;
  /** Checkbox change handler */
  onCheckboxChange?: (state: CheckboxState) => void;
  /** Radio button type */
  radioType?: RadioButtonType;
  /** Radio selected state */
  radioSelected?: boolean;
  /** Radio change handler */
  onRadioChange?: (selected: boolean) => void;
  /** Toggle checked state */
  toggleChecked?: boolean;
  /** Toggle icon visibility */
  toggleShowIcon?: boolean;
  /** Toggle change handler */
  onToggleChange?: (checked: boolean) => void;
  /** Labels to display below text content */
  labels?: ListRowLabel[];
  /** Helper message text (shown below row in rounded style) */
  helperMessage?: string;
  /** Show bottom divider (standard style only) */
  showDivider?: boolean;
  /** Tap handler for the entire row */
  onPress?: () => void;
  /** Additional content below the row */
  children?: ReactNode;
}

/* ── Validation → border/helper mapping ── */
const validationBorderTokens: Record<ListRowValidation, string> = {
  none: 'var(--color-border-secondary-default)',
  critical: 'var(--color-border-validation-critical)',
  caution: 'var(--color-border-validation-caution)',
  success: 'var(--color-border-validation-positive)',
};

const validationHelperType: Record<ListRowValidation, HelperMessageType> = {
  none: 'helper',
  critical: 'error',
  caution: 'caution',
  success: 'success',
};

/* ── Mono icon helper ── */
function MonoIcon({ name, size = 40, color = 'var(--color-icon-secondary-default)' }: { name: string; size?: number; color?: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block flex-shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: color,
        maskImage: `url(/icons/${name}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function ListRow({
  style = 'standard',
  validation = 'none',
  leading = 'none',
  leadingIcon = 'FPO-default-icon',
  leadingIconColor,
  leadingIconMultiColor = false,
  leadingImage,
  overline,
  headline,
  supportText,
  supportTextLines = '1',
  metadata,
  showMetadata = true,
  metadataColor,
  metadataWeight,
  trailing = 'none',
  trailingIcon = 'caret-right',
  checkboxState = 'unselected',
  onCheckboxChange,
  radioType = 'checked',
  radioSelected = false,
  onRadioChange,
  toggleChecked = false,
  toggleShowIcon = false,
  onToggleChange,
  labels,
  helperMessage,
  showDivider = true,
  onPress,
}: ListRowProps) {
  const isRounded = style === 'rounded';
  const hasLeading = leading !== 'none';
  const hasImage = leading === 'image';
  const hasSupportText = !!supportText;
  const hasLabels = labels && labels.length > 0;
  const showHelperMessage = (isRounded && validation !== 'none') || !!helperMessage;
  const helperText = helperMessage || 'This is a helper message.';
  const helperType = validation !== 'none' ? validationHelperType[validation] : 'helper';

  /* ── Leading element ── */
  const renderLeading = () => {
    if (leading === 'icon') {
      if (leadingIconMultiColor) {
        return (
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24 }}>
            <img src={`/icons/${leadingIcon}.svg`} alt="" aria-hidden="true" style={{ width: 24, height: 24 }} />
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24 }}>
          <MonoIcon name={leadingIcon} size={24} color={leadingIconColor || 'var(--color-icon-secondary-default)'} />
        </div>
      );
    }
    if (leading === 'image' && leadingImage) {
      return (
        <div className="flex-shrink-0 rounded-wds-m overflow-hidden" style={{ width: 56, height: 56 }}>
          <img src={leadingImage} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    return null;
  };

  /* ── Trailing element ── */
  const renderTrailing = () => {
    const trailingItems: ReactNode[] = [];

    if (showMetadata && metadata) {
      trailingItems.push(
        <span key="meta" className="font-body text-[12px] leading-[16px]" style={{ color: metadataColor || 'var(--color-text-secondary-default)', fontWeight: metadataWeight }}>
          {metadata}
        </span>
      );
    }

    if (trailing === 'icon') {
      trailingItems.push(
        <MonoIcon key="icon" name={trailingIcon} size={16} />
      );
    } else if (trailing === 'checkbox') {
      trailingItems.push(
        <div key="cb" className="flex items-center justify-center" style={{ width: 48, height: 48, margin: '-12px -12px -12px 0' }}>
          <Checkbox checked={checkboxState} onChange={onCheckboxChange} />
        </div>
      );
    } else if (trailing === 'radio') {
      trailingItems.push(
        <div key="rb" className="flex items-center justify-center" style={{ width: 48, height: 48, margin: '-12px -12px -12px 0' }}>
          <RadioButton type={radioType} selected={radioSelected} onChange={onRadioChange} />
        </div>
      );
    } else if (trailing === 'switch') {
      trailingItems.push(
        <Toggle key="toggle" checked={toggleChecked} showIcon={toggleShowIcon} onChange={onToggleChange} />
      );
    }

    if (trailingItems.length === 0) return null;

    return (
      <div className="flex items-center gap-wds-8 flex-shrink-0 relative">
        {trailingItems}
      </div>
    );
  };

  /* ── State layer (the main row content) ── */
  const stateLayerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-primary-default)',
    minHeight: hasImage ? 72 : 56,
    padding: '0 16px',
    ...(isRounded ? {
      borderRadius: 8,
      border: `1px solid ${validationBorderTokens[validation]}`,
    } : {}),
  };

  const Container = onPress ? 'button' : 'div';
  const interactiveProps = onPress
    ? { onClick: onPress, type: 'button' as const }
    : {};

  const rowContent = (
    <Container
      className="flex items-center gap-wds-16 w-full"
      style={{
        ...stateLayerStyle,
        ...(onPress ? { background: 'none', font: 'inherit', textAlign: 'left' as const } : {}),
      }}
      {...interactiveProps}
    >
      {/* Leading */}
      {hasLeading && renderLeading()}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ padding: '8px 0', minHeight: 40 }}>
        {/* Text content */}
        <div className="flex flex-col">
          {overline && (
            <span className="font-body text-[12px] leading-[16px] truncate" style={{ color: 'var(--color-text-secondary-default)', letterSpacing: '-0.06px' }}>
              {overline}
            </span>
          )}
          <span className="font-display text-[16px] leading-[20px] font-semibold" style={{ color: 'var(--color-text-primary-default)' }}>
            {headline}
          </span>
          {hasSupportText && (
            <span
              className={`font-body text-[14px] leading-[20px] ${supportTextLines === '1' ? 'truncate' : 'line-clamp-3'}`}
              style={{ color: 'var(--color-text-secondary-default)' }}
            >
              {supportText}
            </span>
          )}
        </div>

        {/* Labels */}
        {hasLabels && (
          <div className="flex flex-wrap gap-wds-8 pt-wds-4">
            {labels!.map((label, i) => (
              <Label key={i} state={label.state || 'secondary'} icon={label.icon}>
                {label.text}
              </Label>
            ))}
          </div>
        )}
      </div>

      {/* Trailing */}
      {renderTrailing()}
    </Container>
  );

  /* ── Root wrapper ── */
  if (isRounded) {
    return (
      <div className="px-wds-16 pb-wds-8" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rowContent}
        {showHelperMessage && (
          <div className="px-wds-16">
            <HelperMessage type={helperType}>{helperText}</HelperMessage>
          </div>
        )}
      </div>
    );
  }

  // Standard style
  return (
    <div className="relative w-full">
      {rowContent}
      {showHelperMessage && (
        <div className="px-wds-16 py-wds-4">
          <HelperMessage type={helperType}>{helperText}</HelperMessage>
        </div>
      )}
      {showDivider && (
        <div className="absolute bottom-0 left-0 right-0 px-wds-16">
          <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)' }} />
        </div>
      )}
    </div>
  );
}
