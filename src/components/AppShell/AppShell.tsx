import { Outlet } from 'react-router-dom';
import { BottomTabBar } from '../BottomTabBar/BottomTabBar';

export function AppShell() {
  return (
    <div className="relative h-full flex flex-col">
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 130 }}>
        <Outlet />
      </main>
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 60 }}>
        <BottomTabBar />
      </div>
    </div>
  );
}
