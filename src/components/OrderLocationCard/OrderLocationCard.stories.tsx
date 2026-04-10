import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderLocationCard, type PickupMethod } from './OrderLocationCard';

const defaultPickupMethods: PickupMethod[] = [
  { id: 'drive-thru', name: 'Drive Thru', imageSrc: '/images/nurdles/Drive Thru.svg', status: 'Open' },
  { id: 'dine-in', name: 'Dine In', imageSrc: '/images/nurdles/Dine In.svg', status: 'Open' },
  { id: 'carryout', name: 'Carryout', imageSrc: '/images/nurdles/Carryout-right.svg', status: 'Open' },
];

const mixedPickupMethods: PickupMethod[] = [
  { id: 'drive-thru', name: 'Drive Thru', imageSrc: '/images/nurdles/Drive Thru.svg', status: 'Open' },
  { id: 'dine-in', name: 'Dine In', imageSrc: '/images/nurdles/Dine In.svg', status: 'Closing Soon' },
  { id: 'carryout', name: 'Carryout', imageSrc: '/images/nurdles/Carryout-right.svg', status: 'Closed' },
];

const meta: Meta<typeof OrderLocationCard> = {
  title: 'Components/OrderLocationCard',
  component: OrderLocationCard,
  argTypes: {
    isExpanded: { control: 'boolean' },
    isFavorited: { control: 'boolean' },
  },
  args: {
    number: 1,
    storeName: "Wendy's #1247",
    address: '670 Bethel Rd, Columbus, OH 43214',
    distance: 0.8,
    isExpanded: false,
    isFavorited: false,
  },
  decorators: [(Story) => <div style={{ width: 390, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof OrderLocationCard>;

export const Playground: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(args.isExpanded);
    const [favorited, setFavorited] = useState(args.isFavorited ?? false);
    const [selectedMethod, setSelectedMethod] = useState<string | undefined>();
    return (
      <OrderLocationCard
        {...args}
        isExpanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isFavorited={favorited}
        onFavoriteToggle={setFavorited}
        pickupMethods={defaultPickupMethods}
        selectedPickupMethod={selectedMethod}
        onPickupMethodSelect={setSelectedMethod}
        labels={[
          { text: 'Nearest Location', state: 'success' },
        ]}
      />
    );
  },
};

export const CollapsedStates: Story = {
  render: () => (
    <div className="flex flex-col">
      <OrderLocationCard
        number={1}
        storeName="Wendy's #1247"
        address="670 Bethel Rd, Columbus, OH 43214"
        distance={0.8}
        isExpanded={false}
        onToggle={() => {}}
        isFavorited
        labels={[
          { text: 'Nearest Location', state: 'success' },
        ]}
        pickupMethods={defaultPickupMethods}
      />
      <OrderLocationCard
        number={2}
        storeName="Wendy's #3892"
        address="1455 Olentangy River Rd, Columbus, OH 43212"
        distance={2.3}
        isExpanded={false}
        onToggle={() => {}}
        labels={[
          { text: 'Closing Soon', state: 'caution' },
          { text: 'Lunch Only', state: 'secondary' },
        ]}
        pickupMethods={mixedPickupMethods}
      />
      <OrderLocationCard
        number={3}
        storeName="Wendy's #2104"
        address="3250 W Henderson Rd, Columbus, OH 43221"
        distance={4.1}
        isExpanded={false}
        onToggle={() => {}}
        pickupMethods={defaultPickupMethods}
      />
    </div>
  ),
};

export const ExpandedWithPickup: Story = {
  render: () => {
    const [selectedMethod, setSelectedMethod] = useState<string | undefined>();
    return (
      <OrderLocationCard
        number={1}
        storeName="Wendy's #1247"
        address="670 Bethel Rd, Columbus, OH 43214"
        distance={0.8}
        isExpanded
        onToggle={() => {}}
        isFavorited
        labels={[
          { text: 'Nearest Location', state: 'success' },
        ]}
        pickupMethods={defaultPickupMethods}
        selectedPickupMethod={selectedMethod}
        onPickupMethodSelect={setSelectedMethod}
      />
    );
  },
};

export const MixedPickupStatus: Story = {
  render: () => {
    const [selectedMethod, setSelectedMethod] = useState<string | undefined>('drive-thru');
    return (
      <OrderLocationCard
        number={2}
        storeName="Wendy's #3892"
        address="1455 Olentangy River Rd, Columbus, OH 43212"
        distance={2.3}
        isExpanded
        onToggle={() => {}}
        labels={[
          { text: 'Closing Soon', state: 'caution' },
        ]}
        pickupMethods={mixedPickupMethods}
        selectedPickupMethod={selectedMethod}
        onPickupMethodSelect={setSelectedMethod}
      />
    );
  },
};

export const InteractiveList: Story = {
  render: () => {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [favorites, setFavorites] = useState<Set<number>>(new Set([1]));
    const [selectedMethod, setSelectedMethod] = useState<string | undefined>();

    const locations = [
      { num: 1, name: "Wendy's #1247", addr: '670 Bethel Rd, Columbus, OH 43214', dist: 0.8, labels: [{ text: 'Nearest Location', state: 'success' as const }], methods: defaultPickupMethods },
      { num: 2, name: "Wendy's #3892", addr: '1455 Olentangy River Rd, Columbus, OH 43212', dist: 2.3, labels: [{ text: 'Closing Soon', state: 'caution' as const }], methods: mixedPickupMethods },
      { num: 3, name: "Wendy's #2104", addr: '3250 W Henderson Rd, Columbus, OH 43221', dist: 4.1, labels: [], methods: defaultPickupMethods },
      { num: 4, name: "Wendy's #5521", addr: '890 N High St, Columbus, OH 43215', dist: 5.6, labels: [], methods: defaultPickupMethods },
    ];

    return (
      <div className="flex flex-col">
        {locations.map(loc => (
          <OrderLocationCard
            key={loc.num}
            number={loc.num}
            storeName={loc.name}
            address={loc.addr}
            distance={loc.dist}
            isExpanded={expandedId === loc.num}
            onToggle={() => setExpandedId(expandedId === loc.num ? null : loc.num)}
            isFavorited={favorites.has(loc.num)}
            onFavoriteToggle={(fav) => {
              const next = new Set(favorites);
              fav ? next.add(loc.num) : next.delete(loc.num);
              setFavorites(next);
            }}
            labels={loc.labels}
            pickupMethods={loc.methods}
            selectedPickupMethod={selectedMethod}
            onPickupMethodSelect={setSelectedMethod}
          />
        ))}
      </div>
    );
  },
};
