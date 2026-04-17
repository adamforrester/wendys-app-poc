import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  decorators: [
    (Story) => (
      <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: 'wendysMobile' },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

/* ── Interactive wrapper ── */
function DialogDemo(props: Partial<React.ComponentProps<typeof Dialog>>) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div className="flex items-center justify-center h-full">
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      </div>
      <Dialog
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        primaryAction={{
          label: props.primaryAction?.label || 'Primary Action',
          onClick: () => setIsOpen(false),
          colorScheme: props.primaryAction?.colorScheme,
        }}
        secondaryAction={
          props.secondaryAction
            ? {
                label: props.secondaryAction.label || 'Secondary Action',
                onClick: () => setIsOpen(false),
                colorScheme: props.secondaryAction.colorScheme,
              }
            : undefined
        }
      />
    </>
  );
}

/* ── Standard ── */
export const Standard: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      icon="rewards-simple"
      iconMultiColor
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
      secondaryAction={{ label: 'Secondary Action', onClick: () => {} }}
    />
  ),
};

/* ── Standard without close X ── */
export const StandardNoClose: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      icon="rewards-simple"
      iconMultiColor
      headline="Confirm Action"
      supportText="Are you sure you want to proceed?"
      showClose={false}
      primaryAction={{ label: 'Confirm', onClick: () => {} }}
      secondaryAction={{ label: 'Cancel', onClick: () => {} }}
    />
  ),
};

/* ── Prompt (no secondary, no close X) ── */
export const Prompt: Story = {
  render: () => (
    <DialogDemo
      variant="prompt"
      icon="rewards-simple"
      iconMultiColor
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
    />
  ),
};

/* ── With Image ── */
export const WithImage: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      imageSrc="/images/product-images/food_hamburgers_daves-single_2376.png"
      imageAlt="Dave's Single"
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
      secondaryAction={{ label: 'Secondary Action', onClick: () => {} }}
    />
  ),
};

/* ── Fullscreen Standard ── */
export const FullscreenStandard: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      fullscreen
      icon="rewards-simple"
      iconMultiColor
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
      secondaryAction={{ label: 'Secondary Action', onClick: () => {} }}
    />
  ),
};

/* ── Fullscreen Prompt ── */
export const FullscreenPrompt: Story = {
  render: () => (
    <DialogDemo
      variant="prompt"
      fullscreen
      icon="rewards-simple"
      iconMultiColor
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
    />
  ),
};

/* ── Fullscreen with Image ── */
export const FullscreenWithImage: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      fullscreen
      imageSrc="/images/product-images/food_hamburgers_daves-single_2376.png"
      imageAlt="Dave's Single"
      headline="Dialog Headline"
      supportText="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
      primaryAction={{ label: 'Primary Action', onClick: () => {} }}
      secondaryAction={{ label: 'Secondary Action', onClick: () => {} }}
    />
  ),
};

/* ── Combo Confirm (realistic use case) ── */
export const ComboConfirm: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      showClose={false}
      headline="Leave combo builder?"
      supportText="Your combo selections will be lost."
      primaryAction={{ label: 'Stay', onClick: () => {}, colorScheme: 'secondary' }}
      secondaryAction={{ label: 'Leave', onClick: () => {} }}
    />
  ),
};

/* ── Primary Color Scheme ── */
export const PrimaryColorScheme: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      icon="rewards-simple"
      iconMultiColor
      headline="Item Added!"
      supportText="Baconator has been added to your bag."
      primaryAction={{ label: 'View Bag', onClick: () => {}, colorScheme: 'primary' }}
      secondaryAction={{ label: 'Keep Ordering', onClick: () => {} }}
    />
  ),
};

/* ── Headline Only ── */
export const HeadlineOnly: Story = {
  render: () => (
    <DialogDemo
      variant="prompt"
      headline="Are you sure?"
      primaryAction={{ label: 'Yes', onClick: () => {} }}
    />
  ),
};

/* ── With Custom Children ── */
export const WithCustomContent: Story = {
  render: () => (
    <DialogDemo
      variant="standard"
      headline="Choose Quantity"
      primaryAction={{ label: 'Done', onClick: () => {} }}
    >
      <div className="flex items-center justify-center gap-wds-16 py-wds-8">
        <button
          className="flex items-center justify-center rounded-wds-full"
          style={{
            width: 40,
            height: 40,
            border: '2px solid var(--color-border-secondary-default)',
            color: 'var(--color-text-secondary-default)',
            fontSize: 20,
          }}
        >
          -
        </button>
        <span
          className="font-display font-bold"
          style={{ fontSize: 24, color: 'var(--color-text-primary-default)' }}
        >
          1
        </span>
        <button
          className="flex items-center justify-center rounded-wds-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'var(--color-bg-brand-secondary-default)',
            color: 'var(--color-text-onbrand-default)',
            fontSize: 20,
          }}
        >
          +
        </button>
      </div>
    </DialogDemo>
  ),
};
