import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplashScreen } from './SplashScreen';
import splashAnimation from '../../animations/lottie/splash.json';

const meta: Meta<typeof SplashScreen> = {
  title: 'Screens/SplashScreen',
  component: SplashScreen,
  argTypes: {
    cameoDuration: { control: 'number' },
    animationDuration: { control: 'number' },
    backgroundColor: { control: 'color' },
    animationType: { control: 'radio', options: ['lottie', 'image', 'video'] },
  },
  args: {
    cameoDuration: 1500,
    animationDuration: 3000,
    backgroundColor: '#ffffff',
    animationType: 'lottie',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', borderRadius: 20, background: '#000' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SplashScreen>;

export const Default: Story = {
  render: (args) => {
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);
    return (
      <>
        {done ? (
          <div className="flex flex-col items-center justify-center h-full gap-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
            <p className="font-display text-[20px] font-[800]">App Loaded!</p>
            <button
              className="font-display text-[14px] font-bold border-none bg-transparent underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
              onClick={() => { setDone(false); setKey(k => k + 1); }}
            >
              Replay Splash
            </button>
          </div>
        ) : (
          <SplashScreen
            key={key}
            {...args}
            lottieData={splashAnimation}
            onComplete={() => setDone(true)}
          />
        )}
      </>
    );
  },
};

export const QuickPreview: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);
    return (
      <>
        {done ? (
          <div className="flex flex-col items-center justify-center h-full gap-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
            <p className="font-display text-[20px] font-[800]">App Loaded!</p>
            <button
              className="font-display text-[14px] font-bold border-none bg-transparent underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
              onClick={() => { setDone(false); setKey(k => k + 1); }}
            >
              Replay
            </button>
          </div>
        ) : (
          <SplashScreen
            key={key}
            cameoDuration={800}
            animationDuration={1500}
            animationType="lottie"
            lottieData={splashAnimation}
            onComplete={() => setDone(true)}
          />
        )}
      </>
    );
  },
};

export const CampaignBackground: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);
    return (
      <>
        {done ? (
          <div className="flex flex-col items-center justify-center h-full gap-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
            <p className="font-display text-[20px] font-[800]">App Loaded!</p>
            <button
              className="font-display text-[14px] font-bold border-none bg-transparent underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
              onClick={() => { setDone(false); setKey(k => k + 1); }}
            >
              Replay
            </button>
          </div>
        ) : (
          <SplashScreen
            key={key}
            cameoDuration={1500}
            animationDuration={3000}
            backgroundColor="#C8102E"
            animationType="lottie"
            lottieData={splashAnimation}
            onComplete={() => setDone(true)}
          />
        )}
      </>
    );
  },
};

export const StaticImage: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);
    return (
      <>
        {done ? (
          <div className="flex flex-col items-center justify-center h-full gap-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
            <p className="font-display text-[20px] font-[800]">App Loaded!</p>
            <button
              className="font-display text-[14px] font-bold border-none bg-transparent underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
              onClick={() => { setDone(false); setKey(k => k + 1); }}
            >
              Replay
            </button>
          </div>
        ) : (
          <SplashScreen
            key={key}
            cameoDuration={1500}
            animationDuration={2000}
            animationType="image"
            animationSrc="/images/content-cards/content-card-large-placeholder-1.png"
            onComplete={() => setDone(true)}
          />
        )}
      </>
    );
  },
};

export const CameoOnly: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);
    return (
      <>
        {done ? (
          <div className="flex flex-col items-center justify-center h-full gap-wds-16" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
            <p className="font-display text-[20px] font-[800]">Cameo phase only</p>
            <button
              className="font-display text-[14px] font-bold border-none bg-transparent underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
              onClick={() => { setDone(false); setKey(k => k + 1); }}
            >
              Replay
            </button>
          </div>
        ) : (
          <SplashScreen
            key={key}
            cameoDuration={2000}
            animationDuration={0}
            onComplete={() => setDone(true)}
          />
        )}
      </>
    );
  },
};
