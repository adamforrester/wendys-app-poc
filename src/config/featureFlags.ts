/* ── Feature Flag Types ── */

/** Retro branding master switch. Surface flags set to 'auto' follow it. */
export type RetroBranding = 'off' | 'on';
export type TopAppBarStyle = 'auto' | 'classic' | 'retro';
export type AccentColor = 'auto' | 'teal' | 'red';
export type SplashAnimation = 'auto' | 'current' | 'retro-yellow' | 'retro-newsprint';

export type AddToBagTransition = 'snackbar' | 'slide-to-bag' | 'full-screen-confirmation';
export type ComboBuilderStyle = 'bottom-sheet-wizard' | 'accordion';
export type MenuCategoryLayout = 'current' | 'variant-b';
export type MenuPLPLayout = 'current' | 'variant-b';
export type SPPLayout = 'current' | 'variant-b';
export type BottomNavStyle = 'current' | 'simple' | 'floating-pill';
export type HomeLocationComponent = 'none' | 'card' | 'sticky-nav';
export type FallbackImage = 'wave' | 'variant-b';
export type PostOrderSurprise = 'none' | 'confetti' | 'animation';
export type DarkMode = 'off' | 'on';
export type LoadingScenario = 'none' | 'slow-network' | 'error-state';
export type VoiceOrdering = 'off' | 'mock' | 'live';
export type VoiceInputMode = 'push-to-talk' | 'hands-free';

export interface FeatureFlags {
  retroBranding: RetroBranding;
  topAppBarStyle: TopAppBarStyle;
  accentColor: AccentColor;
  splashAnimation: SplashAnimation;
  addToBagTransition: AddToBagTransition;
  comboBuilderStyle: ComboBuilderStyle;
  menuCategoryLayout: MenuCategoryLayout;
  menuPLPLayout: MenuPLPLayout;
  sppLayout: SPPLayout;
  bottomNavStyle: BottomNavStyle;
  homeLocationComponent: HomeLocationComponent;
  fallbackImage: FallbackImage;
  postOrderSurprise: PostOrderSurprise;
  darkMode: DarkMode;
  loadingScenario: LoadingScenario;
  voiceOrdering: VoiceOrdering;
  voiceInputMode: VoiceInputMode;
}

export const defaultFeatureFlags: FeatureFlags = {
  retroBranding: 'off',
  topAppBarStyle: 'auto',
  accentColor: 'auto',
  splashAnimation: 'auto',
  addToBagTransition: 'snackbar',
  comboBuilderStyle: 'bottom-sheet-wizard',
  menuCategoryLayout: 'current',
  menuPLPLayout: 'current',
  sppLayout: 'current',
  bottomNavStyle: 'current',
  homeLocationComponent: 'none',
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
  retroBranding: {
    label: 'Retro Branding',
    description: 'Master switch for the yellow-and-red retro theme. Turns on the yellow top app bar, red accents, the retro splash animation, and the retro Account hero all at once. The three flags below override it individually.',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
  },
  topAppBarStyle: {
    label: 'Top App Bar',
    description: 'Classic red bar with the white wave, or the retro yellow bar with black content and the retro logo. Auto follows Retro Branding.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'classic', label: 'Classic (Red)' },
      { value: 'retro', label: 'Retro (Yellow)' },
    ],
  },
  accentColor: {
    label: 'Red Accents',
    description: 'Turns every teal accent red — buttons, links, checkboxes, radios, toggles, chips, segmented controls, counters, text field focus, and the bottom nav in all three variants. Auto follows Retro Branding.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'teal', label: 'Teal' },
      { value: 'red', label: 'Red' },
    ],
  },
  splashAnimation: {
    label: 'Splash Animation',
    description: 'Splash screen animation. Auto follows Retro Branding and picks Retro Yellow.',
    options: [
      { value: 'auto', label: 'Auto (follow master)' },
      { value: 'current', label: 'Current (Lottie)' },
      { value: 'retro-yellow', label: 'Retro Yellow (GIF)' },
      { value: 'retro-newsprint', label: 'Retro Newsprint (MP4)' },
    ],
  },
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

/* ── Retro Branding Resolution ── */

/**
 * Concrete retro state after collapsing the master flag and the three
 * per-surface overrides. Consumers read this and never see 'auto'.
 */
export interface ResolvedRetro {
  topAppBar: 'classic' | 'retro';
  accent: 'teal' | 'red';
  splash: 'current' | 'retro-yellow' | 'retro-newsprint';
  accountHero: 'classic' | 'retro';
}

/**
 * Collapse the retro flags into concrete values. A surface flag set to
 * 'auto' follows `retroBranding`; any other value wins outright.
 *
 * The Account hero has no flag of its own — it follows the master only.
 * The top app bar was the only new per-surface toggle the team wanted, and
 * the hero is small enough that the master is sufficient.
 */
export function resolveRetro(flags: FeatureFlags): ResolvedRetro {
  const master = flags.retroBranding === 'on';

  return {
    topAppBar:
      flags.topAppBarStyle === 'auto' ? (master ? 'retro' : 'classic') : flags.topAppBarStyle,
    accent: flags.accentColor === 'auto' ? (master ? 'red' : 'teal') : flags.accentColor,
    splash:
      flags.splashAnimation === 'auto'
        ? master
          ? 'retro-yellow'
          : 'current'
        : flags.splashAnimation,
    accountHero: master ? 'retro' : 'classic',
  };
}
