import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { VoiceOrderingPanel } from './VoiceOrderingPanel';

/**
 * Mounts the floating action button + voice panel.
 *
 * Single-line integration in App.tsx. Renders nothing when the voice
 * ordering flag is `off`. The FAB is intentionally lightweight and
 * temporary — final UX placement is open (tab? top-bar button? Apple-Intelligence-
 * style global trigger?). For now it sits above the bottom tab bar.
 */
export function VoiceOrderingLauncher() {
  const { flags } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false);

  if (flags.voiceOrdering === 'off') return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.94 }}
            className="absolute"
            aria-label="Open voice ordering"
            style={{
              right: 16,
              bottom: 110, // sits above the 90px tab bar with breathing room
              width: 56,
              height: 56,
              borderRadius: 9999,
              backgroundColor: 'var(--color-bg-brand-secondary-default)',
              boxShadow: 'var(--shadow-wds-l, 0 6px 16px rgba(0,0,0,0.18))',
              zIndex: 50,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 28,
                height: 28,
                backgroundColor: 'var(--color-text-onbrand-default)',
                maskImage: 'url(/icons/voice.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/voice.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
      <VoiceOrderingPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
