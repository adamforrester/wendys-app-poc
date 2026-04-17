import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { UpsellCard } from './UpsellCard';

const meta: Meta<typeof UpsellCard> = {
  title: 'Components/UpsellCard',
  component: UpsellCard,
  decorators: [
    (Story) => (
      <div style={{ width: 390, background: '#f5f5f5', padding: '16px 0' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof UpsellCard>;

/* ── Interactive demo ── */
function UpsellDemo() {
  const [isAdded, setIsAdded] = useState(false);
  return (
    <UpsellCard
      title="Applewood Smoked Bacon"
      subtitle="+$1.99"
      imageSrc="/images/product-images/food_hamburgers_daves-single_2376.png"
      isAdded={isAdded}
      onAdd={() => setIsAdded(true)}
      onRemove={() => setIsAdded(false)}
    />
  );
}

/* ── Resting state ── */
export const Resting: Story = {
  args: {
    title: 'Applewood Smoked Bacon',
    subtitle: '+$1.99',
    imageSrc: '/images/product-images/food_hamburgers_daves-single_2376.png',
    isAdded: false,
  },
};

/* ── Active (added) state ── */
export const Active: Story = {
  args: {
    title: 'Applewood Smoked Bacon',
    subtitle: '+$1.99',
    imageSrc: '/images/product-images/food_hamburgers_daves-single_2376.png',
    isAdded: true,
  },
};

/* ── Interactive toggle ── */
export const Interactive: Story = {
  render: () => <UpsellDemo />,
};

/* ── No image ── */
export const NoImage: Story = {
  args: {
    title: 'Extra Cheese',
    subtitle: '+$0.50',
    isAdded: false,
  },
};

/* ── Custom overline ── */
export const CustomOverline: Story = {
  args: {
    overline: 'Add even more goodness',
    title: 'Applewood Smoked Bacon',
    subtitle: '+$1.80',
    imageSrc: '/images/product-images/food_hamburgers_daves-single_2376.png',
    isAdded: false,
  },
};
