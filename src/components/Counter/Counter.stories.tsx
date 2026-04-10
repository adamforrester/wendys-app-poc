import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Counter } from './Counter';

const meta: Meta<typeof Counter> = {
  title: 'Components/Counter',
  component: Counter,
  argTypes: {
    bordered: { control: 'boolean' },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
  },
  args: {
    value: 1,
    min: 0,
    max: 99,
    bordered: true,
    disabled: false,
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Counter>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Counter {...args} value={value} onChange={setValue} />;
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Bordered</p>
        <div className="flex flex-col gap-wds-12 items-start">
          <div className="flex items-center gap-wds-16">
            <Counter value={0} min={0} max={10} onChange={() => {}} bordered />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>At minimum</span>
          </div>
          <div className="flex items-center gap-wds-16">
            <Counter value={3} min={0} max={10} onChange={() => {}} bordered />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>Middle</span>
          </div>
          <div className="flex items-center gap-wds-16">
            <Counter value={10} min={0} max={10} onChange={() => {}} bordered />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>At maximum</span>
          </div>
          <div className="flex items-center gap-wds-16">
            <Counter value={5} min={0} max={10} onChange={() => {}} bordered disabled />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>Disabled</span>
          </div>
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">No Border</p>
        <div className="flex flex-col gap-wds-12 items-start">
          <div className="flex items-center gap-wds-16">
            <Counter value={0} min={0} max={10} onChange={() => {}} bordered={false} />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>At minimum</span>
          </div>
          <div className="flex items-center gap-wds-16">
            <Counter value={3} min={0} max={10} onChange={() => {}} bordered={false} />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>Middle</span>
          </div>
          <div className="flex items-center gap-wds-16">
            <Counter value={10} min={0} max={10} onChange={() => {}} bordered={false} disabled />
            <span className="font-body text-[12px]" style={{ color: 'var(--color-text-secondary-default)' }}>Disabled</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveBordered: Story = {
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Quantity</p>
        <Counter value={value} min={1} max={20} onChange={setValue} bordered />
      </div>
    );
  },
};

export const InteractiveNoBorder: Story = {
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Quantity</p>
        <Counter value={value} min={1} max={20} onChange={setValue} bordered={false} />
      </div>
    );
  },
};

export const ThreeDigits: Story = {
  render: () => {
    const [value, setValue] = useState(100);
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Large Value</p>
        <Counter value={value} min={0} max={999} onChange={setValue} bordered />
      </div>
    );
  },
};

export const InContext: Story = {
  render: () => {
    const [qty, setQty] = useState(1);
    const price = (6.49 * qty).toFixed(2);
    return (
      <div style={{ width: 358 }}>
        <div className="flex items-center justify-between py-wds-16">
          <div>
            <p className="font-display text-[18px] font-[800] leading-[24px] m-0">Baconator</p>
            <p className="font-body text-[14px] leading-[20px] m-0" style={{ color: 'var(--color-text-secondary-default)' }}>960 Cal</p>
          </div>
          <Counter value={qty} min={1} max={20} onChange={setQty} bordered />
        </div>
        <div className="flex justify-between items-center pt-wds-8 mt-wds-8" style={{ borderTop: '1px solid var(--color-border-tertiary-default)' }}>
          <span className="font-body text-[16px] font-bold">Total</span>
          <span className="font-body text-[16px] font-bold">${price}</span>
        </div>
      </div>
    );
  },
};
