import { useEffect, useState } from 'react';

// Below this width the DeviceFrame chrome (rounded bezel, fake StatusBar) is
// dropped — the real viewport IS the device, and the OS draws the only status
// bar. Cutoff covers every iPhone width (iPhone 13/14 mini at 375 through
// Pro Max at 430).
const COMPACT_QUERY = '(max-width: 430px)';

export function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);
    const handler = (e: MediaQueryListEvent) => setCompact(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return compact;
}
