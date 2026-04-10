import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuCard } from './MenuCard';

const meta: Meta<typeof MenuCard> = {
  title: 'Components/MenuCard',
  component: MenuCard,
  argTypes: {
    disabled: { control: 'boolean' },
    showRewardsIcon: { control: 'boolean' },
  },
  args: {
    title: 'Baconator',
    subtitle: '$8.99 | 960 Cal',
    imageSrc: '/images/product-images/food_hamburgers_baconator_702.png',
    showRewardsIcon: true,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof MenuCard>;

export const Playground: Story = {};

export const TwoUpGrid: Story = {
  render: () => (
    <div
      className="grid grid-cols-2 gap-wds-12 p-wds-16"
      style={{ width: 390, alignItems: 'stretch' }}
    >
      <MenuCard title="Baconator" subtitle="$8.99 | 960 Cal" imageSrc="/images/product-images/food_hamburgers_baconator_2390.png" showRewardsIcon onPress={() => {}} />
      <MenuCard title="Dave's Single" subtitle="$6.49 | 590 Cal" imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png" showRewardsIcon onPress={() => {}} />
      <MenuCard title="Spicy Nuggets" subtitle="$4.99 | 470 Cal" imageSrc="/images/product-images/food_chicken-nuggets-more_10-pc-spicy-chicken-nuggets_944.png" showRewardsIcon label={{ text: 'Fan Favorite', state: 'primary' }} onPress={() => {}} />
      <MenuCard title="Classic Frosty" subtitle="$2.49 | 340 Cal" imageSrc="/images/product-images/food_frosty-_classic-chocolate-frosty_179.png" showRewardsIcon onPress={() => {}} />
      <MenuCard title="Biggie Bag" subtitle="$5.00" imageSrc="/images/product-images/food_biggie-deals-_jr-bacon-cheeseburger-biggie-bag_1761.png" showRewardsIcon label={{ text: 'Great Value', state: 'primary' }} onPress={() => {}} />
      <MenuCard title="Big Bacon Classic" subtitle="$7.99 | 810 Cal" imageSrc="/images/product-images/food_hamburgers_big-bacon-classic_2399.png" onPress={() => {}} />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-wds-12 p-wds-16" style={{ width: 390, alignItems: 'stretch' }}>
      <MenuCard title="Baconator" subtitle="$8.99 | 960 Cal" imageSrc="/images/product-images/food_hamburgers_baconator_2390.png" showRewardsIcon label={{ text: 'New Item', state: 'primary' }} onPress={() => {}} />
      <MenuCard title="Dave's Single" subtitle="$6.49 | 590 Cal" imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png" showRewardsIcon onPress={() => {}} />
      <MenuCard title="Spicy Nuggets" subtitle="$4.99 | 470 Cal" imageSrc="/images/product-images/food_chicken-nuggets-more_10-pc-spicy-chicken-nuggets_944.png" showRewardsIcon label={{ text: 'Limited Time', state: 'primary' }} onPress={() => {}} />
      <MenuCard title="Classic Frosty" subtitle="$2.49 | 340 Cal" imageSrc="/images/product-images/food_frosty-_classic-chocolate-frosty_179.png" showRewardsIcon label={{ text: '50 Points', state: 'secondary' }} onPress={() => {}} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Enabled</p>
        <div className="flex gap-wds-12">
          <MenuCard title="Baconator" subtitle="$8.99 | 960 Cal" imageSrc="/images/product-images/food_hamburgers_baconator_2390.png" showRewardsIcon onPress={() => {}} />
          <MenuCard title="With Label" subtitle="$6.49" imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png" label={{ text: 'New', state: 'primary' }} onPress={() => {}} />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Disabled</p>
        <div className="flex gap-wds-12">
          <MenuCard title="Baconator" subtitle="$8.99 | 960 Cal" imageSrc="/images/product-images/food_hamburgers_baconator_2390.png" showRewardsIcon disabled />
          <MenuCard title="With Label" subtitle="$6.49" imageSrc="/images/product-images/food_hamburgers_dave-s-single_2387.png" label={{ text: 'Unavailable', state: 'unavailable' }} disabled />
        </div>
      </div>
    </div>
  ),
};

export const EqualHeightRows: Story = {
  render: () => (
    <div className="p-wds-16" style={{ width: 390 }}>
      <p className="font-display text-[14px] font-bold mb-wds-8">Cards stretch to equal height in each row</p>
      <div className="grid grid-cols-2 gap-wds-12" style={{ alignItems: 'stretch' }}>
        <MenuCard title="Short Title" subtitle="$4.99" imageSrc="/images/product-images/food_frosty-_classic-chocolate-frosty_179.png" onPress={() => {}} />
        <MenuCard title="Longer Product Title That Wraps" subtitle="$8.99 | 590-1010 Cal" imageSrc="/images/product-images/food_hamburgers_baconator_2390.png" showRewardsIcon label={{ text: 'Fan Favorite', state: 'primary' }} onPress={() => {}} />
      </div>
    </div>
  ),
};
