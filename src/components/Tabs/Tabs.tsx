import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export type TabsType = 'fixed' | 'scrollable';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  iconMultiColor?: boolean;
}

export interface TabsProps {
  /** Fixed (equal-width) or Scrollable (content-width, horizontally scrollable) */
  type?: TabsType;
  /** Tab items */
  tabs: TabItem[];
  /** Currently active tab id */
  activeTab: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Accessible label for the tablist */
  'aria-label'?: string;
}

function TabIcon({ name, multiColor = false }: { name: string; multiColor?: boolean }) {
  if (multiColor) {
    return <img src={`/icons/${name}.svg`} alt="" aria-hidden="true" width={24} height={24} className="flex-shrink-0" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 inline-block"
      style={{
        width: 24, height: 24,
        backgroundColor: 'currentColor',
        maskImage: `url(/icons/${name}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
        WebkitMaskImage: `url(/icons/${name}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function Tabs({
  type = 'fixed',
  tabs,
  activeTab,
  onTabChange,
  'aria-label': ariaLabel,
}: TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view for scrollable type
  useEffect(() => {
    if (type === 'scrollable' && activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const tab = activeRef.current;
      const scrollLeft = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [activeTab, type]);

  const isFixed = type === 'fixed';

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
      <div
        ref={scrollRef}
        className={`flex ${isFixed ? '' : 'overflow-x-auto'}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        role="tablist"
        aria-label={ariaLabel}
      >
        {/* Hide scrollbar for webkit */}
        <style>{`
          [data-tabs-scroll]::-webkit-scrollbar { display: none; }
        `}</style>
        <div
          className={`flex ${isFixed ? 'w-full' : ''}`}
          data-tabs-scroll=""
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeRef : undefined}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-end border-none bg-transparent p-0"
                style={{
                  height: 48,
                  flex: isFixed ? '1 1 0' : '0 0 auto',
                  minWidth: isFixed ? 0 : undefined,
                  padding: '0 16px',
                }}
              >
                {/* Tab content */}
                <div className="flex items-center justify-center gap-wds-8" style={{ height: 20, marginBottom: 14, marginTop: 14 }}>
                  {tab.icon && <TabIcon name={tab.icon} multiColor={tab.iconMultiColor} />}
                  <span
                    className="font-display text-[16px] leading-[20px] font-bold whitespace-nowrap"
                    style={{ color: 'var(--color-text-primary-default)' }}
                  >
                    {tab.label}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 2, backgroundColor: 'var(--color-bg-brand-primary-default)' }}
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Bottom divider */}
      <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)' }} />
    </div>
  );
}
