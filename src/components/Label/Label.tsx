export type LabelState = 'primary' | 'secondary' | 'critical' | 'success' | 'caution' | 'unavailable';

export interface LabelProps {
  /** Visual style/semantic state */
  state?: LabelState;
  /** Optional left icon name (from /icons/) */
  icon?: string;
  /** Multi-color icon (renders as img instead of mask) */
  iconMultiColor?: boolean;
  /** Docked to bottom of a card — flat bottom corners, full width */
  docked?: boolean;
  /** Label text */
  children: string;
}

interface StateTokens {
  bg: string;
  border: string;
  text: string;
}

const stateTokens: Record<LabelState, StateTokens> = {
  primary: {
    bg: 'var(--color-bg-brand-tertiary-default)',
    border: 'transparent',
    text: 'var(--color-text-onbrand-default)',
  },
  secondary: {
    bg: 'var(--color-bg-primary-default)',
    border: 'var(--color-border-primary-default)',
    text: 'var(--color-text-primary-default)',
  },
  critical: {
    bg: 'var(--color-bg-primary-default)',
    border: 'var(--color-border-validation-critical)',
    text: 'var(--color-text-validation-critical)',
  },
  success: {
    bg: 'var(--color-bg-primary-default)',
    border: 'var(--color-border-validation-positive)',
    text: 'var(--color-text-validation-positive)',
  },
  caution: {
    bg: 'var(--color-bg-primary-default)',
    border: 'var(--color-border-validation-caution)',
    text: 'var(--color-text-validation-caution)',
  },
  unavailable: {
    bg: 'var(--color-bg-secondary-default)',
    border: 'transparent',
    text: 'var(--color-text-validation-critical)',
  },
};

function LabelIcon({ name, size = 16, multiColor = false }: { name: string; size?: number; multiColor?: boolean }) {
  if (multiColor) {
    return <img src={`/icons/${name}.svg`} alt="" aria-hidden="true" width={size} height={size} className="flex-shrink-0" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 inline-block bg-current"
      style={{
        width: size, height: size,
        maskImage: `url(/icons/${name}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function Label({
  state = 'primary',
  icon,
  iconMultiColor = false,
  docked = false,
  children,
}: LabelProps) {
  const tokens = stateTokens[state];

  return (
    <span
      className={`inline-flex items-center gap-wds-4 font-body text-[12px] leading-[16px] font-black ${docked ? 'w-full justify-center' : ''}`}
      style={{
        height: 24,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: tokens.bg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: tokens.border,
        color: tokens.text,
        borderRadius: docked ? '0 0 8px 8px' : 8,
      }}
    >
      {icon && <LabelIcon name={icon} multiColor={iconMultiColor} />}
      {children}
    </span>
  );
}
