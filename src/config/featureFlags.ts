/* ── Feature Flag Types ── */

export type AddToBagTransition = 'snackbar' | 'slide-to-bag' | 'full-screen-confirmation';
export type ComboBuilderStyle = 'bottom-sheet-wizard' | 'accordion';
export type LocationSelectionLayout = 'map-and-list' | 'list-only';
export type SplashAnimation = 'current' | 'variant-b';
export type MenuCategoryLayout = 'current' | 'variant-b';
export type MenuPLPLayout = 'current' | 'variant-b';
export type SPPLayout = 'current' | 'variant-b';
export type BottomNavStyle = 'current' | 'simple' | 'floating-pill';
export type HomeLocationComponent = 'none' | 'card' | 'sticky-nav';
export type ButtonColorScheme = 'secondary' | 'primary';
export type FallbackImage = 'wave' | 'variant-b';
export type PostOrderSurprise = 'none' | 'confetti' | 'animation';
export type DarkMode = 'off' | 'on';
export type LoadingScenario = 'none' | 'slow-network' | 'error-state';
export type VoiceOrdering = 'off' | 'mock' | 'live';
export type VoiceInputMode = 'push-to-talk' | 'hands-free';

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
  voiceOrdering: VoiceOrdering;
  voiceInputMode: VoiceInputMode;
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
  voiceOrdering: 'live',
  voiceInputMode: 'push-to-talk',
};

/* ── Flag Metadata (drives admin UI auto-generation) ── */

export interface FlagMeta {
  label: string;
  description: string;
  options: { value: string; label: string }[];
  /**
   * True when the flag is defined but no consuming code reads it yet.
   * Dev tools renders these dimmed + disabled with a "NOT WIRED" badge so
   * the team can see what's planned without thinking the toggle does
   * something today. Drop the flag entirely once a consumer ships.
   */
  stub?: boolean;
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
    stub: true,
  },
  comboBuilderStyle: {
    label: 'Combo Builder Style',
    description: 'UI pattern for building combo meals',
    options: [
      { value: 'bottom-sheet-wizard', label: 'Bottom Sheet Wizard' },
      { value: 'accordion', label: 'Accordion' },
    ],
    stub: true,
  },
  locationSelectionLayout: {
    label: 'Location Selection Layout',
    description: 'Layout for the order location screen',
    options: [
      { value: 'map-and-list', label: 'Map + List' },
      { value: 'list-only', label: 'List Only' },
    ],
    stub: true,
  },
  splashAnimation: {
    label: 'Splash Animation',
    description: 'Splash screen animation variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
    stub: true,
  },
  menuCategoryLayout: {
    label: 'Menu Category Layout',
    description: 'Category page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
    stub: true,
  },
  menuPLPLayout: {
    label: 'Menu PLP Layout',
    description: 'Product listing page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
    stub: true,
  },
  sppLayout: {
    label: 'SPP Layout',
    description: 'Single product page design variant',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'variant-b', label: 'Variant B' },
    ],
    stub: true,
  },
  bottomNavStyle: {
    label: 'Bottom Nav Style',
    description: 'Bottom tab bar variant',
    options: [
      { value: 'current', label: 'Current (Notch)' },
      { value: 'simple', label: 'Simple (Flat)' },
      { value: 'floating-pill', label: 'Floating Pill' },
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
    stub: true,
  },
  buttonColorScheme: {
    label: 'Button Color Scheme',
    description: 'Default button color — teal (secondary) or red (primary)',
    options: [
      { value: 'secondary', label: 'Teal (Secondary)' },
      { value: 'primary', label: 'Red (Primary)' },
    ],
    stub: true,
  },
  fallbackImage: {
    label: 'Fallback Image',
    description: 'Placeholder image when product images fail to load',
    options: [
      { value: 'wave', label: 'Wendy\'s Wave' },
      { value: 'variant-b', label: 'Variant B' },
    ],
    stub: true,
  },
  postOrderSurprise: {
    label: 'Post-Order Surprise & Delight',
    description: 'Celebration animation after order confirmation',
    options: [
      { value: 'none', label: 'None' },
      { value: 'confetti', label: 'Confetti' },
      { value: 'animation', label: 'Lottie Animation' },
    ],
    stub: true,
  },
  darkMode: {
    label: 'Dark Mode',
    description: 'Toggle dark theme',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    stub: true,
  },
  loadingScenario: {
    label: 'Loading Scenario',
    description: 'Simulate loading and error states',
    options: [
      { value: 'none', label: 'None' },
      { value: 'slow-network', label: 'Slow Network' },
      { value: 'error-state', label: 'Error State' },
    ],
    stub: true,
  },
  voiceOrdering: {
    label: 'Voice Ordering (POC)',
    description: 'AI voice ordering experience. Mock returns canned responses; Live calls Claude via the proxy (Anthropic API or Bedrock, whichever is configured).',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'mock', label: 'Mock (no API)' },
      { value: 'live', label: 'Live (Claude proxy)' },
    ],
  },
  voiceInputMode: {
    label: 'Voice Input Mode',
    description: 'Hold-to-talk = press and hold the lottie button to speak. Hands-free = mic auto-opens, silence sends, mic auto-resumes after the agent replies; tap the lottie to mute.',
    options: [
      { value: 'push-to-talk', label: 'Hold to talk' },
      { value: 'hands-free', label: 'Hands-free' },
    ],
  },
};
