import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BagProvider, useBag } from '../../context/BagContext';
import { TopAppBar } from './TopAppBar';

/** Seeds the bag with a mock item so BagButton renders */
function SeedBag({ children }: { children: React.ReactNode }) {
  const { dispatch } = useBag();
  useEffect(() => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: 'mock-1',
        menuItemId: 'daves-single',
        name: "Dave's Single",
        quantity: 2,
        price: 6.49,
        customizations: { removed: [] },
        comboSelections: null,
      },
    });
  }, [dispatch]);
  return <>{children}</>;
}

const meta: Meta<typeof TopAppBar> = {
  title: 'Components/TopAppBar',
  component: TopAppBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <BagProvider>
          <SeedBag>
            <div style={{ width: 390 }}>
              <Story />
            </div>
          </SeedBag>
        </BagProvider>
      </MemoryRouter>
    ),
  ],
  argTypes: {
    titleMode: { control: 'radio', options: ['logo', 'title'] },
    titlePlacement: { control: 'radio', options: ['center', 'left'] },
    showBackButton: { control: 'boolean' },
    showLoadingBar: { control: 'boolean' },
    showPoints: { control: 'boolean' },
    pointsLoading: { control: 'boolean' },
    points: { control: 'number' },
    showFind: { control: 'boolean' },
    showBag: { control: 'boolean' },
    title: { control: 'text' },
    logoSrc: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TopAppBar>;

/* ── Interactive playground ── */
export const Playground: Story = {
  args: {
    titleMode: 'logo',
    showPoints: true,
    points: 490,
    showFind: true,
    showBag: true,
  },
};

/* ── Home Screen (Logo + all trailing buttons) ── */
export const HomeScreen: Story = {
  render: () => (
    <TopAppBar
      titleMode="logo"
      showPoints
      points={490}
      showFind
      showBag
    />
  ),
};

/* ── Home Screen — Campaign Logo Swap ── */
export const CampaignLogo: Story = {
  render: () => (
    <TopAppBar
      titleMode="logo"
      logoSrc="/images/rewards-logo-white.svg"
      showPoints
      points={1250}
      showBag
    />
  ),
};

/* ── Title Center + Back + Bag ── */
export const TitleCenter: Story = {
  render: () => (
    <TopAppBar
      titleMode="title"
      title="Menu"
      titlePlacement="center"
      showBackButton
      showBag
    />
  ),
};

/* ── Title Left + Back ── */
export const TitleLeft: Story = {
  render: () => (
    <TopAppBar
      titleMode="title"
      title="Hamburgers"
      titlePlacement="left"
      showBackButton
      showBag
    />
  ),
};

/* ── Title Center — No Back Button ── */
export const TitleNoBack: Story = {
  render: () => (
    <TopAppBar
      titleMode="title"
      title="Offers"
      titlePlacement="center"
    />
  ),
};

/* ── Long Title Truncation ── */
export const LongTitle: Story = {
  render: () => (
    <TopAppBar
      titleMode="title"
      title="Dave's Single Combo Meal"
      titlePlacement="center"
      showBackButton
      showBag
    />
  ),
};

/* ── Points Only ── */
export const PointsOnly: Story = {
  render: () => (
    <TopAppBar
      titleMode="logo"
      showPoints
      points={2750}
    />
  ),
};

/* ── Loading Bar ── */
export const LoadingBar: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <TopAppBar titleMode="logo" showPoints points={490} showFind showBag showLoadingBar />
      <TopAppBar titleMode="title" title="Menu" titlePlacement="center" showBackButton showBag showLoadingBar />
      <TopAppBar titleMode="logo" showLoadingBar />
    </div>
  ),
};

/* ── Points Shimmer ── */
export const PointsShimmer: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <TopAppBar titleMode="logo" showPoints pointsLoading showFind showBag />
      <TopAppBar titleMode="logo" logoSrc="/images/rewards-logo-white.svg" showPoints pointsLoading />
      <TopAppBar titleMode="logo" showPoints points={4245} showFind showBag />
    </div>
  ),
};

/* ── All Variants Overview ── */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-4">
      <TopAppBar titleMode="logo" showPoints points={490} showFind showBag />
      <TopAppBar titleMode="title" title="Menu" titlePlacement="center" showBackButton showBag />
      <TopAppBar titleMode="title" title="Hamburgers" titlePlacement="left" showBackButton showBag />
      <TopAppBar titleMode="title" title="Offers" titlePlacement="center" />
      <TopAppBar titleMode="logo" logoSrc="/images/rewards-logo-white.svg" showPoints points={1250} showBag />
      <TopAppBar titleMode="title" title="Checkout" titlePlacement="center" showBackButton />
    </div>
  ),
};
