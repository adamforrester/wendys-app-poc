import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { Tabs } from '../../components/Tabs/Tabs';
import { MenuCard } from '../../components/MenuCard/MenuCard';
import { useMenuData } from '../../hooks/useMenuData';
import { useLocationData } from '../../hooks/useLocationData';
import { useUserData } from '../../hooks/useUserData';
import { useDaypart } from '../../context/DaypartContext';

interface TabDef {
  id: string;
  label: string;
  slug: string;
}

/** Lunch/Dinner/Late Night tabs (production app order) */
const allDayTabs: TabDef[] = [
  { id: 'combos', label: 'Combos', slug: 'combos' },
  { id: 'hamburgers', label: 'Hamburgers', slug: 'hamburgers' },
  { id: 'chicken-nuggets-more', label: 'Chicken, Nuggets & More', slug: 'chicken-nuggets-more' },
  { id: 'tenders', label: 'Tenders', slug: 'tenders' },
  { id: 'fresh-made-salads', label: 'Fresh-Made Salads', slug: 'fresh-made-salads' },
  { id: 'fries-sides', label: 'Fries & Sides', slug: 'fries-sides' },
  { id: 'coffee', label: 'Coffee', slug: 'coffee' },
  { id: 'beverages', label: 'Beverages', slug: 'beverages' },
  { id: 'frosty', label: 'Frosty\u00AE', slug: 'frosty' },
  { id: 'bakery', label: 'Bakery', slug: 'bakery' },
  { id: 'wendy-s-kids-meal', label: "Wendy's Kids' Meal\u00AE", slug: 'wendy-s-kids-meal' },
  { id: 'everyday-value', label: 'Everyday Value', slug: 'everyday-value' },
  { id: 'biggie-deals', label: 'Biggie Deals\u00AE', slug: 'biggie-deals' },
];

/** Breakfast tabs */
const breakfastTabs: TabDef[] = [
  { id: 'breakfast-combos', label: 'Breakfast Combos', slug: 'breakfast-combos' },
  { id: 'croissants', label: 'Croissants', slug: 'croissants' },
  { id: 'biscuits', label: 'Biscuits', slug: 'biscuits' },
  { id: 'classics', label: 'Classics', slug: 'classics' },
  { id: 'breakfast-burrito', label: 'Breakfast Burrito', slug: 'breakfast-burrito' },
  { id: 'sides-and-sweets', label: 'Sides and Sweets', slug: 'sides-and-sweets' },
  { id: 'breakfast-meal-deals', label: 'Breakfast Meal Deals', slug: 'breakfast-meal-deals' },
  { id: 'breakfast-biggie-deals', label: 'Breakfast Biggie Deals', slug: 'breakfast-biggie-deals' },
  { id: 'coffee', label: 'Coffee', slug: 'coffee' },
  { id: 'beverages', label: 'Beverages', slug: 'beverages' },
  { id: 'bakery', label: 'Bakery', slug: 'bakery' },
];

const SWIPE_THRESHOLD = 40;

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function formatCalories(cal: { min: number; max: number }): string {
  if (cal.min === cal.max) return `${cal.min.toLocaleString()} Cal`;
  return `${cal.min.toLocaleString()}/${cal.max.toLocaleString()} Cal`;
}

/** Custom hook: all listeners attached natively via ref for reliability */
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const decided = useRef(false);

  // Store callbacks in refs so the effect doesn't re-attach on every render
  const leftRef = useRef(onSwipeLeft);
  const rightRef = useRef(onSwipeRight);
  leftRef.current = onSwipeLeft;
  rightRef.current = onSwipeRight;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      startX.current = e.clientX;
      startY.current = e.clientY;
      tracking.current = true;
      decided.current = false;
    };

    const onMove = (e: PointerEvent) => {
      if (!tracking.current) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      if (!decided.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        if (Math.abs(dy) > Math.abs(dx)) {
          tracking.current = false;
          return;
        }
        decided.current = true;
      }

      if (decided.current && Math.abs(dx) > SWIPE_THRESHOLD) {
        tracking.current = false;
        if (dx < 0) leftRef.current();
        else rightRef.current();
      }
    };

    const onUp = () => {
      tracking.current = false;
      decided.current = false;
    };

    // Horizontal wheel/trackpad gesture support
    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let wheelDeltaX = 0;

    const onWheel = (e: WheelEvent) => {
      // Ignore vertical-dominant scrolls
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
      wheelDeltaX += e.deltaX;
      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (Math.abs(wheelDeltaX) > SWIPE_THRESHOLD) {
          if (wheelDeltaX > 0) leftRef.current();  // scroll right → next
          else rightRef.current();                   // scroll left → prev
        }
        wheelDeltaX = 0;
      }, 100);
    };

    // Capture phase on container ensures we see the event before children
    el.addEventListener('pointerdown', onDown, true);
    el.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown, true);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, []);

  return containerRef;
}

