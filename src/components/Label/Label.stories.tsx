import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label, type LabelState } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    state: {
      control: 'select',
      options: ['primary', 'secondary', 'critical', 'success', 'caution', 'unavailable'],
    },
    icon: { control: 'text' },
    iconMultiColor: { control: 'boolean' },
    docked: { control: 'boolean' },
  },
  args: {
    children: 'Label Text',
    state: 'primary',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Playground: Story = {};

export const AllStates: Story = {
  render: () => {
    const states: LabelState[] = ['primary', 'secondary', 'critical', 'success', 'caution', 'unavailable'];
    return (
      <div className="flex flex-col gap-wds-16 p-wds-16">
        <h3 className="font-display text-[18px] font-bold">Without Icon</h3>
        <div className="flex flex-wrap gap-wds-8 items-center">
          {states.map((s) => (
            <Label key={s} state={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Label>
          ))}
        </div>

        <h3 className="font-display text-[18px] font-bold mt-wds-16">With Icon</h3>
        <div className="flex flex-wrap gap-wds-8 items-center">
          <Label state="primary" icon="FPO-default-icon">Primary</Label>
          <Label state="secondary" icon="FPO-default-icon">Secondary</Label>
          <Label state="critical" icon="alert-outline">Critical</Label>
          <Label state="success" icon="check">Success</Label>
          <Label state="caution" icon="alert-outline">Caution</Label>
          <Label state="unavailable" icon="FPO-default-icon">Unavailable</Label>
        </div>

        <h3 className="font-display text-[18px] font-bold mt-wds-16">Use Cases</h3>
        <div className="flex flex-wrap gap-wds-8 items-center">
          <Label state="primary">New Item</Label>
          <Label state="success" icon="check">Open Now</Label>
          <Label state="caution" icon="alert-outline">Closing Soon</Label>
          <Label state="critical" icon="alert-outline">Sold Out</Label>
          <Label state="secondary">Limited Time</Label>
          <Label state="unavailable">Unavailable</Label>
        </div>
      </div>
    );
  },
};

export const DockedOnCard: Story = {
  render: () => (
    <div className="p-wds-16">
      <div
        className="bg-[var(--color-bg-primary-default)] rounded-wds-l overflow-hidden shadow-wds-s"
        style={{ width: 180 }}
      >
        <div className="h-[140px] bg-[var(--color-bg-secondary-default)] flex items-center justify-center">
          <span className="text-[var(--color-text-secondary-default)] text-[12px]">Product Image</span>
        </div>
        <div className="p-wds-12">
          <p className="font-display text-[18px] font-[800] leading-[24px] m-0">Headline</p>
          <p className="text-[14px] leading-[20px] text-[var(--color-text-secondary-default)] mt-wds-4">Subhead</p>
        </div>
        <Label state="primary" docked>Limited Time</Label>
      </div>
    </div>
  ),
};
