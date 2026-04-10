import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IngredientCollapse } from './IngredientCollapse';

const meta: Meta<typeof IngredientCollapse> = {
  title: 'Components/IngredientCollapse',
  component: IngredientCollapse,
  argTypes: {
    leading: { control: 'radio', options: ['image', 'icon', 'none'] },
    modifierType: { control: 'radio', options: ['chips', 'counter', 'none'] },
    headline: { control: 'text' },
    subtitle: { control: 'text' },
    trailing: { control: 'text' },
    caption: { control: 'text' },
  },
  args: {
    headline: 'Headline',
    subtitle: '',
    trailing: 'Trailing',
    caption: 'Caption',
    leading: 'image',
    imageSrc: '/images/product-images/food_beverages_coca-cola-freestyle_425.png',
    checked: true,
    modifierType: 'chips',
    chipOptions: [
      { id: 'lite', label: 'Lite' },
      { id: 'reg', label: 'Reg' },
      { id: 'xtra', label: 'Xtra' },
    ],
    selectedChip: 'reg',
  },
  decorators: [(Story) => <div style={{ width: 390 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof IngredientCollapse>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? true);
    const [chip, setChip] = useState(args.selectedChip ?? 'reg');
    const [count, setCount] = useState(1);
    return (
      <IngredientCollapse
        {...args}
        checked={checked}
        onCheckedChange={setChecked}
        selectedChip={chip}
        onChipSelect={setChip}
        counterValue={count}
        counterMin={0}
        counterMax={5}
        onCounterChange={setCount}
      />
    );
  },
};

const amountChips = [
  { id: 'lite', label: 'Lite' },
  { id: 'reg', label: 'Reg' },
  { id: 'xtra', label: 'Xtra' },
];

export const ChipModifier: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    const [chip, setChip] = useState('reg');
    return (
      <IngredientCollapse
        headline="Mustard"
        leading="image"
        imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
        checked={checked}
        onCheckedChange={setChecked}
        modifierType="chips"
        chipOptions={amountChips}
        selectedChip={chip}
        onChipSelect={setChip}
      />
    );
  },
};

export const CounterModifier: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    const [count, setCount] = useState(1);
    return (
      <IngredientCollapse
        headline="Applewood Smoked Bacon"
        subtitle="Hardwood smoked"
        trailing="+$1.80"
        caption="per slice"
        leading="image"
        imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
        checked={checked}
        onCheckedChange={setChecked}
        modifierType="counter"
        counterValue={count}
        counterMin={0}
        counterMax={5}
        onCounterChange={setCount}
      />
    );
  },
};

export const TextVariations: Story = {
  render: () => {
    const [c1, setC1] = useState(true);
    const [c2, setC2] = useState(true);
    const [c3, setC3] = useState(true);
    const [c4, setC4] = useState(false);
    return (
      <div>
        <IngredientCollapse
          headline="1-Line: Ketchup"
          leading="image"
          imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
          checked={c1}
          onCheckedChange={setC1}
          modifierType="chips"
          chipOptions={amountChips}
          selectedChip="reg"
          onChipSelect={() => {}}
        />
        <IngredientCollapse
          headline="2-Line: Smoked Bacon"
          subtitle="Applewood smoked, thick cut"
          trailing="+$1.80"
          leading="image"
          imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
          checked={c2}
          onCheckedChange={setC2}
          modifierType="counter"
          counterValue={1}
          onCounterChange={() => {}}
        />
        <IngredientCollapse
          headline="With Trailing + Caption"
          trailing="+$0.60"
          caption="per slice"
          leading="image"
          imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
          checked={c3}
          onCheckedChange={setC3}
          modifierType="chips"
          chipOptions={amountChips}
          selectedChip="reg"
          onChipSelect={() => {}}
        />
        <IngredientCollapse
          headline="No Image, Unselected"
          trailing="+$0.50"
          checked={c4}
          onCheckedChange={setC4}
          modifierType="chips"
          chipOptions={amountChips}
          selectedChip="reg"
          onChipSelect={() => {}}
        />
      </div>
    );
  },
};

export const FourChips: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    const [chip, setChip] = useState('reg');
    return (
      <IngredientCollapse
        headline="Lettuce"
        leading="image"
        imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
        checked={checked}
        onCheckedChange={setChecked}
        modifierType="chips"
        chipOptions={[
          { id: 'none', label: 'None' },
          { id: 'lite', label: 'Lite' },
          { id: 'reg', label: 'Reg' },
          { id: 'xtra', label: 'Xtra' },
        ]}
        selectedChip={chip}
        onChipSelect={setChip}
      />
    );
  },
};

export const FullSPPExample: Story = {
  render: () => {
    interface Ingredient {
      id: string; name: string; checked: boolean; modifier: 'chips' | 'counter' | 'none'; chip: string; price?: string; count?: number;
    }
    const [ingredients, setIngredients] = useState<Ingredient[]>([
      { id: 'ketchup', name: 'Ketchup', checked: false, modifier: 'chips', chip: 'reg' },
      { id: 'mustard', name: 'Mustard', checked: true, modifier: 'chips', chip: 'reg' },
      { id: 'onion', name: 'Sweet Onion', checked: false, modifier: 'chips', chip: 'reg' },
      { id: 'bacon', name: 'Applewood Smoked Bacon', checked: true, modifier: 'counter', chip: 'reg', price: '+$1.80', count: 1 },
      { id: 'cheese', name: 'Asiago Cheese', checked: false, modifier: 'none', chip: 'reg', price: '+$0.60' },
      { id: 'american', name: 'American Cheese Slice', checked: false, modifier: 'none', chip: 'reg', price: '+$0.80' },
      { id: 'sauce', name: "Wendy's Signature Dipping Sauce", checked: false, modifier: 'none', chip: 'reg', price: '+$0.50' },
    ]);

    const toggle = (id: string) => {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const setChip = (id: string, chip: string) => {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, chip } : i));
    };

    const setCount = (id: string, count: number) => {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, count } : i));
    };

    return (
      <div>
        {ingredients.map(ing => (
          <IngredientCollapse
            key={ing.id}
            headline={ing.name}
            trailing={ing.price}
            leading="image"
            imageSrc="/images/product-images/food_beverages_coca-cola-freestyle_425.png"
            checked={ing.checked}
            onCheckedChange={() => toggle(ing.id)}
            modifierType={ing.modifier}
            chipOptions={ing.modifier === 'chips' ? [
              { id: 'lite', label: 'Lite' },
              { id: 'reg', label: 'Reg' },
              { id: 'xtra', label: 'Xtra' },
            ] : undefined}
            selectedChip={ing.chip}
            onChipSelect={(chip) => setChip(ing.id, chip)}
            counterValue={ing.count ?? 0}
            counterMin={0}
            counterMax={5}
            onCounterChange={(count) => setCount(ing.id, count)}
          />
        ))}
      </div>
    );
  },
};
