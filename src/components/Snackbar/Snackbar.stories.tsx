import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatePresence } from 'framer-motion';
import { Snackbar } from './Snackbar';
import { Button } from '../Button/Button';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Snackbar',
  component: Snackbar,
  decorators: [
    (Story) => (
      <div style={{ width: 390, height: 300, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

export const BasicMessage: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <>
        {!show && <Button variant="filled" onClick={() => setShow(true)}>Show Snackbar</Button>}
        <AnimatePresence>
          {show && <Snackbar message="Item added to bag" onClose={() => setShow(false)} />}
        </AnimatePresence>
      </>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <>
        {!show && <Button variant="filled" onClick={() => setShow(true)}>Show Snackbar</Button>}
        <AnimatePresence>
          {show && (
            <Snackbar
              message="Item added to bag"
              actionLabel="View Bag"
              onAction={() => alert('Navigate to bag')}
              onClose={() => setShow(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  },
};

export const WithClose: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <>
        {!show && <Button variant="filled" onClick={() => setShow(true)}>Show Snackbar</Button>}
        <AnimatePresence>
          {show && (
            <Snackbar
              message="Item added to bag"
              showClose
              onClose={() => setShow(false)}
              duration={0}
            />
          )}
        </AnimatePresence>
      </>
    );
  },
};

export const WithActionAndClose: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <>
        {!show && <Button variant="filled" onClick={() => setShow(true)}>Show Snackbar</Button>}
        <AnimatePresence>
          {show && (
            <Snackbar
              message="Item added to bag"
              actionLabel="View Bag"
              onAction={() => alert('Navigate to bag')}
              showClose
              onClose={() => setShow(false)}
              duration={0}
            />
          )}
        </AnimatePresence>
      </>
    );
  },
};

export const MultiLine: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <>
        {!show && <Button variant="filled" onClick={() => setShow(true)}>Show Snackbar</Button>}
        <AnimatePresence>
          {show && (
            <Snackbar
              message="Your Baconator Combo has been added to your bag with no onion and extra pickles."
              actionLabel="View Bag"
              onAction={() => alert('Navigate to bag')}
              showClose
              onClose={() => setShow(false)}
              multiLine
              duration={0}
            />
          )}
        </AnimatePresence>
      </>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-wds-12">
      <Snackbar message="Single line, no action" onClose={() => {}} duration={0} />
      <Snackbar message="Single line with close" showClose onClose={() => {}} duration={0} />
      <Snackbar message="Single line with action" actionLabel="Undo" onAction={() => {}} onClose={() => {}} duration={0} />
      <Snackbar message="Single line, action + close" actionLabel="View Bag" showClose onAction={() => {}} onClose={() => {}} duration={0} />
      <Snackbar message="Multi-line snackbar with longer text that wraps to demonstrate the vertical layout." multiLine onClose={() => {}} duration={0} />
      <Snackbar message="Multi-line with action and close button for longer messages." actionLabel="Button" showClose multiLine onAction={() => {}} onClose={() => {}} duration={0} />
    </div>
  ),
};
