import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ItemSelector } from './ItemSelector';

const meta: Meta<typeof ItemSelector> = {
  title: 'Components/ItemSelector',
  component: ItemSelector,
  argTypes: {
    size: { control: 'radio', options: ['large', 'small'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    captionColor: { control: 'select', options: ['default', 'positive', 'critical'] },
  },
  args: {
    title: 'Coca-Cola',
    caption: '$0.00',
    imageSrc: '/images/product-images/food_beverages_coca-cola-freestyle_425.png',
    size: 'large',
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ItemSelector>;

export const Playground: Story = {};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-12">Large — All States</p>
        <div className="flex gap-wds-12">
          <ItemSelector title="Enabled" caption="$0.00" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" />
          <ItemSelector title="Selected" caption="$0.00" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" selected />
          <ItemSelector title="Disabled" caption="$0.00" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" disabled />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-12">Small — All States</p>
        <div className="flex gap-wds-12">
          <ItemSelector title="Enabled" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" size="small" />
          <ItemSelector title="Selected" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" size="small" selected />
          <ItemSelector title="Disabled" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" size="small" disabled />
        </div>
      </div>
    </div>
  ),
};

export const DrinkSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState('coke');
    const drinks = [
      { id: 'coke', title: 'Coca-Cola', caption: 'Included', img: '/images/product-images/food_beverages_coca-cola-freestyle_425.png' },
      { id: 'sprite', title: 'Sprite', caption: 'Included', img: '/images/product-images/food_beverages_coca-cola-freestyle_425.png' },
      { id: 'lemonade', title: 'Lemonade', caption: '+$0.30', img: '/images/product-images/food_beverages_all-natural-lemonade_196.png' },
      { id: 'tea', title: 'Sweet Tea', caption: 'Included', img: '/images/product-images/food_beverages_sweet-iced-tea_199.png' },
    ];
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Choose a Drink</p>
        <div className="flex gap-wds-12">
          {drinks.map(d => (
            <ItemSelector
              key={d.id}
              title={d.title}
              caption={d.caption}
              imageSrc={d.img}
              selected={selected === d.id}
              onPress={() => setSelected(d.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const PickupMethods: Story = {
  render: () => {
    const [selected, setSelected] = useState('drive-thru');
    const methods = [
      { id: 'drive-thru', title: 'Drive Thru', caption: 'Open', captionColor: 'positive' as const, img: '/images/nurdles/Drive Thru.svg' },
      { id: 'dine-in', title: 'Dine In', caption: 'Open', captionColor: 'positive' as const, img: '/images/nurdles/Dine In.svg' },
      { id: 'carryout', title: 'Carryout', caption: 'Closed', captionColor: 'critical' as const, img: '/images/nurdles/Carryout-right.svg', disabled: true },
    ];
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Select Pickup Method</p>
        <div className="flex gap-wds-16 justify-center">
          {methods.map(m => (
            <ItemSelector
              key={m.id}
              title={m.title}
              caption={m.caption}
              captionColor={m.captionColor}
              imageSrc={m.img}
              selected={selected === m.id}
              disabled={m.disabled}
              onPress={() => setSelected(m.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const NurdleGallery: Story = {
  render: () => {
    const nurdles = [
      { title: 'Drive Thru', img: '/images/nurdles/Drive Thru.svg' },
      { title: 'Dine In', img: '/images/nurdles/Dine In.svg' },
      { title: 'Carryout', img: '/images/nurdles/Carryout-right.svg' },
      { title: 'Curbside', img: '/images/nurdles/Curbside.svg' },
      { title: 'Delivery', img: '/images/nurdles/Delivery.svg' },
      { title: 'Rewards', img: '/images/nurdles/Rewards Bowl.svg' },
      { title: 'Birthday', img: '/images/nurdles/Birthday.svg' },
      { title: 'Search', img: '/images/nurdles/Search 1.svg' },
    ];
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Nurdle Gallery</p>
        <div className="flex flex-wrap gap-wds-12">
          {nurdles.map(n => (
            <ItemSelector key={n.title} title={n.title} imageSrc={n.img} size="small" />
          ))}
        </div>
      </div>
    );
  },
};

export const CaptionColors: Story = {
  render: () => (
    <div className="flex gap-wds-12">
      <ItemSelector title="Default" caption="$0.00" captionColor="default" imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png" />
      <ItemSelector title="Open" caption="Open" captionColor="positive" imageSrc="/images/nurdles/Drive Thru.svg" />
      <ItemSelector title="Closed" caption="Closed" captionColor="critical" imageSrc="/images/nurdles/Drive Thru.svg" disabled />
    </div>
  ),
};
