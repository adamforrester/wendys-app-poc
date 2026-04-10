import './Spinner.css';

export interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 32, className = '' }: SpinnerProps) {
  return (
    <svg
      className={`wds-spinner ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="wds-spinner__track"
        cx="16"
        cy="16"
        r="13"
        strokeWidth="3"
        stroke="currentColor"
        opacity="0.2"
      />
      <circle
        className="wds-spinner__arc"
        cx="16"
        cy="16"
        r="13"
        strokeWidth="3"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}
