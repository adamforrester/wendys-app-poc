export interface StatusBarProps {
  /** Light text for dark/colored backgrounds, dark text for light backgrounds */
  mode?: 'light' | 'dark';
}

export function StatusBar({ mode = 'light' }: StatusBarProps) {
  const textColor = mode === 'light' ? 'text-white' : 'text-black';
  const fillColor = mode === 'light' ? 'white' : 'black';

  return (
    <div className="relative w-full h-[54px]">
      {/* Dynamic Island */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-black"
        style={{
          top: 10,
          width: 126,
          height: 37,
          borderRadius: 20,
        }}
      />

      {/* Time — top left, vertically centered with Dynamic Island */}
      <span
        className={`absolute ${textColor} z-10`}
        style={{
          top: 17,
          left: 30,
          fontSize: 17,
          fontWeight: 600,
          lineHeight: '22px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        9:41
      </span>

      {/* Indicators — top right, vertically centered with Dynamic Island */}
      <div
        className="absolute flex items-center gap-[6px] z-10"
        style={{ top: 21, right: 22 }}
      >
        {/* Cellular */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill={fillColor}>
          <rect x="0" y="7" width="3" height="5" rx="0.5" opacity="0.3" />
          <rect x="4" y="5" width="3" height="7" rx="0.5" opacity="0.3" />
          <rect x="8" y="3" width="3" height="9" rx="0.5" />
          <rect x="12" y="1" width="3" height="11" rx="0.5" />
          <rect x="16" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={fillColor}>
          <path d="M8.5 12a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" />
          <path d="M5.26 8.74a4.58 4.58 0 016.48 0l.82-.82a5.74 5.74 0 00-8.12 0l.82.82z" />
          <path d="M2.82 6.3a7.98 7.98 0 0111.36 0l.82-.82a9.14 9.14 0 00-13 0l.82.82z" />
          <path d="M.38 3.86a11.38 11.38 0 0116.24 0l.82-.82A12.54 12.54 0 00-.44 3.04l.82.82z" />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke={fillColor} strokeOpacity="0.35" />
          <path d="M25 4.5v4a2 2 0 000-4z" fill={fillColor} opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={fillColor} />
        </svg>
      </div>
    </div>
  );
}
