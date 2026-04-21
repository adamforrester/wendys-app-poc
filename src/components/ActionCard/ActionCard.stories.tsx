import type { Meta, StoryObj } from '@storybook/react';
import { ActionCard } from './ActionCard';

const meta: Meta<typeof ActionCard> = {
  title: 'Components/ActionCard',
  component: ActionCard,
  decorators: [
    (Story) => (
      <div style={{ width: 390, padding: 16, background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof ActionCard>;

/* ── Image Left, Outline CTA ── */
export const ImageLeftOutline: Story = {
  args: {
    overline: 'Overline',
    title: 'Baconator Fries',
    subtitle: '$3.99 | 480 Cal.',
    imageSrc: '/images/product-images/food_fries-sides_baconator-fries_217.png',
    imageSide: 'left',
    imageSize: 112,
    ctaType: 'outline',
    ctaLabel: 'Add to Bag',
    label: '$3.99',
  },
};

/* ── Image Right, Outline CTA ── */
export const ImageRightOutline: Story = {
  args: {
    overline: 'Limited Time',
    title: 'Classic Frosty',
    subtitle: '$1.00 | 4 Sizes',
    imageSrc: '/images/product-images/food_frosty-_classic-chocolate-frosty_179.png',
    imageSide: 'right',
    imageSize: 112,
    ctaType: 'outline',
    ctaLabel: 'Add to Bag',
  },
};

/* ── Image Left, Text CTA ── */
export const ImageLeftText: Story = {
  args: {
    title: 'Baconator Fries',
    subtitle: '$3.99 | 480 Cal.',
    imageSrc: '/images/product-images/food_fries-sides_baconator-fries_217.png',
    imageSide: 'left',
    imageSize: 112,
    ctaType: 'text',
    ctaLabel: 'Add to Bag',
  },
};

/* ── Small Image (48px) ── */
export const SmallImage: Story = {
  args: {
    overline: 'Add-on',
    title: 'Small Chili',
    subtitle: '$2.49',
    imageSrc: '/images/product-images/food_fries-sides_chili_170.png',
    imageSize: 48,
    ctaType: 'text',
    ctaLabel: 'Add to Bag',
  },
};

/* ── Image Right, Small ── */
export const ImageRightSmall: Story = {
  args: {
    title: 'Jr. Frosty',
    subtitle: 'Free with purchase',
    imageSrc: '/images/product-images/food_frosty-_classic-chocolate-frosty_179.png',
    imageSide: 'right',
    imageSize: 48,
    ctaType: 'outline',
    ctaLabel: 'Add',
  },
};

/* ── Title XS ── */
export const TitleXS: Story = {
  args: {
    title: 'Baconator Fries',
    subtitle: '$3.99 | 480 Cal.',
    titleSize: 'title-xs',
    imageSrc: '/images/product-images/food_fries-sides_baconator-fries_217.png',
    ctaType: 'text',
    ctaLabel: 'Add to Bag',
  },
};

/* ── Title 2XS ── */
export const Title2XS: Story = {
  args: {
    title: 'Caesar Salad',
    subtitle: '$1.99',
    titleSize: 'title-2xs',
    imageSrc: '/images/product-images/food_fresh-made-salads_parmesan-caesar-salad_1323.png',
    imageSize: 48,
    ctaType: 'text',
    ctaLabel: 'Add',
  },
};

/* ── No CTA ── */
export const NoCTA: Story = {
  args: {
    overline: 'Featured',
    title: "Dave's Single",
    subtitle: '$6.49 | 590 Cal.',
    imageSrc: '/images/product-images/food_hamburgers_dave-s-single_2387.png',
    ctaType: 'none',
    label: 'Popular',
  },
};

/* ── With Label ── */
export const WithLabel: Story = {
  args: {
    overline: 'Recommended',
    title: 'Baconator Fries',
    subtitle: '$3.99 | 480 Cal.',
    imageSrc: '/images/product-images/food_fries-sides_baconator-fries_217.png',
    label: '$3.99',
    ctaType: 'outline',
    ctaLabel: 'Add to Bag',
  },
};

/* ── Loading Skeleton ── */
export const Loading: Story = {
  args: {
    title: '',
    loading: true,
  },
};

/* ── No Image ── */
export const NoImage: Story = {
  args: {
    overline: 'Promo',
    title: 'Free Frosty with Any Purchase',
    subtitle: 'Limited time offer',
    ctaType: 'outline',
    ctaLabel: 'Apply',
  },
};

/* ── Bag Upsell Carousel Preview ── */
export const BagCarouselPreview: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, overflow: 'hidden', width: 358 }}>
      <div style={{ flexShrink: 0 }}>
        <ActionCard
          title="Baconator Fries"
          subtitle="$3.99 | 480 Cal."
          imageSrc="/images/product-images/food_fries-sides_baconator-fries_217.png"
          imageSide="right"
          imageSize={112}
          ctaType="text"
          ctaLabel="Add to Bag"
        />
      </div>
      <div style={{ flexShrink: 0 }}>
        <ActionCard
          title="Classic Frosty"
          subtitle="$1.00 | 4 Sizes"
          imageSrc="/images/product-images/food_frosty-_classic-chocolate-frosty_179.png"
          imageSide="right"
          imageSize={112}
          ctaType="text"
          ctaLabel="Add to Bag"
        />
      </div>
    </div>
  ),
};
