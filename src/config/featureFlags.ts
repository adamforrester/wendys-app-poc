/* ── Feature Flag Types ── */

export type AddToBagTransition = 'snackbar' | 'slide-to-bag' | 'full-screen-confirmation';
export type ComboBuilderStyle = 'bottom-sheet-wizard' | 'accordion';
export type LocationSelectionLayout = 'map-and-list' | 'list-only';
export type SplashAnimation = 'current' | 'variant-b';
export type MenuCategoryLayout = 'current' | 'variant-b';
export type MenuPLPLayout = 'current' | 'variant-b';
export type SPPLayout = 'current' | 'variant-b';
export type BottomNavStyle = 'current' | 'simple';
export type HomeLocationComponent = 'none' | 'card' | 'sticky-nav';
export type ButtonColorScheme = 'secondary' | 'primary';
export type FallbackImage = 'wave' | 'variant-b';
export type PostOrderSurprise = 'none' | 'confetti' | 'animation';
export type DarkMode = 'off' | 'on';
export type LoadingScenario = 'none' | 'slow-network' | 'error-state';

export interface FeatureFlags {
  addToBagTransition: AddToBagTransition;
  comboBuilderStyle: ComboBuilderStyle;
  locationSelectionLayout: LocationSelectionLayout;
  splashAnimation: SplashAnimation;
  menuCategoryLayout: MenuCategoryLayout;
  menuPLPLayout: MenuPLPLayout;
  sppLayout: SPPLayout;
  bottomNavStyle: BottomNavStyle;
  homeLocationComponent: HomeLocationComponent;
  buttonColorScheme: ButtonColorScheme;
  fallbackImage: FallbackImage;
  postOrderSurprise: PostOrderSurprise;
  darkMode: DarkMode;
  loadingScenario: LoadingScenario;
}

export const defaultFeatureFlags: FeatureFlags = {
  addToBagTransition: 'snackbar',
  comboBuilderStyle: 'bottom-sheet-wizard',
  locationSelectionLayout: 'map-and-list',
  splashAnimation: 'current',
  menuCategoryLayout: 'current',
  menuPLPLayout: 'current',
  sppLayout: 'current',
  bottomNavStyle: 'current',
  homeLocationComponent: 'none',
  buttonColorScheme: 'secondary',
  fallbackImage: 'wave',
  postOrderSurprise: 'none',
  darkMode: 'off',
  loadingScenario: 'none',
};

/* ── Flag Metadata (drives admin UI auto-generation) ── */

export interface FlagMeta {
  label: string;
  description: string;
  options: { value: string; label: string }[];
}

export const flagMeta: Record<keyof FeatureFlags, FlagMeta> = {
  addToBagTransition: {
    label: 'Add to Bag Transition',
    description: 'Animation style when adding items to the bag',
    options: [
      { value: 'snackbar', label: 'Snackbar' },
      { value: 'slide-to-bag', label: 'Slide to Bag' },
      { value: 'full-screen-confirmation', label: 'Full Screen' },
    ],
  },
  comboBuilderStyle: {
    label: 'Combo Builder Style',
    description: 'UI pattern for building combo meals',
    options: [
      { value: 'bottom-sheet-wizard', label: 'Bottom Sheet Wizard' },
      { value: 'accordion', label: 'Accordion' },
    ],
  },
  locationSelectionLayout: {
    label: 'Location Selection Layout',
    description: 'Layout for the order location screen',
    options: [
      { value: 'map-and-list', label: 'Map + List' },
      { value: 'list-only', label: 'List Only' },
    ],
  },
  splashAnimation: {
    label: 'Splash Animation',
    description: 'Splash screen animation variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
  },
  menuCategoryLayout: {
    label: 'Menu Category Layout',
    description: 'Category page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
  },
  menuPLPLayout: {
    label: 'Menu PLP Layout',
    description: 'Product listing page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
  },
  sppLayout: {
    label: 'SPP Layout',
    description: 'Single product page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
  },
  bottomNavStyle: {
    label: 'Bottom Nav Style',
    description: 'Bottom tab bar variant',
    options: [
      { value: 'current', label: 'Current (Notch)' },
      { value: 'simple', label: 'Simple (Flat)' },
    ],
  },
  homeLocationComponent: {
    label: 'Home Location Component',
    description: 'Location widget on the home screen',
    options: [
      { value: 'none', label: 'None' },
      { value: 'card', label: 'Card' },
      { value: 'sticky-nav', label: 'Sticky Nav (Starbucks)' },
    ],
  },
  buttonColorScheme: {
    label: 'Button Color Scheme',
    description: 'Default button color — teal (secondary) or red (primary)',
    options: [
      { value: 'secondary', label: 'Teal (Secondary)' },
      { value: 'primary', label: 'Red (Primary)' },
    ],
  },
  fallbackImage: {
    label: 'Fallback Image',
    description: 'Placeholder image when product images fail to load',
    options: [
      { value: 'wave', label: 'Wendy\'s Wave' },
      { value: 'variant-b', label: 'Variant B' },
    ],
  },
  postOrderSurprise: {
    label: 'Post-Order Surprise & Delight',
    description: 'Celebration animation after order confirmation',
    options: [
      { value: 'none', label: 'None' },
      { value: 'confetti', label: 'Confetti' },
      { value: 'animation', label: 'Lottie Animation' },
    ],
  },
  darkMode: {
    label: 'Dark Mode',
    description: 'Toggle dark theme',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
  },
  loadingScenario: {
    label: 'Loading Scenario',
    description: 'Simulate loading and error states',
    options: [
      { value: 'none', label: 'None' },
      { value: 'slow-network', label: 'Slow Network' },
      { value: 'error-state', label: 'Error State' },
    ],
  },
};
