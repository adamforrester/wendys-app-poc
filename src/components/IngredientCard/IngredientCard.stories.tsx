import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IngredientCard } from './IngredientCard';

const meta: Meta<typeof IngredientCard> = {
  title: 'Components/IngredientCard',
  component: IngredientCard,
  argTypes: {
    state: { control: 'select', options: ['selected', 'unselected', 'required'] },
    editable: { control: 'boolean' },
  },
  args: {
    name: 'Ketchup',
    imageSrc: '/images/ingredient-images/ketchup-image.png',
    state: 'selected',
    editable: true,
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof IngredientCard>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-16">
      <p className="font-display text-[14px] font-bold">Selected + Editable</p>
      <div className="flex gap-wds-8">
        <IngredientCard name="Ketchup" imageSrc="/images/ingredient-images/ketchup-image.png" state="selected" editable onEdit={() => alert('Edit Ketchup')} />
        <IngredientCard name="Mustard" imageSrc="/images/ingredient-images/mustard-image.png" state="selected" editable />
        <IngredientCard name="Pickles" imageSrc="/images/ingredient-images/sea-salt.png" state="selected" editable />
      </div>

      <p className="font-display text-[14px] font-bold">Unselected + Editable</p>
      <div className="flex gap-wds-8">
        <IngredientCard name="Ketchup" imageSrc="/images/ingredient-images/ketchup-image.png" state="unselected" editable />
        <IngredientCard name="Mustard" imageSrc="/images/ingredient-images/mustard-image.png" state="unselected" editable />
        <IngredientCard name="Pickles" imageSrc="/images/ingredient-images/sea-salt.png" state="unselected" editable />
      </div>

      <p className="font-display text-[14px] font-bold">Selected + No Edit</p>
      <div className="flex gap-wds-8">
        <IngredientCard name="Lettuce" imageSrc="/images/ingredient-images/lettuce-image.png" state="selected" />
        <IngredientCard name="Tomato" imageSrc="/images/ingredient-images/tomato-image.png" state="selected" />
        <IngredientCard name="Onion" imageSrc="/images/ingredient-images/onion.png" state="selected" />
      </div>

      <p className="font-display text-[14px] font-bold">Unselected + No Edit</p>
      <div className="flex gap-wds-8">
        <IngredientCard name="Lettuce" imageSrc="/images/ingredient-images/lettuce-image.png" state="unselected" />
        <IngredientCard name="Tomato" imageSrc="/images/ingredient-images/tomato-image.png" state="unselected" />
      </div>

      <p className="font-display text-[14px] font-bold">Required (display-only)</p>
      <div className="flex gap-wds-8">
        <IngredientCard name="Potato Bun" imageSrc="/images/ingredient-images/premium-bun.png" state="required" />
        <IngredientCard name="Patty" imageSrc="/images/ingredient-images/patty.png" state="required" />
        <IngredientCard name="Cheese" imageSrc="/images/ingredient-images/american-cheese-slice.png" state="required" />
      </div>
    </div>
  ),
};

export const ThreeUpGrid: Story = {
  render: () => {
    interface IngState { id: string; name: string; img: string; selected: boolean; editable: boolean }
    const [ingredients, setIngredients] = useState<IngState[]>([
      { id: '1', name: 'Potato Bun', img: '/images/ingredient-images/premium-bun.png', selected: true, editable: false },
      { id: '2', name: 'Ketchup', img: '/images/ingredient-images/ketchup-image.png', selected: true, editable: true },
      { id: '3', name: 'Mustard', img: '/images/ingredient-images/mustard-image.png', selected: true, editable: true },
      { id: '4', name: 'Pickles', img: '/images/ingredient-images/sea-salt.png', selected: true, editable: true },
      { id: '5', name: 'Lettuce', img: '/images/ingredient-images/lettuce-image.png', selected: true, editable: false },
      { id: '6', name: 'Tomato', img: '/images/ingredient-images/tomato-image.png', selected: false, editable: false },
      { id: '7', name: 'Onion', img: '/images/ingredient-images/onion.png', selected: true, editable: false },
      { id: '8', name: 'Mayo', img: '/images/ingredient-images/mayonnaise-image.png', selected: true, editable: true },
      { id: '9', name: 'Bacon', img: '/images/ingredient-images/applewood-smoked-bacon.png', selected: true, editable: true },
    ]);

    const toggle = (id: string) => {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
    };

    return (
      <div style={{ width: 358 }}>
        <p className="font-display text-[18px] font-[800] mb-wds-12">What's On It</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            alignItems: 'stretch',
          }}
        >
          {ingredients.map(ing => (
            <IngredientCard
              key={ing.id}
              name={ing.name}
              imageSrc={ing.img}
              state={ing.id === '1' ? 'required' : ing.selected ? 'selected' : 'unselected'}
              editable={ing.editable}
              onToggle={() => toggle(ing.id)}
              onEdit={() => alert(`Edit: ${ing.name}`)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const MixedHeights: Story = {
  render: () => (
    <div style={{ width: 358 }}>
      <p className="font-display text-[14px] font-bold mb-wds-8">Row with mixed edit/no-edit (stretches to equal height)</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>
        <IngredientCard name="Ketchup" imageSrc="/images/ingredient-images/ketchup-image.png" state="selected" editable />
        <IngredientCard name="Lettuce" imageSrc="/images/ingredient-images/lettuce-image.png" state="selected" />
        <IngredientCard name="Mustard" imageSrc="/images/ingredient-images/mustard-image.png" state="selected" editable />
      </div>
    </div>
  ),
};
