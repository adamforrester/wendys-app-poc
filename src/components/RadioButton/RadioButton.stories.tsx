import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioButton } from './RadioButton';

const meta: Meta<typeof RadioButton> = {
  title: 'Components/RadioButton',
  component: RadioButton,
  argTypes: {
    type: { control: 'radio', options: ['standard', 'checked'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'standard',
    selected: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24 p-wds-16">
      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-8">Standard (Dot)</h3>
        <div className="flex gap-wds-8 items-center">
          <RadioButton type="standard" selected={false} aria-label="Unselected" />
          <RadioButton type="standard" selected aria-label="Selected" />
          <RadioButton type="standard" selected={false} disabled aria-label="Disabled unselected" />
          <RadioButton type="standard" selected disabled aria-label="Disabled selected" />
        </div>
        <div className="flex gap-wds-16 mt-wds-4 text-[12px] text-[var(--color-text-secondary-default)] font-body">
          <span className="w-[48px] text-center">Off</span>
          <span className="w-[48px] text-center">On</span>
          <span className="w-[48px] text-center">Off Dis</span>
          <span className="w-[48px] text-center">On Dis</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-8">Checked (Checkmark)</h3>
        <div className="flex gap-wds-8 items-center">
          <RadioButton type="checked" selected={false} aria-label="Unselected" />
          <RadioButton type="checked" selected aria-label="Selected" />
          <RadioButton type="checked" selected={false} disabled aria-label="Disabled unselected" />
          <RadioButton type="checked" selected disabled aria-label="Disabled selected" />
        </div>
        <div className="flex gap-wds-16 mt-wds-4 text-[12px] text-[var(--color-text-secondary-default)] font-body">
          <span className="w-[48px] text-center">Off</span>
          <span className="w-[48px] text-center">On</span>
          <span className="w-[48px] text-center">Off Dis</span>
          <span className="w-[48px] text-center">On Dis</span>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('medium');
    const options = [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ];
    return (
      <div className="p-wds-16" role="radiogroup" aria-label="Size selection">
        <h3 className="font-display text-[18px] font-bold mb-wds-12">Select Size</h3>
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-wds-8 -ml-[4px]">
            <RadioButton
              type="standard"
              selected={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              aria-label={opt.label}
            />
            <span className="font-body text-[16px] leading-[24px]">{opt.label}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const CheckedGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('coke');
    const options = [
      { value: 'coke', label: 'Coca-Cola' },
      { value: 'sprite', label: 'Sprite' },
      { value: 'lemonade', label: 'Lemonade' },
      { value: 'drpepper', label: 'Dr Pepper' },
    ];
    return (
      <div className="p-wds-16" role="radiogroup" aria-label="Drink selection">
        <h3 className="font-display text-[18px] font-bold mb-wds-12">Choose a Drink</h3>
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-wds-8 -ml-[4px]">
            <RadioButton
              type="checked"
              selected={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              aria-label={opt.label}
            />
            <span className="font-body text-[16px] leading-[24px]">{opt.label}</span>
          </div>
        ))}
      </div>
    );
  },
};
