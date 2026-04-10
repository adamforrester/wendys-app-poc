import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryCard } from './CategoryCard';

const categories = [
  { title: 'Combos', image: '/images/category-images/category_combos_2492.png' },
  { title: 'Hamburgers', image: '/images/category-images/category_hamburgers_2493.png' },
  { title: 'Chicken & Nuggets', image: '/images/category-images/category_chicken-nuggets-more_2494.png' },
  { title: 'Tenders', image: '/images/category-images/category_tenders_2243.png' },
  { title: 'Fries & Sides', image: '/images/category-images/category_fries-sides_125.png' },
  { title: 'Frosty', image: '/images/category-images/category_frosty_126.png' },
  { title: 'Beverages', image: '/images/category-images/category_beverages_127.png' },
  { title: 'Salads', image: '/images/category-images/category_fresh-made-salads_2495.png' },
  { title: "Kid's Meal", image: '/images/category-images/category_kids-meal_129.png' },
  { title: 'Bakery', image: '/images/category-images/category_bakery_131.png' },
  { title: 'Coffee', image: '/images/category-images/category_coffee_895.png' },
  { title: 'Biggie Deals', image: '/images/category-images/category_biggie-deals_130.png' },
  { title: 'Value', image: '/images/category-images/category_everyday-value_2496.png' },
  { title: 'Give Back', image: '/images/category-images/category_give-something-back_1534.png' },
];

const meta: Meta<typeof CategoryCard> = {
  title: 'Components/CategoryCard',
  component: CategoryCard,
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    title: 'Combos',
    imageSrc: categories[0].image,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof CategoryCard>;

export const Playground: Story = {};

export const TwoUpGrid: Story = {
  render: () => (
    <div
      className="flex flex-wrap justify-center gap-wds-12 p-wds-16"
      style={{ width: 390 }}
    >
      {categories.slice(0, 8).map((cat) => (
        <CategoryCard
          key={cat.title}
          title={cat.title}
          imageSrc={cat.image}
          onPress={() => console.log(`Tapped: ${cat.title}`)}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16 p-wds-16">
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Enabled</p>
        <div className="flex gap-wds-12">
          <CategoryCard title="Combos" imageSrc={categories[0].image} onPress={() => {}} />
          <CategoryCard title="Hamburgers" imageSrc={categories[1].image} onPress={() => {}} />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Disabled</p>
        <div className="flex gap-wds-12">
          <CategoryCard title="Combos" imageSrc={categories[0].image} disabled />
          <CategoryCard title="Hamburgers" imageSrc={categories[1].image} disabled />
        </div>
      </div>
      <div>
        <p className="font-display text-[14px] font-bold mb-wds-8">Fallback (broken image)</p>
        <div className="flex gap-wds-12">
          <CategoryCard title="Combos" imageSrc="/images/nonexistent.png" />
          <CategoryCard title="Custom Fallback" imageSrc="/images/nonexistent.png" fallbackSrc="/images/rewards-logo-red.svg" />
        </div>
      </div>
    </div>
  ),
};

export const FullCategoryPage: Story = {
  render: () => (
    <div style={{ width: 390, backgroundColor: 'var(--color-bg-primary-default)' }}>
      <div className="px-wds-16 py-wds-12">
        <span className="font-display text-[20px] font-[800] leading-[24px]">Menu</span>
      </div>
      <div className="flex flex-wrap justify-center gap-wds-12 px-wds-16 pb-wds-16">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            imageSrc={cat.image}
            onPress={() => console.log(`Navigate to: ${cat.title}`)}
          />
        ))}
      </div>
    </div>
  ),
};
