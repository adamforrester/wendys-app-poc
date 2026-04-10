import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, type CheckboxState } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'select', options: ['selected', 'indeterminate', 'unselected'] },
    disabled: { control: 'boolean' },
  },
  args: {
    checked: 'unselected',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24 p-wds-16">
      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-8">Selected</h3>
        <div className="flex gap-wds-8 items-center">
          <Checkbox checked="selected" aria-label="Selected enabled" />
          <Checkbox checked="selected" disabled aria-label="Selected disabled" />
        </div>
        <div className="flex gap-wds-16 mt-wds-4 text-[12px] text-[var(--color-text-secondary-default)] font-body">
          <span className="w-[48px] text-center">Enabled</span>
          <span className="w-[48px] text-center">Disabled</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-8">Indeterminate</h3>
        <div className="flex gap-wds-8 items-center">
          <Checkbox checked="indeterminate" aria-label="Indeterminate enabled" />
          <Checkbox checked="indeterminate" disabled aria-label="Indeterminate disabled" />
        </div>
        <div className="flex gap-wds-16 mt-wds-4 text-[12px] text-[var(--color-text-secondary-default)] font-body">
          <span className="w-[48px] text-center">Enabled</span>
          <span className="w-[48px] text-center">Disabled</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-8">Unselected</h3>
        <div className="flex gap-wds-8 items-center">
          <Checkbox checked="unselected" aria-label="Unselected enabled" />
          <Checkbox checked="unselected" disabled aria-label="Unselected disabled" />
        </div>
        <div className="flex gap-wds-16 mt-wds-4 text-[12px] text-[var(--color-text-secondary-default)] font-body">
          <span className="w-[48px] text-center">Enabled</span>
          <span className="w-[48px] text-center">Disabled</span>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveList: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: 'lettuce', label: 'Lettuce', checked: true },
      { id: 'tomato', label: 'Tomato', checked: true },
      { id: 'onion', label: 'Onion', checked: false },
      { id: 'pickles', label: 'Pickles', checked: true },
      { id: 'ketchup', label: 'Ketchup', checked: false },
    ]);

    const toggleItem = (id: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      );
    };

    const allChecked = items.every((i) => i.checked);
    const noneChecked = items.every((i) => !i.checked);
    const parentState: CheckboxState = allChecked ? 'selected' : noneChecked ? 'unselected' : 'indeterminate';

    const toggleAll = () => {
      const newValue = !allChecked;
      setItems((prev) => prev.map((item) => ({ ...item, checked: newValue })));
    };

    return (
      <div className="p-wds-16" style={{ width: 300 }}>
        <h3 className="font-display text-[18px] font-bold mb-wds-12">Customize Toppings</h3>
        <div className="flex items-center gap-wds-8 -ml-[4px] pb-wds-8 border-b border-[var(--color-border-tertiary-default)]">
          <Checkbox checked={parentState} onChange={toggleAll} aria-label="Select all" />
          <span className="font-body text-[16px] leading-[24px] font-bold">Select All</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-wds-8 -ml-[4px]">
            <Checkbox
              checked={item.checked ? 'selected' : 'unselected'}
              onChange={() => toggleItem(item.id)}
              aria-label={item.label}
            />
            <span className="font-body text-[16px] leading-[24px]">{item.label}</span>
          </div>
        ))}
      </div>
    );
  },
};
