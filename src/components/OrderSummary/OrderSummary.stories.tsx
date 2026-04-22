import type { Meta, StoryObj } from '@storybook/react';
import { OrderSummary } from './OrderSummary';

const meta: Meta<typeof OrderSummary> = {
  title: 'Components/OrderSummary',
  component: OrderSummary,
  decorators: [
    (Story) => (
      <div style={{ width: 390, padding: '16px 0', background: '#fff' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof OrderSummary>;

export const Default: Story = {
  args: {
    lines: [
      { label: 'Subtotal', value: '$10.89' },
      { label: 'Tax', value: '$.90' },
      { label: 'Total', value: '$12.00', variant: 'total' },
    ],
  },
};

export const WithDiscount: Story = {
  args: {
    lines: [
      { label: 'Discount', value: '-$3.00', variant: 'discount' },
      { label: 'Subtotal', value: '$10.89' },
      { label: 'Tax', value: '$.90' },
      { label: 'Donation', value: '$.21' },
      { label: 'Total', value: '$12.00', variant: 'total' },
    ],
  },
};
