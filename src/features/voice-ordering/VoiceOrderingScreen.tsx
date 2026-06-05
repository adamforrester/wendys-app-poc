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
  const { messages, pending, error, send, mode, lastParsedOrder, lastHandoff } = useClaudeConversation();
  const { state: bagState } = useBag();
  // Cream background → dark status bar tint while this screen is mounted.
  useStatusBarMode('dark');
  // Tracks the bag-item ids that already existed before the user opened
  // this screen so we don't show them as voice adds. Lazy-initialized
  // useState (not a ref written from useEffect) so the first render of
  // voiceItems already excludes pre-existing ids. Otherwise items left
  // over from a prior session show up in the voice stack on mount.
  const [preExistingIds] = useState<Set<string>>(
    () => new Set(bagState.items.map(i => i.id)),
  );
  const lastSpokenIdRef = useRef<string | null>(null);

  const highlight = useSpokenHighlight();

  const tts = useTTS({
    enabled: mode === 'live',
    onPlaybackStart: highlight.attach,
  });

  // Push-to-talk: the mic only listens while the user is holding the
  // lottie button. No silence timer, no auto-loop after assistant turns —
  // the user owns the moment they stop speaking.
  const speech = useSpeechInput({
    manualCommit: true,
    onAutoSubmit: (transcript) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;
      void send(trimmed);
    },
  });

  // Delivery handoff. The agent emitted a `handoff` fence when the user
  // chose delivery up front. We want to route to /order/delivery exactly
  // when the spoken read-back finishes — not before (truncates the line)
  // and not after a fixed delay (varies with reply length, voice speed,
  // load latency).
  //
  // Strategy: watch tts.isPlaying transition true → false. Once we've
  // seen it become true, the next time it's false the audio has ended.
  // A safety timeout covers the cases where playback never starts (mock
  // mode, missing creds, proxy 5xx) so the handoff can't get stuck.
  //
  // tts/speech/navigate are kept in refs so re-renders don't churn the
  // safety timer — useTTS and useSpeechInput return new objects each
  // render, and chasing those in deps would defeat the timer.
  const handoffNavTriggeredRef = useRef(false);
  const handoffPlaybackSeenRef = useRef(false);
  const ttsRef = useRef(tts);
  const speechRef = useRef(speech);
  const navigateRef = useRef(navigate);
  useEffect(() => {
    ttsRef.current = tts;
    speechRef.current = speech;
    navigateRef.current = navigate;
  });

  const performHandoffNav = useCallback(() => {
    if (handoffNavTriggeredRef.current) return;
    handoffNavTriggeredRef.current = true;
    ttsRef.current.stop();
    speechRef.current.stop();
    navigateRef.current('/order/delivery', { replace: true });
  }, []);

  // Track playback transitions to fire navigation right when audio ends.
  useEffect(() => {
    if (!lastHandoff || lastHandoff.destination !== 'delivery') return;
    if (handoffNavTriggeredRef.current) return;
    if (tts.isPlaying) {
      handoffPlaybackSeenRef.current = true;
      return;
    }
    if (handoffPlaybackSeenRef.current) {
      // isPlaying just flipped true → false: audio finished.
      performHandoffNav();
    }
  }, [lastHandoff, tts.isPlaying, performHandoffNav]);

  // Safety net: if playback never starts (mock mode, proxy failure),
  // route after a bounded wait so the user isn't stranded.
  useEffect(() => {
    if (!lastHandoff || lastHandoff.destination !== 'delivery') return;
    if (handoffNavTriggeredRef.current) return;
    const ceiling = mode === 'live' ? 8000 : 1500;
    const timer = window.setTimeout(performHandoffNav, ceiling);
    return () => window.clearTimeout(timer);
  }, [lastHandoff, mode, performHandoffNav]);

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
    if (mode === 'live') {
      void tts.speak(lastAssistant.content);
    } else {
      // Show the whole reply at once when there's no audio to drive timing.
      highlight.reset();
    }
  }, [lastAssistant, mode, tts, highlight]);

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

  // Push-to-talk handlers. We use pointer events so this works for both
  // mouse and touch in one path. Pressing while the assistant is still
  // speaking interrupts TTS — the user's input takes priority.
  const handleMicHoldStart = useCallback(() => {
    if (tts.isPlaying) tts.stop();
    if (pending) return;
    if (speech.listening) return;
    speech.start();
  }, [pending, speech, tts]);

  const handleMicHoldEnd = useCallback(() => {
    if (!speech.listening) return;
    speech.commit();
  }, [speech]);

  const handleReviewBag = useCallback(() => {
    navigate('/order/bag');
  }, [navigate]);

  // Items added during this voice session — newest first so the most
  // recent item appears at the top of the stack (closest to the agent
  // text, like a receipt unfurling toward the camera).
  const voiceItems = useMemo(
    () => bagState.items.filter(i => !preExistingIds.has(i.id)).slice().reverse(),
    [bagState.items, preExistingIds],
  );

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
            disabled={pending}
            onHoldStart={handleMicHoldStart}
            onHoldEnd={handleMicHoldEnd}
          />
          <div
            aria-hidden="true"
            style={{
              color: 'var(--color-text-secondary-default)',
              fontSize: 12,
              fontWeight: 600,
              minHeight: 16,
            }}
          >
            {speech.listening
              ? 'Listening — release to send'
              : tts.isPlaying
                ? 'Speaking…'
                : 'Hold to talk'}
          </div>
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
  disabled,
  onHoldStart,
  onHoldEnd,
}: {
  active: boolean;
  listening: boolean;
  disabled: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
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

  // Push-to-talk: pointerdown captures the pointer so we keep getting
  // pointermove/up even if the finger drags off the button. pointerup,
  // pointercancel, and pointerleave (as a safety net) all release.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // Don't allow the press to start a text selection or scroll on touch.
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onHoldStart();
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Pointer may already be released by the browser.
    }
    onHoldEnd();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={listening ? 'Listening — release to send' : 'Hold to talk'}
      aria-pressed={listening}
      style={{
        width: 220,
        height: 220,
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        // Block the native long-press menu on iOS Safari.
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
        opacity: disabled ? 0.6 : 1,
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
        fontSize: 22,
        lineHeight: '30px',
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
