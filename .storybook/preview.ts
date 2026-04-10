import type { Preview } from '@storybook/react-vite';
import '../src/styles/app.css';

const preview: Preview = {
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
