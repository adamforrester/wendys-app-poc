import type { Meta, StoryObj } from '@storybook/react';
import { IngredientTable } from './IngredientTable';

const meta: Meta<typeof IngredientTable> = {
  title: 'Components/IngredientTable',
  component: IngredientTable,
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof IngredientTable>;

export const Default: Story = {
  args: {
    rows: [
      { label: 'Calories', value: '850' },
      { label: 'Total Fat', value: '29g' },
      { label: 'Saturated Fat', value: '13g', indent: true },
      { label: 'Trans Fat', value: '0.5g', indent: true },
      { label: 'Cholesterol', value: '240mg' },
      { label: 'Sodium', value: '1030mg' },
      { label: 'Potassium', value: '6% DV' },
      { label: 'Carbohydrates', value: '130g' },
      { label: 'Fiber', value: '4g', indent: true },
      { label: 'Sugar', value: '79g', indent: true },
      { label: 'Protein', value: '17g' },
      { label: 'Calcium', value: '8% DV' },
      { label: 'Iron', value: '25% DV' },
    ],
  },
};

export const Simple: Story = {
  args: {
    rows: [
      { label: 'Calories', value: '470' },
      { label: 'Total Fat', value: '22g' },
      { label: 'Sodium', value: '960mg' },
      { label: 'Protein', value: '28g' },
    ],
  },
};
