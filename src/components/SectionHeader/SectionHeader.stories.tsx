import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  argTypes: {
    size: { control: 'radio', options: ['large', 'small'] },
    padding: { control: 'boolean' },
    showRewardsIcon: { control: 'boolean' },
  },
  args: {
    title: 'Title',
    subtitle: 'Subtitle',
    size: 'large',
    padding: true,
  },
  decorators: [(Story) => <div style={{ width: 390 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col">
      <SectionHeader title="Large, Title Only" size="large" />
      <SectionHeader title="Large, With Subtitle" subtitle="Supporting description text" size="large" />
      <SectionHeader title="Large, With CTA" subtitle="Supporting text" size="large" ctaLabel="View All" onCtaPress={() => {}} />
      <SectionHeader title="Large, Kitchen Sink" subtitle="Not available for delivery" size="large" showRewardsIcon ctaLabel="View All" onCtaPress={() => {}} />
      <SectionHeader title="Small, Title Only" size="small" />
      <SectionHeader title="Small, With Subtitle" subtitle="Supporting text" size="small" />
      <SectionHeader title="Small, With CTA" subtitle="See what's new" size="small" ctaLabel="View All" onCtaPress={() => {}} />
      <SectionHeader title="Small, Kitchen Sink" subtitle="Earn points on every order" size="small" showRewardsIcon ctaLabel="View All" onCtaPress={() => {}} />
    </div>
  ),
};

export const RealUseCases: Story = {
  render: () => (
    <div className="flex flex-col">
      <SectionHeader title="Your Offers" subtitle="Not available for delivery orders" size="large" ctaLabel="View All" onCtaPress={() => {}} />
      <SectionHeader title="Order Again" subtitle="Your recent favorites" size="large" />
      <SectionHeader title="Trending Now" size="small" ctaLabel="See All" onCtaPress={() => {}} />
      <SectionHeader title="Earn Rewards" subtitle="490 Points available" size="small" showRewardsIcon />
      <SectionHeader title="Nearby Locations" size="small" ctaLabel="View Map" onCtaPress={() => {}} />
    </div>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <div className="flex flex-col">
      <SectionHeader title="With Padding" subtitle="16px left/right" size="large" padding />
      <SectionHeader title="No Padding" subtitle="Edge to edge" size="large" padding={false} />
    </div>
  ),
};
