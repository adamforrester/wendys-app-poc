import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export type BottomTabBarVariant = 'current' | 'simple';

interface TabDef {
  to: string;
  label: string;
  /** Base icon name for filled/outline variants, OR object for custom active/inactive */
  icon: string | { active: string; inactive: string };
  isCenter?: boolean;
  /** Render as multi-color img instead of masked mono icon */
  multiColor?: boolean;
}

const authTabs: TabDef[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/offers', label: 'Offers', icon: { active: 'letter-mark-coin-filled', inactive: 'letter-mark-coin-outlined' }, multiColor: true },
  { to: '/order', label: 'Order', icon: 'burger', isCenter: true },
  { to: '/earn', label: 'Earn', icon: { active: 'qr-code-scanner', inactive: 'qr-code-scanner' } },
  { to: '/account', label: 'Account', icon: 'settings' },
];

const unauthTabs: TabDef[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/offers', label: 'Offers', icon: { active: 'letter-mark-coin-filled', inactive: 'letter-mark-coin-outlined' }, multiColor: true },
  { to: '/order', label: 'Order', icon: 'burger', isCenter: true },
  { to: '/earn', label: 'Find', icon: 'location' },
  { to: '/account', label: 'Account', icon: 'settings' },
];

/* ── Resolve icon src from TabDef ── */
function resolveIconSrc(icon: string | { active: string; inactive: string }, active: boolean): string {
  if (typeof icon === 'object') {
    return `/icons/${active ? icon.active : icon.inactive}.svg`;
  }
  const variant = active ? 'filled' : 'outline';
  return `/icons/${icon}-${variant}.svg`;
}

