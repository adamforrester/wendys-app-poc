import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  argTypes: {
    size: { control: 'radio', options: ['large', 'small'] },
    buttonStyle: { control: 'radio', options: ['squared', 'rounded'] },
    disabled: { control: 'boolean' },
    multiColor: { control: 'boolean' },
  },
  args: {
    icon: 'favorite-outline',
    size: 'small',
    buttonStyle: 'rounded',
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-12">Small / Rounded (icon-only)</p>
        <div className="flex gap-wds-12 items-center">
          <IconButton icon="favorite-outline" aria-label="Favorite" onPress={() => {}} />
          <IconButton icon="close" aria-label="Close" onPress={() => {}} />
          <IconButton icon="arrow-left" aria-label="Back" onPress={() => {}} />
          <IconButton icon="search" aria-label="Search" onPress={() => {}} />
          <IconButton icon="favorite-outline" aria-label="Disabled" disabled />
        </div>
      </div>

      <div>
        <p className="font-display text-[14px] font-bold mb-wds-12">Large / Squared (tile)</p>
        <div className="flex gap-wds-12 items-start">
          <IconButton size="large" buttonStyle="squared" icon="rewards-simple" multiColor headline="Rewards" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="location-filled" headline="Locations" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="tag-filled" headline="Offers" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="rewards-simple" multiColor headline="Disabled" disabled />
        </div>
      </div>

      <div>
        <p className="font-display text-[14px] font-bold mb-wds-12">Large / Rounded (circular)</p>
        <div className="flex gap-wds-12 items-start">
          <IconButton size="large" buttonStyle="rounded" icon="rewards-simple" multiColor headline="Rewards" onPress={() => {}} />
          <IconButton size="large" buttonStyle="rounded" icon="location-filled" headline="Locations" onPress={() => {}} />
          <IconButton size="large" buttonStyle="rounded" icon="tag-filled" headline="Offers" onPress={() => {}} />
          <IconButton size="large" buttonStyle="rounded" icon="rewards-simple" multiColor headline="Disabled" disabled />
        </div>
      </div>
    </div>
  ),
};

export const UseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-24">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">TopAppBar actions</p>
        <div className="flex gap-wds-4 items-center">
          <IconButton icon="arrow-left" aria-label="Back" onPress={() => {}} />
          <IconButton icon="search" aria-label="Search" onPress={() => {}} />
          <IconButton icon="favorite-outline" aria-label="Favorite" onPress={() => {}} />
          <IconButton icon="close" aria-label="Close" onPress={() => {}} />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Quick actions grid</p>
        <div className="flex gap-wds-12 justify-center">
          <IconButton size="large" buttonStyle="squared" icon="rewards-simple" multiColor headline="Rewards" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="tag-filled" headline="Offers" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="order-history" headline="Reorder" onPress={() => {}} />
          <IconButton size="large" buttonStyle="squared" icon="location-filled" headline="Find" onPress={() => {}} />
        </div>
      </div>
    </div>
  ),
};
