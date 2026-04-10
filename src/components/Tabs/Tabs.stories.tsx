import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, type TabItem } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  decorators: [
    (Story) => (
      <div style={{ width: 390 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const basicTabs: TabItem[] = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2' },
  { id: 'tab3', label: 'Tab 3' },
];

const categoryTabs: TabItem[] = [
  { id: 'combos', label: 'Combos' },
  { id: 'hamburgers', label: 'Hamburgers' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'nuggets', label: 'Nuggets' },
  { id: 'fries', label: 'Fries & Sides' },
  { id: 'frosty', label: 'Frosty' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'salads', label: 'Salads' },
  { id: 'bakery', label: 'Bakery' },
];

const offerTabs: TabItem[] = [
  { id: 'all', label: 'All Offers' },
  { id: 'mine', label: 'My Offers' },
];

export const FixedTabs: Story = {
  render: () => {
    const [active, setActive] = useState('tab1');
    return <Tabs type="fixed" tabs={basicTabs} activeTab={active} onTabChange={setActive} />;
  },
};

export const ScrollableTabs: Story = {
  render: () => {
    const [active, setActive] = useState('combos');
    return <Tabs type="scrollable" tabs={categoryTabs} activeTab={active} onTabChange={setActive} />;
  },
};

export const TwoFixedTabs: Story = {
  render: () => {
    const [active, setActive] = useState('all');
    return <Tabs type="fixed" tabs={offerTabs} activeTab={active} onTabChange={setActive} />;
  },
};

export const WithContent: Story = {
  render: () => {
    const [active, setActive] = useState('combos');
    return (
      <div>
        <Tabs type="scrollable" tabs={categoryTabs} activeTab={active} onTabChange={setActive} />
        <div className="p-wds-16">
          <p className="font-display text-[20px] font-[800] leading-[24px]">
            {categoryTabs.find(t => t.id === active)?.label}
          </p>
          <p className="font-body text-[14px] leading-[20px] mt-wds-8" style={{ color: 'var(--color-text-secondary-default)' }}>
            Menu items for this category would appear here.
          </p>
        </div>
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const tabs: TabItem[] = [
      { id: 'home', label: 'Home', icon: 'home-filled' },
      { id: 'search', label: 'Search', icon: 'search' },
      { id: 'settings', label: 'Settings', icon: 'settings-filled' },
    ];
    const [active, setActive] = useState('home');
    return <Tabs type="fixed" tabs={tabs} activeTab={active} onTabChange={setActive} />;
  },
};
