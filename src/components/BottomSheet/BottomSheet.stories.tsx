import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatePresence } from 'framer-motion';
import { BottomSheet } from './BottomSheet';
import { Button } from '../Button/Button';

const meta: Meta<typeof BottomSheet> = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  decorators: [
    (Story) => (
      <div
        style={{
          width: 390,
          height: 844,
          position: 'relative',
          overflow: 'hidden',
          background: '#f5f5f5',
          borderRadius: 20,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

/* ── Interactive demo with open/close ── */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <div className="p-wds-16">
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open Bottom Sheet
          </Button>
        </div>
        <AnimatePresence>
          {open && (
            <BottomSheet isOpen={open} onClose={() => setOpen(false)} height="50%">
              <div className="px-wds-16">
                <h2 className="font-display text-[20px] font-[800] leading-[24px] m-0">
                  Sheet Title
                </h2>
                <p className="text-[14px] leading-[20px] text-[var(--color-text-secondary-default)] mt-wds-8">
                  This is a bottom sheet container. Drag the handle down to dismiss, or tap the scrim.
                </p>
              </div>
            </BottomSheet>
          )}
        </AnimatePresence>
      </>
    );
  },
};

/* ── Tall sheet (75%) ── */
export const TallSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <div className="p-wds-16">
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open Tall Sheet
          </Button>
        </div>
        <AnimatePresence>
          {open && (
            <BottomSheet isOpen={open} onClose={() => setOpen(false)} height="75%">
              <div className="px-wds-16">
                <h2 className="font-display text-[20px] font-[800] leading-[24px] m-0">
                  Combo Builder
                </h2>
                <p className="text-[14px] leading-[20px] text-[var(--color-text-secondary-default)] mt-wds-8">
                  Choose your drink
                </p>
              </div>
            </BottomSheet>
          )}
        </AnimatePresence>
      </>
    );
  },
};

/* ── Scrollable content ── */
export const Scrollable: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    return (
      <>
        <div className="p-wds-16">
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open Scrollable Sheet
          </Button>
        </div>
        <AnimatePresence>
          {open && (
            <BottomSheet isOpen={open} onClose={() => setOpen(false)} height="60%" scrollable>
              <div className="px-wds-16">
                <h2 className="font-display text-[20px] font-[800] leading-[24px] m-0 mb-wds-12">
                  Select a Location
                </h2>
                {items.map((item) => (
                  <div
                    key={item}
                    className="py-wds-12 border-b border-[var(--color-border-tertiary-default)]"
                  >
                    <span className="text-[16px] leading-[24px]">{item}</span>
                  </div>
                ))}
              </div>
            </BottomSheet>
          )}
        </AnimatePresence>
      </>
    );
  },
};

/* ── Fixed pixel height ── */
export const FixedHeight: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <div className="p-wds-16">
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open Fixed Height (300px)
          </Button>
        </div>
        <AnimatePresence>
          {open && (
            <BottomSheet isOpen={open} onClose={() => setOpen(false)} height={300}>
              <div className="px-wds-16">
                <h2 className="font-display text-[20px] font-[800] leading-[24px] m-0">
                  Fixed Height
                </h2>
                <p className="text-[14px] leading-[20px] text-[var(--color-text-secondary-default)] mt-wds-8">
                  This sheet is exactly 300px tall.
                </p>
              </div>
            </BottomSheet>
          )}
        </AnimatePresence>
      </>
    );
  },
};

/* ── No handle ── */
export const NoHandle: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <div className="p-wds-16">
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open (No Handle)
          </Button>
        </div>
        <AnimatePresence>
          {open && (
            <BottomSheet isOpen={open} onClose={() => setOpen(false)} height="40%" showHandle={false}>
              <div className="px-wds-16 pt-wds-16">
                <h2 className="font-display text-[20px] font-[800] leading-[24px] m-0">
                  No Handle
                </h2>
                <p className="text-[14px] leading-[20px] text-[var(--color-text-secondary-default)] mt-wds-8">
                  Dismiss by tapping the scrim only.
                </p>
              </div>
            </BottomSheet>
          )}
        </AnimatePresence>
      </>
    );
  },
};
