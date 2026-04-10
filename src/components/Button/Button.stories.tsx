import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonType } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'text', 'filled-reversed', 'outline-reversed', 'text-reversed'],
    },
    colorScheme: { control: 'radio', options: ['secondary', 'primary'] },
    size: { control: 'radio', options: ['large', 'small'] },
    elevated: { control: 'boolean' },
    noPadding: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    leftIcon: { control: 'text' },
    rightIcon: { control: 'text' },
  },
  args: {
    children: 'Button',
    variant: 'filled',
    size: 'large',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ── Interactive playground ── */
export const Playground: Story = {};

/* ── All Types (Enabled, Large) ── */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <h3 className="font-display text-[18px] font-bold">Standard types</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled">Filled</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="text">Text</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Elevated</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" elevated>Filled</Button>
        <Button variant="outline" elevated>Outline</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Reversed (on dark bg)</h3>
      <div className="flex flex-wrap gap-wds-12 items-center bg-wds-bg-brand-secondary p-wds-16 rounded-wds-l">
        <Button variant="filled-reversed">Filled</Button>
        <Button variant="outline-reversed">Outline</Button>
        <Button variant="text-reversed">Text</Button>
      </div>
    </div>
  ),
};

/* ── All States for a given type ── */
export const FilledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <h3 className="font-display text-[18px] font-bold">Filled — All States</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled">Enabled</Button>
        <Button variant="filled" disabled>Disabled</Button>
        <Button variant="filled" loading>Loading</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Outline — All States</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="outline">Enabled</Button>
        <Button variant="outline" disabled>Disabled</Button>
        <Button variant="outline" loading>Loading</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Text — All States</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="text">Enabled</Button>
        <Button variant="text" disabled>Disabled</Button>
        <Button variant="text" loading>Loading</Button>
        <Button variant="text" noPadding>No Padding</Button>
      </div>
    </div>
  ),
};

/* ── Sizes ── */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      {(['filled', 'outline', 'text'] as ButtonType[]).map((variant) => (
        <div key={variant}>
          <h3 className="font-display text-[18px] font-bold capitalize mb-wds-8">{variant}</h3>
          <div className="flex flex-wrap gap-wds-12 items-center">
            <Button variant={variant} size="large">Large</Button>
            <Button variant={variant} size="small">Small</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ── With Icons ── */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <h3 className="font-display text-[18px] font-bold">With Icons</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" leftIcon="FPO-default-icon" rightIcon="FPO-default-icon">
          Both Icons
        </Button>
        <Button variant="filled" leftIcon="FPO-default-icon">
          Left Only
        </Button>
        <Button variant="filled" rightIcon="FPO-default-icon">
          Right Only
        </Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Small with Icons</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" size="small" leftIcon="FPO-default-icon" rightIcon="FPO-default-icon">
          Both Icons
        </Button>
        <Button variant="outline" size="small" leftIcon="search">
          Search
        </Button>
      </div>
    </div>
  ),
};

/* ── Full Width ── */
export const FullWidth: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-12 p-wds-16" style={{ width: 358 }}>
      <Button variant="filled" fullWidth>Add to Bag — $8.99</Button>
      <Button variant="outline" fullWidth>View Menu</Button>
      <Button variant="filled" fullWidth size="small">Small Full Width</Button>
    </div>
  ),
};

/* ── Reversed Types (all states) ── */
export const ReversedStates: Story = {
  render: () => (
    <div className="bg-wds-bg-brand-secondary p-wds-16 rounded-wds-l flex flex-col gap-wds-16">
      <h3 className="font-display text-[18px] font-bold text-white">Filled Reversed</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled-reversed">Enabled</Button>
        <Button variant="filled-reversed" disabled>Disabled</Button>
        <Button variant="filled-reversed" loading>Loading</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold text-white mt-wds-8">Outline Reversed</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="outline-reversed">Enabled</Button>
        <Button variant="outline-reversed" disabled>Disabled</Button>
        <Button variant="outline-reversed" loading>Loading</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold text-white mt-wds-8">Text Reversed</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="text-reversed">Enabled</Button>
        <Button variant="text-reversed" disabled>Disabled</Button>
        <Button variant="text-reversed" loading>Loading</Button>
        <Button variant="text-reversed" noPadding>No Padding</Button>
      </div>
    </div>
  ),
};

/* ── Color Schemes ── */
export const ColorSchemes: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <h3 className="font-display text-[18px] font-bold">Secondary (Teal — default)</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled">Filled</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="text">Text</Button>
        <Button variant="filled" loading>Loading</Button>
        <Button variant="filled" disabled>Disabled</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Primary (Red)</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" colorScheme="primary">Filled</Button>
        <Button variant="outline" colorScheme="primary">Outline</Button>
        <Button variant="text" colorScheme="primary">Text</Button>
        <Button variant="filled" colorScheme="primary" loading>Loading</Button>
        <Button variant="filled" colorScheme="primary" disabled>Disabled</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Primary — Sizes + Icons</h3>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" colorScheme="primary" size="large" leftIcon="FPO-default-icon">Large</Button>
        <Button variant="filled" colorScheme="primary" size="small" leftIcon="FPO-default-icon">Small</Button>
        <Button variant="outline" colorScheme="primary" elevated>Elevated</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Primary — Full Width CTA</h3>
      <div style={{ width: 358 }}>
        <Button variant="filled" colorScheme="primary" fullWidth>Place Order — $12.49</Button>
      </div>

      <h3 className="font-display text-[18px] font-bold mt-wds-16">Reversed on brand bg</h3>
      <div className="flex gap-wds-16">
        <div className="bg-wds-bg-brand-secondary p-wds-16 rounded-wds-l flex flex-wrap gap-wds-12 items-center">
          <Button variant="filled-reversed">Teal bg</Button>
          <Button variant="outline-reversed">Outline</Button>
        </div>
        <div className="bg-wds-bg-brand-primary p-wds-16 rounded-wds-l flex flex-wrap gap-wds-12 items-center">
          <Button variant="filled-reversed" colorScheme="primary">Red bg</Button>
          <Button variant="outline-reversed">Outline</Button>
        </div>
      </div>
    </div>
  ),
};

/* ── Loading States ── */
export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" loading>Filled</Button>
        <Button variant="outline" loading>Outline</Button>
        <Button variant="text" loading>Text</Button>
      </div>
      <div className="flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled" size="small" loading>Small</Button>
        <Button variant="outline" size="small" loading>Small</Button>
      </div>
      <div className="bg-wds-bg-brand-secondary p-wds-16 rounded-wds-l flex flex-wrap gap-wds-12 items-center">
        <Button variant="filled-reversed" loading>Reversed</Button>
        <Button variant="outline-reversed" loading>Reversed</Button>
        <Button variant="text-reversed" loading>Reversed</Button>
      </div>
    </div>
  ),
};