/* ── Generic tab icon renderer ── */
function renderTabIcon(tab: TabDef, active: boolean, size = 24) {
  const src = resolveIconSrc(tab.icon, active);
  const iconColor = active
    ? 'var(--color-icon-brand-secondary-default)'
    : 'var(--color-icon-disabled-default)';

  if (tab.multiColor) {
    // Render multi-color icons as masked spans so they pick up the correct color
    return (
      <span
        aria-hidden="true"
        className="inline-block"
        style={{
          width: size, height: size,
          backgroundColor: iconColor,
          maskImage: `url(${src})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
          WebkitMaskImage: `url(${src})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block"
      style={{
        width: size,
        height: size,
        backgroundColor: iconColor,
        maskImage: `url(${src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

/* ══════════════════════════════════════
   Current Wendy's nav bar (custom)
   ══════════════════════════════════════ */

function CurrentNavBar() {
  const { state: authState } = useAuth();
  const location = useLocation();
  const tabs = authState.isAuthenticated ? authTabs : unauthTabs;

  const sideTabs = tabs.filter(t => !t.isCenter);
  const centerTab = tabs.find(t => t.isCenter)!;
  const leftTabs = sideTabs.slice(0, 2);
  const rightTabs = sideTabs.slice(2);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav
      className="relative flex-shrink-0"
      style={{ height: 120, zIndex: 60 }}
      role="tablist"
      aria-label="Main navigation"
    >
      {/* White bar background with notch cutout — always present */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px]">
        <svg
          viewBox="0 0 390 100"
          fill="none"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="nav-shadow" x="-10" y="-10" width="410" height="120" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="-2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>
          <path
            d="M0,20 L155,20 Q158,20 160,18 Q170,0 195,0 Q220,0 230,18 Q232,20 235,20 L390,20 L390,100 L0,100 Z"
            fill="var(--color-bg-primary-default)"
            filter="url(#nav-shadow)"
          />
        </svg>
      </div>

      {/* Tab segments row */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-start justify-between px-wds-16"
        style={{ height: 100, paddingTop: 24, paddingBottom: 34 }}
      >
        {leftTabs.map((tab) => {
          const active = isActive(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              role="tab"
              end={tab.to === '/'}
              className={`flex flex-col items-center gap-wds-4 w-[48px] no-underline ${
                active
                  ? 'text-[var(--color-text-brand-secondary-default)]'
                  : 'text-[var(--color-text-secondary-default)]'
              }`}
              aria-selected={active}
            >
              <div className="flex items-center justify-center w-[48px] h-[32px]">
                {renderTabIcon(tab, active)}
              </div>
              <span
                className={`text-[12px] leading-[16px] text-center ${
                  active ? 'font-black' : 'font-normal'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}

        {/* Center spacer */}
        <div className="w-[72px]" />

        {rightTabs.map((tab) => {
          const active = isActive(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              role="tab"
              end={tab.to === '/'}
              className={`flex flex-col items-center gap-wds-4 w-[48px] no-underline ${
                active
                  ? 'text-[var(--color-text-brand-secondary-default)]'
                  : 'text-[var(--color-text-secondary-default)]'
              }`}
              aria-selected={active}
            >
              <div className="flex items-center justify-center w-[48px] h-[32px]">
                {renderTabIcon(tab, active)}
              </div>
              <span
                className={`text-[12px] leading-[16px] text-center ${
                  active ? 'font-black' : 'font-normal'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Center Order button — appearance depends on which tab is active */}
      {(() => {
        const orderActive = isActive(centerTab.to);
        const homeActive = isActive('/');
        const showBigButton = homeActive;

        if (showBigButton) {
          // Home tab active → big teal circle
          return (
            <NavLink
              to={centerTab.to}
              role="tab"
              className="absolute left-1/2 -translate-x-1/2 no-underline"
              style={{ top: 10 }}
              aria-selected={false}
              aria-label="Order"
            >
              <div className="flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full bg-[var(--color-bg-brand-secondary-default)]" style={{ paddingTop: 8, paddingBottom: 8 }}>
                <span
                  aria-hidden="true"
                  className="inline-block bg-[var(--color-icon-onbrand-default)]"
                  style={{
                    width: 40, height: 40,
                    maskImage: 'url(/icons/burger-filled.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                    WebkitMaskImage: 'url(/icons/burger-filled.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                  }}
                />
                <span className="text-[12px] leading-[16px] text-[var(--color-text-onbrand-default)]" style={{ fontFamily: 'var(--font-body)' }}>
                  Order
                </span>
              </div>
            </NavLink>
          );
        }

        // Non-home tabs → inline icon (teal if Order active, gray otherwise)
        const iconColor = orderActive
          ? 'text-[var(--color-icon-brand-secondary-default)]'
          : 'text-[var(--color-icon-disabled-default)]';
        const textColor = orderActive
          ? 'text-[var(--color-text-brand-secondary-default)] font-black'
          : 'text-[var(--color-text-secondary-default)] font-normal';

        return (
          <NavLink
            to={centerTab.to}
            role="tab"
            className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-wds-4 w-[48px] no-underline ${iconColor}`}
            style={{ bottom: 38 }}
            aria-selected={orderActive}
          >
            <div className="flex items-center justify-center w-[48px] h-[32px]">
              <span
                aria-hidden="true"
                className="inline-block bg-current"
                style={{
                  width: 24, height: 24,
                  maskImage: `url(/icons/burger-${orderActive ? 'filled' : 'outline'}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                  WebkitMaskImage: `url(/icons/burger-${orderActive ? 'filled' : 'outline'}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                }}
              />
            </div>
            <span className={`text-[12px] leading-[16px] text-center ${textColor}`} style={{ fontFamily: 'var(--font-body)' }}>
              Order
            </span>
          </NavLink>
        );
      })()}
    </nav>
  );
}

/* ══════════════════════════════════════
   Simple nav bar (future experiment)
   ══════════════════════════════════════ */

function SimpleNavBar() {
  const { state: authState } = useAuth();
  const tabs = authState.isAuthenticated ? authTabs : unauthTabs;

  return (
    <nav
      className="flex items-center justify-around bg-wds-bg-primary border-t border-wds-border-tertiary flex-shrink-0"
      style={{ height: 83, paddingBottom: 34, zIndex: 60 }}
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          role="tab"
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-[2px] pt-wds-8 px-wds-12 no-underline transition-colors ${
              isActive
                ? 'text-[var(--color-text-brand-secondary-default)]'
                : 'text-[var(--color-text-secondary-default)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {renderTabIcon(tab, isActive)}
              <span
                className={`text-[11px] leading-[16px] ${isActive ? 'font-black' : 'font-normal'}`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/* ── Exported component ── */

interface BottomTabBarProps {
  variant?: BottomTabBarVariant;
}

export function BottomTabBar({ variant = 'current' }: BottomTabBarProps) {
  return variant === 'current' ? <CurrentNavBar /> : <SimpleNavBar />;
}
