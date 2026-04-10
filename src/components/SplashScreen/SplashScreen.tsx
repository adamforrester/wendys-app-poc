import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLottie } from 'lottie-react';

export type SplashAnimationType = 'lottie' | 'image' | 'video';

export interface SplashScreenProps {
  /** Cameo logo image path */
  cameoSrc?: string;
  /** Duration to show cameo in ms (default 1500) */
  cameoDuration?: number;
  /** Animation type for the splash phase */
  animationType?: SplashAnimationType;
  /** Lottie animation data (JSON object) — used when animationType='lottie' */
  lottieData?: object;
  /** Image/GIF/video source — used when animationType='image' or 'video' */
  animationSrc?: string;
  /** Duration to show the animation in ms (default 3000) */
  animationDuration?: number;
  /** Background color for both phases (default white) */
  backgroundColor?: string;
  /** Called when the entire splash sequence completes */
  onComplete: () => void;
}

type Phase = 'cameo' | 'animation' | 'fadeout' | 'done';

function LottiePlayer({ animationData }: { animationData: object }) {
  const { View } = useLottie({
    animationData,
    loop: false,
    style: { width: '100%', height: '100%', maxWidth: 390, maxHeight: 844 },
  });
  return View;
}

export function SplashScreen({
  cameoSrc = '/images/combined-full-color-logo.svg',
  cameoDuration = 1500,
  animationType = 'lottie',
  lottieData,
  animationSrc,
  animationDuration = 3000,
  backgroundColor = '#ffffff',
  onComplete,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('cameo');

  const advancePhase = useCallback(() => {
    setPhase(current => {
      if (current === 'cameo') return 'animation';
      if (current === 'animation') return 'fadeout';
      if (current === 'fadeout') return 'done';
      return current;
    });
  }, []);

  // Cameo timer
  useEffect(() => {
    if (phase !== 'cameo') return;
    const timer = setTimeout(advancePhase, cameoDuration);
    return () => clearTimeout(timer);
  }, [phase, cameoDuration, advancePhase]);

  // Animation timer
  useEffect(() => {
    if (phase !== 'animation') return;
    const timer = setTimeout(advancePhase, animationDuration);
    return () => clearTimeout(timer);
  }, [phase, animationDuration, advancePhase]);

  // Fadeout complete → done
  useEffect(() => {
    if (phase !== 'fadeout') return;
    const timer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 400);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="absolute inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor }}
        animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Cameo phase */}
        <AnimatePresence mode="wait">
          {phase === 'cameo' && (
            <motion.div
              key="cameo"
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={cameoSrc}
                alt="Wendy's"
                style={{ width: 120, height: 120 }}
              />
            </motion.div>
          )}

          {/* Animation phase */}
          {(phase === 'animation' || phase === 'fadeout') && (
            <motion.div
              key="animation"
              className="flex items-center justify-center w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {animationType === 'lottie' && lottieData && (
                <LottiePlayer animationData={lottieData} />
              )}
              {animationType === 'image' && animationSrc && (
                <img
                  src={animationSrc}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: 390, maxHeight: 844 }}
                />
              )}
              {animationType === 'video' && animationSrc && (
                <video
                  src={animationSrc}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: 390, maxHeight: 844 }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