export function MenuProductListScreen() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { getProductsByCategory, getProductImagePath } = useMenuData();
  const { getLocationById, getFormattedAddress } = useLocationData();
  const { getFavoriteLocationId } = useUserData();
  const { state: daypartState } = useDaypart();

  const isBreakfast = daypartState.daypart === 'breakfast';
  const categoryTabs = isBreakfast ? breakfastTabs : allDayTabs;

  const [activeTab, setActiveTab] = useState(slug || categoryTabs[0].id);
  const directionRef = useRef(1);

  // If the active tab doesn't exist in the current tab set (daypart switched), reset to first
  const activeIndex = categoryTabs.findIndex(c => c.id === activeTab);
  const validIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeCat = categoryTabs[validIndex];
  const products = activeCat ? getProductsByCategory(activeCat.slug) : [];

  // Reset tab when daypart changes and current tab is invalid
  useEffect(() => {
    if (activeIndex < 0) {
      setActiveTab(categoryTabs[0].id);
    }
  }, [activeIndex, categoryTabs]);

  const favoriteId = getFavoriteLocationId();
  const selectedLocation = getLocationById(favoriteId);
  const locationAddress = selectedLocation ? getFormattedAddress(selectedLocation) : '1234 Liberty Way';

  const goToTab = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(categoryTabs.length - 1, index));
    if (clamped !== validIndex) {
      directionRef.current = clamped > validIndex ? 1 : -1;
      setActiveTab(categoryTabs[clamped].id);
    }
  }, [validIndex, categoryTabs]);

  const handleTabChange = (tabId: string) => {
    const newIndex = categoryTabs.findIndex(c => c.id === tabId);
    directionRef.current = newIndex > validIndex ? 1 : -1;
    setActiveTab(tabId);
  };

  const swipeRef = useSwipe(
    useCallback(() => goToTab(validIndex + 1), [goToTab, validIndex]),
    useCallback(() => goToTab(validIndex - 1), [goToTab, validIndex]),
  );

  const contentVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
    active: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -80, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const } }),
  };

  return (
    <>
      <TopAppBar
        titleMode="title"
        title="Menu"
        titlePlacement="center"
        titleWeight="semibold"
        showBackButton
        onBack={() => navigate('/order/menu')}
        showBag
      />

      {/* Pickup Location card */}
      <div className="pt-wds-8">
        <ListRow
          style="rounded"
          overline="Pickup Location"
          headline={locationAddress}
          leading="icon"
          leadingIcon="wendys-location-3-filled"
          leadingIconColor="var(--color-icon-brand-primary-default)"
          trailing="none"
          metadata="Edit"
          metadataColor="var(--color-text-brand-secondary-default)"
          metadataWeight={700}
          showDivider={false}
          onPress={() => navigate('/order')}
        />
      </div>

      {/* Category tabs */}
      <Tabs
        type="scrollable"
        tabs={categoryTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        aria-label="Menu categories"
      />

      {/* Swipeable product grid */}
      <div
        ref={swipeRef}
        style={{ overflow: 'hidden', touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait" custom={directionRef.current}>
          <motion.div
            key={activeTab}
            custom={directionRef.current}
            variants={contentVariants}
            initial="enter"
            animate="active"
            exit="exit"
          >
            {products.length > 0 ? (
              <div
                className="px-wds-16 py-wds-16"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
              >
                {products.map((product) => (
                  <MenuCard
                    key={product.id}
                    title={product.name}
                    subtitle={formatPrice(product.isCombo && product.comboPrice ? product.comboPrice : product.price)}
                    caption={formatCalories(product.calories)}
                    imageSrc={getProductImagePath(product.image)}
                    onPress={() => navigate(`/order/menu/${activeTab}/${product.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ padding: '64px 16px', color: 'var(--color-text-secondary-default)' }}
              >
                <span className="font-body text-[16px] leading-[24px] text-center">
                  No items available in this category
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
