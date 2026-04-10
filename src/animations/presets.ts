import type { Variants, Transition } from 'framer-motion';

/* ── Shared spring configs ── */
export const springSnappy: Transition = { type: 'spring', stiffness: 400, damping: 30 };
export const springGentle: Transition = { type: 'spring', stiffness: 260, damping: 20 };
export const springSheet: Transition = { type: 'spring', stiffness: 300, damping: 30 };

/* ── Page / Screen transitions ── */
export const slideFromRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: springSnappy },
  exit: { x: '-30%', opacity: 0, transition: { duration: 0.2 } },
};

export const slideFromBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: springSheet },
  exit: { y: '100%', transition: { duration: 0.25 } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* ── Bottom Sheet ── */
export const bottomSheet: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: springSheet },
  exit: { y: '100%', transition: { duration: 0.25 } },
};

/* ── Snackbar ── */
export const snackbar: Variants = {
  initial: { y: 80, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: springSnappy },
  exit: { y: 80, opacity: 0, transition: { duration: 0.2 } },
};

/* ── Button press ── */
export const buttonPress: Variants = {
  idle: { scale: 1 },
  pressed: { scale: 0.96 },
};

/* ── List stagger ── */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/* ── Skeleton shimmer (CSS class — not a variant) ── */
export const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;
