import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';

/**
 * Mounts the floating action button for the voice ordering experience.
 *
 * The FAB is the temporary entry point — it navigates to `/voice`, the
 * full-screen voice experience. Hidden when the flag is `off` or when we
 * are already on the voice screen. Final placement (bottom tab? home
 * sticky? global trigger?) is open and will replace this when chosen.
 */
export function VoiceOrderingLauncher() {
  const { flags } = useFeatureFlags();
  const navigate = useNavigate();
  const location = useLocation();

  const hidden = flags.voiceOrdering === 'off' || location.pathname === '/voice';

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          type="button"
          onClick={() => navigate('/voice')}
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
  );
}
