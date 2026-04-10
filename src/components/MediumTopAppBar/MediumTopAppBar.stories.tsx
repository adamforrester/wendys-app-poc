import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { MediumTopAppBar } from './MediumTopAppBar';

const meta: Meta<typeof MediumTopAppBar> = {
  title: 'Components/MediumTopAppBar',
  component: MediumTopAppBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 390 }}>
          <Story />
          <div style={{ padding: 16, height: 600, backgroundColor: '#f5f5f5' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#999' }}>
              Scroll content area — the bar slides in when visible prop is true
            </p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MediumTopAppBar>;

export const Default: Story = {
  args: {
    title: 'Asiago Ranch Chicken Club Combo',
    subtitle: '$10.29 | 860 Cal',
    visible: true,
  },
};

export const Favorited: Story = {
  args: {
    title: "Dave's Double",
    subtitle: '$8.59 | 860 Cal',
    isFavorited: true,
    visible: true,
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Cheesy Bacon Cheeseburger Triple Combo with Large Fries and Drink',
    subtitle: '$14.99 | 1,560-2,340 Cal',
    visible: true,
  },
};

export const Hidden: Story = {
  args: {
    title: 'Baconator',
    subtitle: '$9.99 | 960 Cal',
    visible: false,
  },
};
