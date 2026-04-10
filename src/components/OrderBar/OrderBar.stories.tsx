import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderBar } from './OrderBar';

const meta: Meta<typeof OrderBar> = {
  title: 'Components/OrderBar',
  component: OrderBar,
  argTypes: {
    disabled: { control: 'boolean' },
    addLabel: { control: 'text' },
  },
  args: {
    quantity: 1,
    disabled: false,
    addLabel: 'Add',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 390, height: 200, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OrderBar>;

export const Interactive: Story = {
  render: () => {
    const [qty, setQty] = useState(1);
    return (
      <OrderBar
        quantity={qty}
        onQuantityChange={setQty}
        onAddToBag={() => alert(`Added ${qty} item(s) to bag!`)}
      />
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-8">
      <OrderBar quantity={1} onQuantityChange={() => {}} onAddToBag={() => {}} />
      <OrderBar quantity={5} onQuantityChange={() => {}} onAddToBag={() => {}} />
      <OrderBar quantity={1} onQuantityChange={() => {}} onAddToBag={() => {}} disabled />
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 390, background: '#f5f5f5', padding: '16px 0' }}>
        <Story />
      </div>
    ),
  ],
};

export const InContext: Story = {
  render: () => {
    const [qty, setQty] = useState(1);
    const price = (8.99 * qty).toFixed(2);
    return (
      <div style={{ width: 390, height: 400, display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        <div className="flex-1 p-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
          <h2 className="font-display text-[26px] font-[800] leading-[32px] m-0" style={{ color: 'var(--color-text-brand-primary-default)' }}>
            Baconator
          </h2>
          <p className="font-body text-[18px] leading-[24px] font-bold mt-wds-8">${price} | 960 Cal</p>
          <button className="font-body text-[16px] leading-[24px] font-bold mt-wds-4 border-none bg-transparent p-0" style={{ color: 'var(--color-text-brand-secondary-default)', textDecoration: 'underline' }}>
            Nutrition
          </button>
        </div>
        <OrderBar
          quantity={qty}
          onQuantityChange={setQty}
          onAddToBag={() => alert(`Added ${qty} Baconator(s) — $${price}`)}
        />
      </div>
    );
  },
  decorators: [(Story) => <div style={{ width: 390 }}><Story /></div>],
};
