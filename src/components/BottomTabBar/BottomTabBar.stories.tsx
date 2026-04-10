import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { BagProvider } from '../../context/BagContext';
import { BottomTabBar } from './BottomTabBar';

const meta: Meta<typeof BottomTabBar> = {
  title: 'Components/BottomTabBar',
  component: BottomTabBar,
  argTypes: {
    variant: { control: 'radio', options: ['current', 'simple'] },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
          <BagProvider>
            <div style={{ width: 390, position: 'relative', background: '#f5f5f5', height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Story />
            </div>
          </BagProvider>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomTabBar>;

export const Current: Story = {
  args: { variant: 'current' },
};

export const Simple: Story = {
  args: { variant: 'simple' },
};

export const SideBySide: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div>
        <p className="font-display text-[14px] font-bold px-wds-16 mb-wds-8">Current (Wendy's custom)</p>
        <div style={{ width: 390, position: 'relative', background: '#f5f5f5', height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <BottomTabBar variant="current" />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold px-wds-16 mb-wds-8">Simple (future experiment)</p>
        <div style={{ width: 390, position: 'relative', background: '#f5f5f5', height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <BottomTabBar variant="simple" />
        </div>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
          <BagProvider>
            <div style={{ width: 390 }}>
              <Story />
            </div>
          </BagProvider>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
};
