import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListRow } from './ListRow';

const meta: Meta<typeof ListRow> = {
  title: 'Components/ListRow',
  component: ListRow,
  argTypes: {
    style: { control: 'radio', options: ['standard', 'rounded'] },
    validation: { control: 'select', options: ['none', 'critical', 'caution', 'success'] },
    leading: { control: 'radio', options: ['none', 'icon', 'image'] },
    trailing: { control: 'radio', options: ['none', 'checkbox', 'icon', 'switch', 'radio'] },
    supportTextLines: { control: 'radio', options: ['1', '2+'] },
  },
  args: {
    headline: 'Headline',
    style: 'standard',
    validation: 'none',
    leading: 'none',
    trailing: 'none',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 390 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ListRow>;

export const Playground: Story = {};

export const StandardVariants: Story = {
  render: () => (
    <div>
      <ListRow headline="Basic row" />
      <ListRow headline="With overline" overline="Overline" />
      <ListRow headline="With support text" supportText="Support text 1-line" />
      <ListRow headline="With overline + support" overline="Category" supportText="Description text here" />
      <ListRow headline="Multi-line support" supportText="Supporting text line lorem ipsum dolor sit amet, consectetur adipiscing elit." supportTextLines="2+" />
      <ListRow headline="With metadata" metadata="$4.99" trailing="icon" />
      <ListRow headline="No divider" showDivider={false} />
    </div>
  ),
};

export const LeadingElements: Story = {
  render: () => (
    <div>
      <ListRow headline="No leading" supportText="Default configuration" trailing="icon" />
      <ListRow headline="Icon leading (FPO)" supportText="24px default icon" leading="icon" trailing="icon" />
      <ListRow headline="Icon leading (custom)" supportText="Location pin icon" leading="icon" leadingIcon="location-filled" trailing="icon" />
      <ListRow headline="Image leading" supportText="56px thumbnail" leading="image" leadingImage="https://placehold.co/56x56/E5E5E5/999?text=IMG" trailing="icon" />
      <ListRow headline="Icon + overline" overline="Nearby" supportText="0.5 miles away" leading="icon" leadingIcon="location-filled" metadata="Open" trailing="icon" />
    </div>
  ),
};

export const TrailingElements: Story = {
  render: () => (
    <div>
      <ListRow headline="Chevron (icon)" trailing="icon" />
      <ListRow headline="Custom icon" trailing="icon" trailingIcon="arrow-right" />
      <ListRow headline="Checkbox" trailing="checkbox" checkboxState="selected" />
      <ListRow headline="Radio button" trailing="radio" radioSelected />
      <ListRow headline="Toggle switch" trailing="switch" toggleChecked />
      <ListRow headline="Metadata + icon" metadata="$8.99" trailing="icon" />
      <ListRow headline="Metadata only" metadata="3 items" />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div>
      <ListRow
        headline="Baconator Combo"
        supportText="Dave's Double, Medium Fry, Medium Drink"
        labels={[{ text: 'New Item', state: 'primary' }, { text: 'Limited Time', state: 'secondary' }]}
        trailing="icon"
        metadata="$12.49"
      />
      <ListRow
        headline="Store #1247"
        supportText="123 Main St, Columbus, OH"
        leading="icon"
        leadingIcon="storefront"
        labels={[{ text: 'Open Now', state: 'success', icon: 'check' }, { text: 'Drive-Thru', state: 'secondary' }]}
        trailing="icon"
        metadata="0.5 mi"
      />
    </div>
  ),
};

export const RoundedStyle: Story = {
  render: () => (
    <div className="flex flex-col">
      <ListRow style="rounded" headline="Rounded basic" trailing="icon" />
      <ListRow style="rounded" headline="Rounded with icon" leading="icon" trailing="icon" metadata="$4.99" />
      <ListRow style="rounded" headline="Rounded with image" leading="image" leadingImage="https://placehold.co/56x56/E5E5E5/999?text=IMG" supportText="Description" trailing="icon" />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="flex flex-col">
      <ListRow style="rounded" headline="No validation" trailing="icon" validation="none" />
      <ListRow style="rounded" headline="Critical" trailing="icon" validation="critical" helperMessage="This field is required." />
      <ListRow style="rounded" headline="Caution" trailing="icon" validation="caution" helperMessage="Please review this selection." />
      <ListRow style="rounded" headline="Success" trailing="icon" validation="success" helperMessage="Selection confirmed." />
    </div>
  ),
};

export const InteractiveCheckboxList: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: 'no-onion', label: 'No Onion', checked: false },
      { id: 'no-tomato', label: 'No Tomato', checked: false },
      { id: 'no-lettuce', label: 'No Lettuce', checked: false },
      { id: 'no-pickle', label: 'No Pickle', checked: true },
    ]);

    const toggle = (id: string) => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    return (
      <div>
        <div className="px-wds-16 py-wds-12">
          <span className="font-display text-[20px] font-[800] leading-[24px]">Customize</span>
        </div>
        {items.map(item => (
          <ListRow
            key={item.id}
            headline={item.label}
            trailing="checkbox"
            checkboxState={item.checked ? 'selected' : 'unselected'}
            onCheckboxChange={() => toggle(item.id)}
          />
        ))}
      </div>
    );
  },
};

export const InteractiveRadioList: Story = {
  render: () => {
    const [selected, setSelected] = useState('coke');
    const drinks = [
      { id: 'coke', name: 'Coca-Cola', cal: '210 Cal' },
      { id: 'sprite', name: 'Sprite', cal: '190 Cal' },
      { id: 'lemonade', name: 'Lemonade', cal: '170 Cal' },
      { id: 'drpepper', name: 'Dr Pepper', cal: '200 Cal' },
    ];

    return (
      <div>
        <div className="px-wds-16 py-wds-12">
          <span className="font-display text-[20px] font-[800] leading-[24px]">Choose a Drink</span>
        </div>
        {drinks.map(drink => (
          <ListRow
            key={drink.id}
            headline={drink.name}
            metadata={drink.cal}
            trailing="radio"
            radioSelected={selected === drink.id}
            onRadioChange={() => setSelected(drink.id)}
          />
        ))}
      </div>
    );
  },
};

export const SettingsList: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [location, setLocation] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
      <div>
        <div className="px-wds-16 py-wds-12">
          <span className="font-display text-[20px] font-[800] leading-[24px]">Settings</span>
        </div>
        <ListRow headline="Push Notifications" supportText="Get updates about your orders" trailing="switch" toggleChecked={notifications} toggleShowIcon onToggleChange={setNotifications} />
        <ListRow headline="Location Services" supportText="Allow nearby restaurant search" trailing="switch" toggleChecked={location} toggleShowIcon onToggleChange={setLocation} />
        <ListRow headline="Dark Mode" trailing="switch" toggleChecked={darkMode} toggleShowIcon onToggleChange={setDarkMode} />
        <ListRow headline="Payment Methods" trailing="icon" leading="icon" leadingIcon="credit-card" />
        <ListRow headline="Order History" trailing="icon" leading="icon" leadingIcon="order-history" />
        <ListRow headline="About" trailing="icon" metadata="v2.1.0" />
      </div>
    );
  },
};
