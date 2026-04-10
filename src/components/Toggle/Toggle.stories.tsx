import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    checked: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    checked: false,
    showIcon: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24 p-wds-16">
      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-12">Without Icons</h3>
        <div className="flex gap-wds-24 items-center">
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked={false} aria-label="Off" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">Off</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked aria-label="On" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">On</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked={false} disabled aria-label="Off disabled" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">Off Dis</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked disabled aria-label="On disabled" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">On Dis</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-[18px] font-bold mb-wds-12">With Icons</h3>
        <div className="flex gap-wds-24 items-center">
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked={false} showIcon aria-label="Off" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">Off</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked showIcon aria-label="On" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">On</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked={false} showIcon disabled aria-label="Off disabled" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">Off Dis</span>
          </div>
          <div className="flex flex-col items-center gap-wds-4">
            <Toggle checked showIcon disabled aria-label="On disabled" />
            <span className="text-[12px] font-body text-[var(--color-text-secondary-default)]">On Dis</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [location, setLocation] = useState(true);

    return (
      <div className="p-wds-16" style={{ width: 358 }}>
        <h3 className="font-display text-[18px] font-bold mb-wds-16">Settings</h3>
        {[
          { label: 'Push Notifications', checked: notifications, onChange: setNotifications },
          { label: 'Dark Mode', checked: darkMode, onChange: setDarkMode },
          { label: 'Location Services', checked: location, onChange: setLocation },
        ].map(({ label, checked, onChange }) => (
          <div key={label} className="flex items-center justify-between py-wds-12 border-b border-[var(--color-border-tertiary-default)]">
            <span className="font-body text-[16px] leading-[24px]">{label}</span>
            <Toggle checked={checked} showIcon onChange={onChange} aria-label={label} />
          </div>
        ))}
      </div>
    );
  },
};
