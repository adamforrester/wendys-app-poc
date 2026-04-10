import type { Meta, StoryObj } from '@storybook/react';
import { HeroImage } from './HeroImage';

const meta: Meta<typeof HeroImage> = {
  title: 'Components/HeroImage',
  component: HeroImage,
  decorators: [(Story) => <div style={{ width: 390 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof HeroImage>;

export const Default: Story = {
  args: {
    imageSrc: '/images/product-images/food_hamburgers_dave-s-double_2388.png',
    alt: "Dave's Double",
  },
};

export const WithExtraPadding: Story = {
  args: {
    imageSrc: '/images/product-images/food_hamburgers_baconator_2390.png',
    alt: 'Baconator',
    extraPadding: true,
  },
};

export const Combo: Story = {
  args: {
    imageSrc: '/images/product-images/food_combos_dave-s-combo_2402.png',
    alt: "Dave's Combo",
  },
};

export const FallbackOnError: Story = {
  args: {
    imageSrc: '/images/product-images/nonexistent.png',
    alt: 'Missing image',
  },
};
