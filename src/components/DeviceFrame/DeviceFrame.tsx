import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';

export interface DeviceFrameProps {
  children: ReactNode;
  /** Status bar text color — 'light' for dark/colored backgrounds, 'dark' for light backgrounds */
  statusBarMode?: 'light' | 'dark';
}

export function DeviceFrame({ children, statusBarMode = 'light' }: DeviceFrameProps) {
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
          <StatusBar mode={statusBarMode} />
        </div>

        {/* App content — full height, TopAppBar includes safe area padding */}
        <div className="h-full overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
