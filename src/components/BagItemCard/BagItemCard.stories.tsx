import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BagItemCard } from './BagItemCard';

const meta: Meta<typeof BagItemCard> = {
  title: 'Components/BagItemCard',
  component: BagItemCard,
  decorators: [
    (Story) => (
      <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', background: '#fff' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof BagItemCard>;

/* ── Interactive single item ── */
function SingleItemDemo() {
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  return (
    <BagItemCard
      name="Dave's Double"
      price="$10.49"
      imageSrc="/images/product-images/food_hamburgers_dave-s-double_2388.png"
      quantity={qty}
      onQuantityChange={setQty}
      isFavorited={fav}
      onFavoriteToggle={setFav}
      onEdit={() => alert('Edit')}
      onRemove={() => alert('Remove')}
    />
  );
}

export const SingleItem: Story = {
  render: () => <SingleItemDemo />,
};

/* ── Interactive combo item ── */
function ComboItemDemo() {
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  return (
    <BagItemCard
      name="Dave's Combo"
      price="$10.49"
      imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png"
      quantity={qty}
      onQuantityChange={setQty}
      isFavorited={fav}
      onFavoriteToggle={setFav}
      onEdit={() => alert('Edit')}
      onRemove={() => alert('Remove')}
      comboItems={[
        { name: "Dave's Single", imageSrc: '/images/product-images/food_hamburgers_dave-s-single_2387.png' },
        { name: 'Medium Natural-Cut Fries', imageSrc: '/images/product-images/food_fries-sides_french-fries_165.png' },
        { name: 'Medium Sweetened Iced Tea', imageSrc: '/images/product-images/food_beverages_sweet-iced-tea_199.png' },
      ]}
    />
  );
}

export const ComboItem: Story = {
  render: () => <ComboItemDemo />,
};

/* ── Multiple items stacked ── */
function MultipleBagItems() {
  const [qty1, setQty1] = useState(4);
  const [qty2, setQty2] = useState(1);
  return (
    <>
      <BagItemCard
        name="Dave's Double"
        price="$30.36"
        imageSrc="/images/product-images/food_hamburgers_dave-s-double_2388.png"
        quantity={qty1}
        onQuantityChange={setQty1}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      <BagItemCard
        name="Dave's Combo"
        price="$10.49"
        imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png"
        quantity={qty2}
        onQuantityChange={setQty2}
        onEdit={() => {}}
        onRemove={() => {}}
        comboItems={[
          { name: "Dave's Single", imageSrc: '/images/product-images/food_hamburgers_dave-s-single_2387.png' },
          { name: 'Medium Natural-Cut Fries', imageSrc: '/images/product-images/food_fries-sides_french-fries_165.png' },
          { name: 'Medium Sweetened Iced Tea', imageSrc: '/images/product-images/food_beverages_sweet-iced-tea_199.png' },
        ]}
      />
    </>
  );
}

export const MultipleBagItemsStacked: Story = {
  render: () => <MultipleBagItems />,
};

/* ── No image ── */
export const NoImage: Story = {
  args: {
    name: 'Medium Sweetened Iced Tea',
    price: '$2.49',
    quantity: 1,
  },
};

/* ── Favorited ── */
export const Favorited: Story = {
  args: {
    name: "Dave's Single",
    price: '$6.49',
    imageSrc: '/images/product-images/food_hamburgers_dave-s-single_2387.png',
    quantity: 2,
    isFavorited: true,
  },
};
