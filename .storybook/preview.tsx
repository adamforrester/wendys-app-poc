import type { Preview } from '@storybook/react-vite';
import { FeatureFlagsProvider } from '../src/context/FeatureFlagsContext';
import '../src/styles/app.css';

const preview: Preview = {
  // Flag-aware components (TopAppBar's colorScheme default, DeviceFrame's
  // accent class) call useFeatureFlags, which throws without a provider.
  // Mount it globally at default flag values; stories that need a specific
  // variant pass the prop explicitly rather than mutating flags.
  decorators: [
    (Story) => (
      <FeatureFlagsProvider>
        <Story />
      </FeatureFlagsProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        wendysMobile: {
          name: 'Wendys Mobile (390x844)',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'wendysMobile',
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
