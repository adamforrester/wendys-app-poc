import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  argTypes: {
    type: { control: 'radio', options: ['select', 'dismissible'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    meta: 'Meta',
    caption: 'Caption',
    type: 'select',
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const SelectStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Select — All States</p>
        <div className="flex gap-wds-8 items-start">
          <Chip label="Enabled" meta="$0.00" caption="Caption" />
          <Chip label="Selected" meta="$0.00" caption="Caption" selected />
          <Chip label="Disabled" meta="$0.00" caption="Caption" disabled />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">With Leading Icon</p>
        <div className="flex gap-wds-8 items-start">
          <Chip label="Enabled" meta="$0.00" leadingIcon="FPO-default-icon" caption="Caption" />
          <Chip label="Selected" meta="$0.00" leadingIcon="FPO-default-icon" caption="Caption" selected />
          <Chip label="Disabled" meta="$0.00" leadingIcon="FPO-default-icon" caption="Caption" disabled />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">No Meta, No Caption</p>
        <div className="flex gap-wds-8 items-start">
          <Chip label="Small" />
          <Chip label="Medium" selected />
          <Chip label="Large" />
        </div>
      </div>
    </div>
  ),
};

export const DismissibleStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <p className="font-display text-[14px] font-bold mb-wds-8">Dismissible — All States</p>
      <div className="flex gap-wds-8 items-start">
        <Chip type="dismissible" label="Enabled" meta="Meta" caption="Caption" leadingIcon="FPO-default-icon" onDismiss={() => alert('Dismissed!')} />
        <Chip type="dismissible" label="Disabled" meta="Meta" caption="Caption" leadingIcon="FPO-default-icon" disabled />
      </div>
    </div>
  ),
};

export const SizeSelector: Story = {
  render: () => {
    const [selected, setSelected] = useState('medium');
    const sizes = [
      { id: 'small', label: 'Small', meta: '$0.00' },
      { id: 'medium', label: 'Medium', meta: '+$0.50' },
      { id: 'large', label: 'Large', meta: '+$1.00' },
    ];
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Select Size</p>
        <div className="flex gap-wds-8">
          {sizes.map(s => (
            <Chip
              key={s.id}
              label={s.label}
              meta={s.meta}
              selected={selected === s.id}
              onPress={() => setSelected(s.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const TimeSelector: Story = {
  render: () => {
    const [selected, setSelected] = useState('11:30');
    const times = ['11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM'];
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Select Pickup Time</p>
        <div className="flex gap-wds-8 flex-wrap">
          {times.map(t => (
            <Chip
              key={t}
              label={t}
              selected={selected === t}
              onPress={() => setSelected(t)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const ModifierChips: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: 'no-onion', label: 'No Onion' },
      { id: 'extra-pickle', label: 'Extra Pickle' },
      { id: 'no-tomato', label: 'No Tomato' },
    ]);
    return (
      <div>
        <p className="font-display text-[18px] font-[800] mb-wds-12">Customizations</p>
        <div className="flex gap-wds-8 flex-wrap">
          {items.map(item => (
            <Chip
              key={item.id}
              type="dismissible"
              label={item.label}
              onDismiss={() => setItems(prev => prev.filter(i => i.id !== item.id))}
            />
          ))}
        </div>
        {items.length === 0 && (
          <p className="font-body text-[14px]" style={{ color: 'var(--color-text-secondary-default)' }}>No customizations</p>
        )}
      </div>
    );
  },
};
