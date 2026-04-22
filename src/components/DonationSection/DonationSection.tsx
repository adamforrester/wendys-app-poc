import { Checkbox, type CheckboxState } from '../Checkbox/Checkbox';

export interface DonationSectionProps {
  /** Whether the donation checkbox is checked */
  isChecked: boolean;
  /** Checkbox change handler */
  onChange: (checked: boolean) => void;
}

export function DonationSection({ isChecked, onChange }: DonationSectionProps) {
  return (
    <div className="px-wds-16" style={{ paddingTop: 16, paddingBottom: 16 }}>
      {/* DTFA logo + header row */}
      <div className="flex items-center" style={{ gap: 8, paddingBottom: 8 }}>
        <img
          src="/images/dtfa-logo.png"
          alt="Dave Thomas Foundation for Adoption"
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
        <div className="flex items-center" style={{ gap: 4 }}>
          <span
            className="font-display font-[800]"
            style={{
              fontSize: 16,
              lineHeight: '20px',
              color: 'var(--color-text-primary-default)',
            }}
          >
            Round Up &amp; Donate
          </span>
          <button
            className="flex items-center justify-center border-none bg-transparent"
            style={{ width: 24, height: 24, padding: 0 }}
            aria-label="Learn more about Round Up & Donate"
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 16,
                height: 16,
                backgroundColor: 'var(--color-icon-secondary-default)',
                maskImage: 'url(/icons/info-outline.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/info-outline.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          </button>
        </div>
      </div>

      {/* Checkbox row */}
      <div
        className="flex items-start"
        style={{ gap: 12, paddingTop: 4 }}
        role="group"
      >
        <div style={{ paddingTop: 2 }}>
          <Checkbox
            checked={isChecked ? 'selected' : 'unselected'}
            onChange={(state: CheckboxState) => onChange(state === 'selected')}
          />
        </div>
        <span
          className="font-body"
          style={{
            fontSize: 14,
            lineHeight: '20px',
            color: 'var(--color-text-primary-default)',
            flex: 1,
          }}
        >
          Yes, I want to round up my total and donate to this cause.
        </span>
      </div>
    </div>
  );
}
