import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentCard } from './ContentCard';

const meta: Meta<typeof ContentCard> = {
  title: 'Components/ContentCard',
  component: ContentCard,
  argTypes: {
    size: { control: 'radio', options: ['large', 'small'] },
    loading: { control: 'boolean' },
    imageSrc: { control: 'text' },
  },
  args: {
    size: 'large',
    loading: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 390, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentCard>;

export const Playground: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Large (358×224)</p>
        <ContentCard size="large" />
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Small (358×144)</p>
        <ContentCard size="small" />
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Large — Loading</p>
        <ContentCard size="large" loading />
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Small — Loading</p>
        <ContentCard size="small" loading />
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <ContentCard size="large" onPress={() => alert('Large card tapped!')} />
      <ContentCard size="small" onPress={() => alert('Small card tapped!')} />
    </div>
  ),
};

export const CustomImages: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <ContentCard
        size="large"
        imageSrc="https://placehold.co/358x224/C8102E/FFFFFF?text=Promo+Banner"
        imageAlt="Promotional banner"
      />
      <ContentCard
        size="small"
        imageSrc="https://placehold.co/358x144/0077A3/FFFFFF?text=Offer+Card"
        imageAlt="Offer card"
      />
    </div>
  ),
};
