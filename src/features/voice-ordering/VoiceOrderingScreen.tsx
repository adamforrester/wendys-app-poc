/**
 * Full-screen voice ordering experience.
 *
 * Layout (top → bottom):
 *   1. Status-bar safe area + back arrow (top-left)
 *   2. Large agent text with active-word highlighting
 *   3. Stack of bag-item tiles that animate in as the agent confirms items
 *   4. Lottie voice animation that plays while the agent is speaking
 *   5. "Review in bag" CTA when an order is fully resolved
 *
 * Design intent:
 *   - Voice-first: no chat scrollback, no text input, no header band
 *   - Drive-thru feel: items appear visibly as they're added so the user
 *     sees their order build up in real time
 *   - Cream background, dark text, brand-red emphasis on the active word
 *
 * Reuses the same hooks as the chat panel — useClaudeConversation drives
 * the conversation, useTTS speaks, useSpeechInput listens. The mic loop
 * still re-opens once per assistant turn after TTS finishes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLottie } from 'lottie-react';
import voiceAnimation from '../../animations/lottie/voice-animation.json';
import { useBag } from '../../context/BagContext';
import { useStatusBarMode } from '../../context/StatusBarModeContext';
import { useClaudeConversation } from './useClaudeConversation';
import { useSpeechInput } from './useSpeechInput';
import { useTTS } from './useTTS';
import { useSpokenHighlight, type SpokenToken } from './useSpokenHighlight';
import { VoiceBagItemTile } from './VoiceBagItemTile';

export function VoiceOrderingScreen() {
  const navigate = useNavigate();
  const { messages, pending, error, send, mode, lastParsedOrder } = useClaudeConversation();
  const { state: bagState } = useBag();
  // Cream background → dark status bar tint while this screen is mounted.
  useStatusBarMode('dark');
  // Tracks the bag-item ids that already existed before the user opened
  // this screen so we don't animate them in. Anything new is treated as a
  // voice add and gets the entrance animation.
  const preExistingIdsRef = useRef<Set<string>>(new Set());
  const [voiceLoopPaused, setVoiceLoopPaused] = useState(false);
  const lastSpokenIdRef = useRef<string | null>(null);
  const lastAutoListenIdRef = useRef<string | null>(null);
  const userActivatedRef = useRef(false);

  const highlight = useSpokenHighlight();

  const tts = useTTS({
    enabled: mode === 'live',
    onPlaybackStart: highlight.attach,
  });

  const speech = useSpeechInput({
    onAutoSubmit: (transcript) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;
      void send(trimmed);
    },
  });

  // Capture pre-existing bag ids exactly once, on mount.
  useEffect(() => {
    preExistingIdsRef.current = new Set(bagState.items.map(i => i.id));
    // intentionally no deps — only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Greet on first mount.
  useEffect(() => {
    if (messages.length === 0 && mode !== 'off') {
      void send('hi');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Latest assistant message — drives the displayed text and the
  // word-highlighting timing.
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  // Speak each new assistant message in 'live' mode. In 'mock' mode we
  // don't have a real audio clip, so highlighting is bypassed (the full
  // text is shown without animation).
  useEffect(() => {
    if (!lastAssistant) return;
    if (lastSpokenIdRef.current === lastAssistant.id) return;
    lastSpokenIdRef.current = lastAssistant.id;
    setVoiceLoopPaused(false);
    if (mode === 'live') {
      void tts.speak(lastAssistant.content);
    } else {
      // Show the whole reply at once when there's no audio to drive timing.
      highlight.reset();
    }
  }, [lastAssistant, mode, tts, highlight]);

  // Auto-listen loop — open the mic once per assistant turn, after TTS
  // finishes. Same pattern as the panel; intentionally not extracted yet.
  useEffect(() => {
    if (mode === 'off') return;
    if (!speech.supported) return;
    if (!userActivatedRef.current) return;
    if (pending || tts.isPlaying) return;
    if (voiceLoopPaused) return;
    if (speech.listening) return;
    if (!lastAssistant) return;
    if (lastAutoListenIdRef.current === lastAssistant.id) return;
    lastAutoListenIdRef.current = lastAssistant.id;
    speech.start();
  }, [lastAssistant, mode, pending, tts.isPlaying, voiceLoopPaused, speech]);

  // Stop everything on unmount.
  useEffect(() => {
    return () => {
      tts.stop();
      speech.stop();
      highlight.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleMicTap = useCallback(() => {
    userActivatedRef.current = true;
    if (speech.listening) {
      speech.stop();
      setVoiceLoopPaused(true);
      return;
    }
    setVoiceLoopPaused(false);
    speech.start();
  }, [speech]);

  const handleReviewBag = useCallback(() => {
    navigate('/order/bag');
  }, [navigate]);

  // Items added during this voice session — newest first so the most
  // recent item appears at the top of the stack (closest to the agent
  // text, like a receipt unfurling toward the camera).
  const voiceItems = useMemo(() => {
    const pre = preExistingIdsRef.current;
    return bagState.items.filter(i => !pre.has(i.id)).slice().reverse();
  }, [bagState.items]);

  const orderComplete = !!lastParsedOrder?.fullyResolved;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--color-bg-secondary-default)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Voice ordering"
    >
      {/* Top bar — back arrow only. Status bar overlays this region.
          16px gap between the arrow and the agent text below. */}
      <div
        style={{
          paddingTop: 54, // status bar safe area
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 16,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Close voice ordering"
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            border: 'none',
            backgroundColor: 'var(--color-bg-primary-default)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
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
              width: 22,
              height: 22,
              backgroundColor: 'var(--color-text-primary-default)',
              maskImage: 'url(/icons/arrow-left.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/icons/arrow-left.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }}
          />
        </button>
      </div>

      {/* Main content. flex:1 so the lottie + CTA always sit at the bottom */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingBottom: 16,
          }}
        >
          <AgentSpokenText
            text={lastAssistant?.content ?? ''}
            tokens={highlight.tokens}
            activeIndex={highlight.activeIndex}
            useHighlight={mode === 'live' && tts.isPlaying}
            pending={pending}
          />

          {/* Stacked bag tiles. AnimatePresence triggers the entrance
              animation when a new item arrives via the parsed order. */}
          {voiceItems.length > 0 && (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              aria-label="Items in your order"
            >
              <AnimatePresence initial={false}>
                {voiceItems.map(item => (
                  <VoiceBagItemTile key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 16,
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: 'var(--color-bg-validation-critical)',
                color: 'var(--color-text-onbrand-default)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Lottie animation — plays while the agent is speaking */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingBottom: 16,
            flexShrink: 0,
          }}
        >
          <VoiceLottieButton
            active={tts.isPlaying || speech.listening}
            listening={speech.listening}
            onClick={handleMicTap}
          />
          {!tts.isPlaying && !speech.listening && (
            <div
              aria-hidden="true"
              style={{
                color: 'var(--color-text-secondary-default)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Tap to talk
            </div>
          )}
        </div>

        {/* Review in bag CTA — surfaces when the order is complete */}
        <AnimatePresence>
          {orderComplete && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ paddingBottom: 24, flexShrink: 0 }}
            >
              <button
                type="button"
                onClick={handleReviewBag}
                className="font-display"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 9999,
                  border: 'none',
                  backgroundColor: 'var(--color-bg-brand-primary-default)',
                  color: 'var(--color-text-onbrand-default)',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                Review in bag
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Subcomponents ── */

function VoiceLottieButton({
  active,
  listening,
  onClick,
}: {
  active: boolean;
  listening: boolean;
  onClick: () => void;
}) {
  // useLottie returns the rendered <View> + an imperative API. We pause/
  // play it based on `active` so the animation only runs when the agent is
  // speaking or the user is being listened to.
  const lottie = useLottie({
    animationData: voiceAnimation,
    loop: true,
    autoplay: false,
    style: { width: '100%', height: '100%' },
  });

  useEffect(() => {
    if (active) lottie.play();
    else lottie.pause();
  }, [active, lottie]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? 'Stop listening' : 'Start voice input'}
      aria-pressed={listening}
      style={{
        width: 220,
        height: 220,
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {lottie.View}
    </button>
  );
}

function AgentSpokenText({
  text,
  tokens,
  activeIndex,
  useHighlight,
  pending,
}: {
  text: string;
  tokens: SpokenToken[];
  activeIndex: number;
  useHighlight: boolean;
  pending: boolean;
}) {
  if (pending && !text) {
    return (
      <span
        className="font-display"
        style={{
          color: 'var(--color-text-secondary-default)',
          fontWeight: 700,
          fontSize: 22,
          lineHeight: '30px',
          opacity: 0.6,
        }}
      >
        …
      </span>
    );
  }

  // When we don't have audio-driven timing (mock mode, or before the audio
  // metadata loads), show the full text in the "active" treatment so the
  // user can read it. Otherwise dim future words and brand-color the
  // current one for emphasis.
  if (!useHighlight || tokens.length === 0) {
    return (
      <p
        className="font-display"
        style={{
          color: 'var(--color-text-primary-default)',
          fontWeight: 800,
          fontSize: 22,
          lineHeight: '30px',
          margin: 0,
        }}
      >
        {text}
      </p>
    );
  }

  return (
    <p
      className="font-display"
      style={{
        fontWeight: 800,
        fontSize: 28,
        lineHeight: '36px',
        margin: 0,
      }}
      aria-live="polite"
    >
      {tokens.map((tok, i) => {
        let color: string;
        if (i < activeIndex) {
          color = 'var(--color-text-primary-default)';
        } else if (i === activeIndex) {
          color = 'var(--color-text-brand-primary-default)';
        } else {
          color = 'var(--color-text-secondary-default)';
        }
        return (
          <span
            key={i}
            style={{
              color,
              opacity: i > activeIndex ? 0.45 : 1,
              transition: 'color 120ms ease, opacity 120ms ease',
            }}
          >
            {tok.word}
            {tok.trailing}
          </span>
        );
      })}
    </p>
  );
}
