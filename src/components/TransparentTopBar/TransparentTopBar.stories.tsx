import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { TransparentTopBar } from './TransparentTopBar';
import { HeroImage } from '../HeroImage/HeroImage';

const meta: Meta<typeof TransparentTopBar> = {
  title: 'Components/TransparentTopBar',
  component: TransparentTopBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 390, position: 'relative' }}>
          <Story />
          <HeroImage
            imageSrc="/images/product-images/food_hamburgers_baconator_2390.png"
            alt="Baconator"
            extraPadding
          />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransparentTopBar>;

export const BackArrow: Story = {
  args: {
    leadingIcon: 'back',
    showFavorite: true,
  },
};

export const CloseButton: Story = {
  args: {
    leadingIcon: 'close',
    showFavorite: true,
  },
};

export const Favorited: Story = {
  args: {
    leadingIcon: 'back',
    isFavorited: true,
    showFavorite: true,
  },
};

export const NoFavorite: Story = {
  args: {
    leadingIcon: 'close',
    showFavorite: false,
  },
};
