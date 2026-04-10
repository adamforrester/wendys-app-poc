import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductHeader } from './ProductHeader';

const meta: Meta<typeof ProductHeader> = {
  title: 'Components/ProductHeader',
  component: ProductHeader,
  args: {
    title: 'Baconator',
    price: '$8.99',
    calories: '960 Cal',
    sizeLabel: 'Med',
  },
  decorators: [(Story) => <div style={{ width: 390 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ProductHeader>;

export const Playground: Story = {};

export const AllConfigurations: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <ProductHeader
        title="Baconator"
        price="$8.99"
        calories="960 Cal"
        sizeLabel="Med"
        onSizePress={() => alert('Open size selector')}
        onNutritionPress={() => alert('Scroll to nutrition')}
      />
      <ProductHeader
        title="Dave's Single"
        price="$6.49"
        calories="590 Cal"
        onNutritionPress={() => {}}
      />
      <ProductHeader
        title="10 Pc. Spicy Chicken Nuggets"
        price="$4.99"
        calories="470 Cal"
        onNutritionPress={() => {}}
      />
      <ProductHeader
        title="Baconator Combo"
        price="$12.49"
        calories="1,430 Cal"
        sizeLabel="Large"
        onSizePress={() => {}}
        onNutritionPress={() => {}}
      />
    </div>
  ),
};

export const FavoritedState: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <ProductHeader
        title="Baconator"
        price="$8.99"
        calories="960 Cal"
        sizeLabel="Med"
        isFavorited={false}
        onNutritionPress={() => {}}
      />
      <ProductHeader
        title="Baconator"
        price="$8.99"
        calories="960 Cal"
        sizeLabel="Med"
        isFavorited
        onNutritionPress={() => {}}
      />
    </div>
  ),
};

export const NoSizeSelector: Story = {
  render: () => (
    <ProductHeader
      title="Jr. Bacon Cheeseburger"
      price="$3.49"
      calories="390 Cal"
      onNutritionPress={() => {}}
    />
  ),
};

export const ComboProduct: Story = {
  render: () => (
    <ProductHeader
      title="Baconator Combo"
      price="$12.49"
      calories="1,430 Cal"
      sizeLabel="Med"
      onSizePress={() => alert('Change combo size')}
      onNutritionPress={() => alert('View nutrition info')}
    />
  ),
};
