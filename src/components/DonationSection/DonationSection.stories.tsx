import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DonationSection } from './DonationSection';

const meta: Meta<typeof DonationSection> = {
  title: 'Components/DonationSection',
  component: DonationSection,
  decorators: [
    (Story) => (
      <div style={{ width: 390, background: '#fff' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof DonationSection>;

function DonationDemo() {
  const [checked, setChecked] = useState(true);
  return <DonationSection isChecked={checked} onChange={setChecked} />;
}

export const Default: Story = {
  render: () => <DonationDemo />,
};

export const Unchecked: Story = {
  args: {
    isChecked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    isChecked: true,
    onChange: () => {},
  },
};
