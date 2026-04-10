export type HelperMessageType = 'helper' | 'error' | 'caution' | 'success';

export interface HelperMessageProps {
  /** Message type/severity */
  type?: HelperMessageType;
  /** Message text */
  children: string;
}

interface TypeTokens {
  text: string;
  weight: number;
  icon: string | null;
}

const typeConfig: Record<HelperMessageType, TypeTokens> = {
  helper: {
    text: 'var(--color-text-secondary-default)',
    weight: 400,
    icon: null,
  },
  error: {
    text: 'var(--color-text-validation-critical)',
    weight: 700,
    icon: 'alert-outline',
  },
  caution: {
    text: 'var(--color-text-validation-caution)',
    weight: 700,
    icon: 'alert-outline',
  },
  success: {
    text: 'var(--color-text-validation-positive)',
    weight: 700,
    icon: 'check',
  },
};

export function HelperMessage({
  type = 'helper',
  children,
}: HelperMessageProps) {
  const config = typeConfig[type];

  return (
    <div
      className="flex items-center gap-wds-4"
      style={{ color: config.text }}
    >
      {config.icon && (
        <span
          aria-hidden="true"
          className="inline-block bg-current flex-shrink-0"
          style={{
            width: 16, height: 16,
            maskImage: `url(/icons/${config.icon}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            WebkitMaskImage: `url(/icons/${config.icon}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
          }}
        />
      )}
      <span
        className="font-body text-[14px] leading-[20px]"
        style={{ fontWeight: config.weight }}
        role={type === 'error' ? 'alert' : undefined}
      >
        {children}
      </span>
    </div>
  );
}
