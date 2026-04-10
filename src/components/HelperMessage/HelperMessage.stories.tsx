import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelperMessage } from './HelperMessage';

const meta: Meta<typeof HelperMessage> = {
  title: 'Components/HelperMessage',
  component: HelperMessage,
  argTypes: {
    type: {
      control: 'select',
      options: ['helper', 'error', 'caution', 'success'],
    },
  },
  args: {
    children: 'This is a helper message.',
    type: 'helper',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 358, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HelperMessage>;

export const Playground: Story = {};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <HelperMessage type="helper">This is a helper message.</HelperMessage>
      <HelperMessage type="error">This is an error message.</HelperMessage>
      <HelperMessage type="caution">This is a caution message.</HelperMessage>
      <HelperMessage type="success">This is a success message.</HelperMessage>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div className="flex flex-col gap-wds-4">
        <label className="font-body text-[14px] font-bold text-[var(--color-text-primary-default)]">
          Email Address
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          className="font-body text-[16px] leading-[24px] px-wds-12 py-wds-8 border border-solid rounded-wds-m"
          style={{ borderColor: 'var(--color-border-primary-default)' }}
        />
        <HelperMessage type="helper">We'll never share your email.</HelperMessage>
      </div>

      <div className="flex flex-col gap-wds-4">
        <label className="font-body text-[14px] font-bold text-[var(--color-text-primary-default)]">
          Email Address
        </label>
        <input
          type="email"
          value="invalid-email"
          readOnly
          className="font-body text-[16px] leading-[24px] px-wds-12 py-wds-8 border border-solid rounded-wds-m"
          style={{ borderColor: 'var(--color-border-validation-critical)' }}
        />
        <HelperMessage type="error">Please enter a valid email address.</HelperMessage>
      </div>

      <div className="flex flex-col gap-wds-4">
        <label className="font-body text-[14px] font-bold text-[var(--color-text-primary-default)]">
          Promo Code
        </label>
        <input
          type="text"
          value="FREEFRYDAY"
          readOnly
          className="font-body text-[16px] leading-[24px] px-wds-12 py-wds-8 border border-solid rounded-wds-m"
          style={{ borderColor: 'var(--color-border-validation-positive)' }}
        />
        <HelperMessage type="success">Promo code applied!</HelperMessage>
      </div>
    </div>
  ),
};
