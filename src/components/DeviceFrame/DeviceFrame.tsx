import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { useStatusBarModeValue } from '../../context/StatusBarModeContext';
import { useCompactViewport } from '../../hooks/useCompactViewport';

export interface DeviceFrameProps {
  children: ReactNode;
  /**
   * Status bar text color — 'light' for dark/colored backgrounds, 'dark'
   * for light backgrounds. When omitted, reads from `StatusBarModeContext`
   * so individual screens can flip the tint via `useStatusBarMode('dark')`.
   * Only applies when the frame is rendered (viewport > 430px).
   */
  statusBarMode?: 'light' | 'dark';
}

export function DeviceFrame({ children, statusBarMode }: DeviceFrameProps) {
  const contextMode = useStatusBarModeValue();
  const mode = statusBarMode ?? contextMode;
  const compact = useCompactViewport();

  if (compact) {
    // Real device / PWA: fill the viewport, let the OS draw the only status
    // bar. TopAppBar's spacer switches to env(safe-area-inset-top) at this
    // width so content clears the notch in standalone mode and sits flush in
    // mobile Safari.
    return (
      <div className="h-[100dvh] flex flex-col bg-wds-bg-primary overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e5e5e5]">
      <div
        className="relative bg-wds-bg-primary overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          boxShadow: '0 0 0 8px #1a1a1a, 0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Status bar overlay — renders on top of everything */}
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
          <StatusBar mode={mode} />
        </div>

        {/* App content — full height, TopAppBar includes safe area padding */}
        <div className="h-full overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
