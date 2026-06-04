import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BagProvider } from '../../context/BagContext';
import { AuthProvider } from '../../context/AuthContext';
import { FeatureFlagsProvider, useFeatureFlags } from '../../context/FeatureFlagsContext';
import { Button } from '../../components/Button/Button';
import { VoiceOrderingPanel } from './VoiceOrderingPanel';

/**
 * The panel only renders inside a BottomSheet. These stories drive it open
 * with a button so you can interact with the full chat flow.
 *
 * Mode is controlled via the FeatureFlags context — `mock` is the default
 * for storybook so canned responses fire without a backend.
 */

function SetMode({ mode, children }: { mode: 'off' | 'mock' | 'live'; children: React.ReactNode }) {
  const { dispatch } = useFeatureFlags();
  useEffect(() => {
    dispatch({ type: 'SET_FLAG', key: 'voiceOrdering', value: mode });
  }, [dispatch, mode]);
  return <>{children}</>;
}

function PanelHarness({ mode }: { mode: 'off' | 'mock' | 'live' }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <SetMode mode={mode}>
      <div style={{ width: 390, height: 844, position: 'relative', background: '#f5f5f5' }}>
        <div style={{ padding: 16 }}>
          <Button onClick={() => setIsOpen(true)}>Open voice panel</Button>
        </div>
        <VoiceOrderingPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </SetMode>
  );
}

const meta: Meta<typeof PanelHarness> = {
  title: 'Features/VoiceOrderingPanel',
  component: PanelHarness,
  decorators: [
    Story => (
      <MemoryRouter>
        <FeatureFlagsProvider>
          <AuthProvider>
            <BagProvider>
              <Story />
            </BagProvider>
          </AuthProvider>
        </FeatureFlagsProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof PanelHarness>;

export const MockMode: Story = {
  args: { mode: 'mock' },
  parameters: {
    docs: {
      description: {
        story: 'Default story. Try: "I\'d like a Dave\'s Single" → "yes combo" → "strawberry lemonade" → "medium" → "that\'s it". Order JSON parses and items hit the bag.',
      },
    },
  },
};

export const Off: Story = {
  args: { mode: 'off' },
  parameters: {
    docs: {
      description: {
        story: 'Voice ordering disabled — panel renders but input is locked and a clear error displays on attempted send.',
      },
    },
  },
};

export const LiveMode: Story = {
  args: { mode: 'live' },
  parameters: {
    docs: {
      description: {
        story: 'Live mode — calls the Bedrock proxy. With no proxy deployed, the first send will fail with a fetch error. Useful for debugging the request shape only.',
      },
    },
  },
};
