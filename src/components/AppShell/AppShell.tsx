import { Outlet } from 'react-router-dom';
import { BottomTabBar } from '../BottomTabBar/BottomTabBar';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';

export function AppShell() {
  const { flags } = useFeatureFlags();
  const variant = flags.bottomNavStyle;

  // Floating pill is shorter and floats above the bottom edge with the
  // page background showing through. The notch'd 'current' bar is taller
  // (120px including notch). Reserve breathing room accordingly.
  const mainPaddingBottom = variant === 'floating-pill' ? 96 : 130;

  return (
    <div className="relative h-full flex flex-col">
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: mainPaddingBottom }}>
        <Outlet />
      </main>
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 60 }}>
        <BottomTabBar variant={variant} />
      </div>
    </div>
  );
}
