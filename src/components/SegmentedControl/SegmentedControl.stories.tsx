import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl, type SegmentedControlDensity } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  decorators: [
    (Story) => (
      <div style={{ width: 390, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const TwoSegments: Story = {
  render: () => {
    const [active, setActive] = useState('pickup');
    return (
      <SegmentedControl
        segments={[
          { id: 'pickup', label: 'Pickup' },
          { id: 'delivery', label: 'Delivery' },
        ]}
        activeSegment={active}
        onSegmentChange={setActive}
      />
    );
  },
};

export const ThreeSegments: Story = {
  render: () => {
    const [active, setActive] = useState('drive');
    return (
      <SegmentedControl
        segments={[
          { id: 'drive', label: 'Drive-Thru' },
          { id: 'carry', label: 'Carry-Out' },
          { id: 'curbside', label: 'Curbside' },
        ]}
        activeSegment={active}
        onSegmentChange={setActive}
      />
    );
  },
};

export const FiveSegments: Story = {
  render: () => {
    const [active, setActive] = useState('s');
    return (
      <SegmentedControl
        segments={[
          { id: 'xs', label: 'XS' },
          { id: 's', label: 'S' },
          { id: 'm', label: 'M' },
          { id: 'l', label: 'L' },
          { id: 'xl', label: 'XL' },
        ]}
        activeSegment={active}
        onSegmentChange={setActive}
      />
    );
  },
};

export const AllDensities: Story = {
  render: () => {
    const [active, setActive] = useState('a');
    const segments = [
      { id: 'a', label: 'Option A' },
      { id: 'b', label: 'Option B' },
      { id: 'c', label: 'Option C' },
    ];
    const densities: { label: string; value: SegmentedControlDensity }[] = [
      { label: 'Extra Large (48px)', value: 'xl' },
      { label: 'Large (44px)', value: 'lg' },
      { label: 'Medium (40px)', value: 'md' },
      { label: 'Small (36px)', value: 'sm' },
    ];

    return (
      <div className="flex flex-col gap-wds-16">
        {densities.map(d => (
          <div key={d.value}>
            <p className="font-body text-[12px] mb-wds-4" style={{ color: 'var(--color-text-secondary-default)' }}>{d.label}</p>
            <SegmentedControl segments={segments} activeSegment={active} onSegmentChange={setActive} density={d.value} />
          </div>
        ))}
      </div>
    );
  },
};

export const FullWidth: Story = {
  render: () => {
    const [active, setActive] = useState('pickup');
    return (
      <SegmentedControl
        segments={[
          { id: 'pickup', label: 'Pickup' },
          { id: 'delivery', label: 'Delivery' },
        ]}
        activeSegment={active}
        onSegmentChange={setActive}
        fullWidth
      />
    );
  },
};

export const UseCases: Story = {
  render: () => {
    const [fulfillment, setFulfillment] = useState('drive');
    const [size, setSize] = useState('m');
    const [filter, setFilter] = useState('all');

    return (
      <div className="flex flex-col gap-wds-24">
        <div>
          <p className="font-display text-[14px] font-bold mb-wds-8">Fulfillment Method</p>
          <SegmentedControl
            segments={[
              { id: 'drive', label: 'Drive-Thru' },
              { id: 'carry', label: 'Carry-Out' },
              { id: 'curbside', label: 'Curbside' },
            ]}
            activeSegment={fulfillment}
            onSegmentChange={setFulfillment}
          />
        </div>
        <div>
          <p className="font-display text-[14px] font-bold mb-wds-8">Combo Size</p>
          <SegmentedControl
            segments={[
              { id: 's', label: 'Small' },
              { id: 'm', label: 'Medium' },
              { id: 'l', label: 'Large' },
            ]}
            activeSegment={size}
            onSegmentChange={setSize}
            density="md"
          />
        </div>
        <div>
          <p className="font-display text-[14px] font-bold mb-wds-8">Offer Filter (full width)</p>
          <SegmentedControl
            segments={[
              { id: 'all', label: 'All' },
              { id: 'available', label: 'Available' },
              { id: 'redeemed', label: 'Redeemed' },
            ]}
            activeSegment={filter}
            onSegmentChange={setFilter}
            fullWidth
            density="lg"
          />
        </div>
      </div>
    );
  },
};
