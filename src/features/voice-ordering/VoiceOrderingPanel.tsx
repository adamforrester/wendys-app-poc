import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/Button/Button';
import { Spinner } from '../../components/Spinner/Spinner';
import { springSheet } from '../../animations/presets';
// `Button` omits HTML `type` (uses `variant` instead). The form submit
// button renders as a plain styled <button type="submit"> for Enter-to-send.
import { useClaudeConversation } from './useClaudeConversation';
import { useTTS } from './useTTS';
import { useSpeechInput } from './useSpeechInput';
import type { ConversationMessage } from './types';

// The voice panel is rendered inside the 390×844 DeviceFrame. We position
// it directly with explicit pixel math instead of going through the shared
// BottomSheet component — that component's animation math + the project's
// flex layout disagreed about what the containing block was, leaving the
// input row clipped below the visible device bottom regardless of which
// height/maxHeight pairing we tried. Inlining the layout here keeps the
// geometry obvious and predictable.
const DEVICE_HEIGHT = 844;
const PANEL_HEIGHT_PX = 740; // ~88% of device height; leaves a peek of the screen above
const TOP_OFFSET = DEVICE_HEIGHT - PANEL_HEIGHT_PX; // 104px from top when open

export interface VoiceOrderingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat-style UI for the voice ordering POC. Text input + TTS playback.
 * STT (mic input) is still deferred. Brand-secondary (teal) header.
 *
 * The panel is mostly "dumb" — it renders messages and forwards input to
 * `useClaudeConversation`. Order parsing + bag integration happen in the
 * hook; TTS playback is handled here so a header mute toggle can scope to
 * this component.
 */
export function VoiceOrderingPanel({ isOpen, onClose }: VoiceOrderingPanelProps) {
  const { messages, pending, error, send, reset, mode, lastParsedOrder } = useClaudeConversation();
  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  // When the user has typed (or starts typing), pause the auto-mic loop so
  // we don't fight their input. Resumes after the next assistant turn or
  // when the user clears the field.
  const [voiceLoopPaused, setVoiceLoopPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  // Once true, the user has interacted enough that browsers will allow
  // autoplay (TTS) and getUserMedia prompts to surface inline. We gate
  // auto-loop start on this.
  const userActivatedRef = useRef(false);

  const tts = useTTS({ enabled: !muted && mode === 'live' });

  const speech = useSpeechInput({
    onTranscriptChange: (transcript) => setInput(transcript),
    onAutoSubmit: (transcript) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;
      setInput('');
      void send(trimmed);
    },
  });

  // Greet on first open.
  useEffect(() => {
    if (isOpen && messages.length === 0 && mode !== 'off') {
      void send('hi');
    }
  }, [isOpen, messages.length, mode, send]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  // Speak new assistant messages.
  useEffect(() => {
    if (mode !== 'live' || muted) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.id === lastSpokenIdRef.current) return; // already spoken
    lastSpokenIdRef.current = last.id;
    // A new assistant turn cancels any "user is typing" pause — they spoke,
    // so the loop should resume after the reply finishes.
    setVoiceLoopPaused(false);
    // `last.content` already has the order JSON fence stripped by the hook.
    void tts.speak(last.content);
  }, [messages, mode, muted, tts]);

  // Auto-listen loop: open the mic whenever it's safe to do so.
  // Conditions:
  //   - Panel open, not in 'off' mode, STT supported
  //   - User has activated (clicked the mic at least once, satisfying
  //     browser permission/autoplay gates)
  //   - We're not currently waiting on the assistant or speaking TTS
  //   - User hasn't paused the loop by typing
  //   - Recognizer isn't already running
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'off') return;
    if (!speech.supported) return;
    if (!userActivatedRef.current) return;
    if (pending || tts.isPlaying) return;
    if (voiceLoopPaused) return;
    if (speech.listening) return;
    speech.start();
  }, [isOpen, mode, pending, tts.isPlaying, voiceLoopPaused, speech]);

  // Stop everything when the panel closes.
  useEffect(() => {
    if (!isOpen) {
      tts.stop();
      speech.stop();
    }
  }, [isOpen, tts, speech]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || pending) return;
      setInput('');
      setVoiceLoopPaused(false);
      speech.stop();
      void send(trimmed);
    },
    [input, pending, send, speech],
  );

  const handleReset = useCallback(() => {
    reset();
    setInput('');
    setVoiceLoopPaused(false);
    speech.stop();
  }, [reset, speech]);

  const handleMicClick = useCallback(() => {
    userActivatedRef.current = true;
    if (speech.listening) {
      // User is asking the mic to close. Pause the auto-loop too so we
      // don't immediately re-open — they have to tap again or send a
      // typed turn to resume.
      speech.stop();
      setVoiceLoopPaused(true);
      return;
    }
    // Manual press should always feel snappy — clear any "typing pause".
    setVoiceLoopPaused(false);
    setInput('');
    speech.start();
  }, [speech]);

  const handleInputChange = useCallback((next: string) => {
    setInput(next);
    // The recognizer mirrors interim transcripts via onTranscriptChange,
    // which would otherwise look like the user typing. We treat any change
    // that happens while we *aren't* listening as a deliberate keystroke.
    if (!speech.listening) {
      setVoiceLoopPaused(next.length > 0);
    }
  }, [speech.listening]);

  return (
    // Outer overlay layer. zIndex 70 sits above the bottom tab bar (z-60)
    // so the input row at the bottom of the panel isn't occluded.
    // pointer-events must toggle off when closed — the layer is always
    // mounted (so the close animation can play) and would otherwise eat
    // clicks across the whole app.
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 390,
        height: DEVICE_HEIGHT,
        zIndex: 70,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        aria-hidden="true"
      />

      {/* Panel — fixed pixel geometry. No drag handle (use Close button). */}
      <motion.div
        initial={{ y: DEVICE_HEIGHT }}
        animate={{ y: isOpen ? TOP_OFFSET : DEVICE_HEIGHT }}
        transition={springSheet}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 390,
          height: PANEL_HEIGHT_PX,
          backgroundColor: 'var(--color-bg-primary-default)',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: '0 -4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Voice ordering"
      >
        {/* Drag handle indicator (visual only — drag-to-dismiss is intentionally not wired) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 12,
            paddingBottom: 8,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 100,
              backgroundColor: 'var(--color-bg-primary-inverse-default)',
              opacity: 0.3,
            }}
          />
        </div>

        <PanelHeader
          mode={mode}
          muted={muted}
          onToggleMute={() => setMuted(m => !m)}
          onReset={handleReset}
          onClose={onClose}
        />

        <div
          ref={scrollRef}
          className="px-wds-16 py-wds-12 space-y-wds-12"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            backgroundColor: 'var(--color-bg-secondary-default)',
          }}
        >
          {messages.length === 0 && !pending && <EmptyState />}
          {messages.map(m => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {pending && <TypingIndicator />}
          {lastParsedOrder && lastParsedOrder.fullyResolved && (
            <OrderCompletePill itemCount={lastParsedOrder.items.length} />
          )}
          {error && <ErrorBanner message={error} />}
        </div>

        <PanelInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          disabled={pending || mode === 'off'}
          micSupported={speech.supported}
          micListening={speech.listening}
          micError={speech.error}
          onMicClick={handleMicClick}
        />
      </motion.div>
    </div>
  );
}

/* ── Subcomponents ── */

function PanelHeader({
  mode,
  muted,
  onToggleMute,
  onReset,
  onClose,
}: {
  mode: 'off' | 'mock' | 'live';
  muted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-wds-16 py-wds-12"
      style={{
        backgroundColor: 'var(--color-bg-brand-secondary-default)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <div className="flex items-center gap-wds-8">
        <div
          className="rounded-wds-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-bg-primary-default)',
            width: 36,
            height: 36,
          }}
          aria-hidden="true"
        >
          {/* /icons/voice.svg is mono — use mask-image so it picks up currentColor. */}
          <span
            style={{
              display: 'inline-block',
              width: 22,
              height: 22,
              backgroundColor: 'var(--color-bg-brand-secondary-default)',
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
        </div>
        <div className="flex flex-col">
          <span
            className="font-display text-base font-bold"
            style={{ color: 'var(--color-text-onbrand-default)' }}
          >
            Voice Ordering
          </span>
          <span
            className="font-body text-xs"
            style={{ color: 'var(--color-text-onbrand-default)', opacity: 0.85 }}
          >
            {mode === 'off' && 'Disabled'}
            {mode === 'mock' && 'POC mode (canned)'}
            {mode === 'live' && 'Live'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-wds-8">
        {mode === 'live' && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute voice' : 'Mute voice'}
            aria-pressed={muted}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              border: 'none',
              backgroundColor: muted
                ? 'rgba(255,255,255,0.2)'
                : 'transparent',
              color: 'var(--color-text-onbrand-default)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          </button>
        )}
        <Button variant="text-reversed" size="small" noPadding onClick={onReset}>
          Reset
        </Button>
        <Button variant="text-reversed" size="small" noPadding onClick={onClose} aria-label="Close voice ordering">
          Close
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[78%] px-wds-12 py-wds-8 rounded-wds-l font-body text-sm whitespace-pre-wrap"
        style={
          isUser
            ? {
                backgroundColor: 'var(--color-bg-brand-secondary-default)',
                color: 'var(--color-text-onbrand-default)',
              }
            : {
                backgroundColor: 'var(--color-bg-primary-default)',
                color: 'var(--color-text-primary-default)',
                border: '1px solid var(--color-border-tertiary-default)',
              }
        }
      >
        {message.content}
        {message.resolutionNotes && message.resolutionNotes.length > 0 && (
          <div
            className="mt-wds-8 pt-wds-8 text-xs"
            style={{
              borderTop: '1px solid var(--color-border-tertiary-default)',
              color: 'var(--color-text-secondary-default)',
            }}
          >
            {message.resolutionNotes.map((n, i) => (
              <div key={i}>⚠ {n}</div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="px-wds-12 py-wds-8 rounded-wds-l flex items-center gap-wds-4"
        style={{
          backgroundColor: 'var(--color-bg-primary-default)',
          border: '1px solid var(--color-border-tertiary-default)',
        }}
        aria-busy="true"
        aria-label="Assistant is typing"
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-wds-full"
            style={{ backgroundColor: 'var(--color-text-secondary-default)' }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCompletePill({ itemCount }: { itemCount: number }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div
          className="px-wds-16 py-wds-8 rounded-wds-full font-body text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-bg-validation-positive)',
            color: 'var(--color-text-onbrand-default)',
          }}
        >
          ✓ {itemCount} item{itemCount === 1 ? '' : 's'} added to your bag
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="px-wds-12 py-wds-8 rounded-wds-m font-body text-sm"
      style={{
        backgroundColor: 'var(--color-bg-validation-critical)',
        color: 'var(--color-text-onbrand-default)',
      }}
      role="alert"
    >
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-wds-48 px-wds-16"
      style={{ color: 'var(--color-text-secondary-default)' }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 48,
          height: 48,
          backgroundColor: 'var(--color-bg-brand-secondary-default)',
          maskImage: 'url(/icons/voice.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/icons/voice.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          marginBottom: 12,
        }}
      />
      <div className="font-display text-lg font-bold mb-wds-4" style={{ color: 'var(--color-text-primary-default)' }}>
        Order with your voice
      </div>
      <div className="font-body text-sm">
        Try: "I'd like a Dave's Single"
      </div>
    </div>
  );
}

function PanelInput({
  value,
  onChange,
  onSubmit,
  disabled,
  micSupported,
  micListening,
  micError,
  onMicClick,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  micSupported: boolean;
  micListening: boolean;
  micError: string | null;
  onMicClick: () => void;
}) {
  const hasText = value.trim().length > 0;
  // The mic replaces the Send button when the input is empty. Pressing mic
  // toggles listening; pressing Send (text present) submits. Disabling
  // mic + Send together means the user can still see the input but can't
  // act on it until the assistant turn completes.
  const showMic = micSupported && !hasText;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary-default)',
        borderTop: '1px solid var(--color-border-tertiary-default)',
      }}
    >
      {micError && (
        <div
          className="px-wds-16 pt-wds-8 font-body text-xs"
          style={{ color: 'var(--color-text-validation-critical)' }}
          role="alert"
        >
          {micError}
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="px-wds-16 py-wds-12 flex items-center gap-wds-8"
      >
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={
            disabled
              ? 'Voice ordering is off'
              : micListening
                ? 'Listening…'
                : micSupported
                  ? 'Tap the mic or type to order…'
                  : 'Type to order…'
          }
          disabled={disabled}
          className="flex-1 px-wds-12 py-wds-8 font-body text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-bg-secondary-default)',
            color: 'var(--color-text-primary-default)',
            border: '1px solid var(--color-border-tertiary-default)',
            borderRadius: 9999,
          }}
          aria-label="Voice ordering input"
        />
        {showMic ? (
          <MicButton
            disabled={disabled}
            listening={micListening}
            onClick={onMicClick}
          />
        ) : (
          <button
            type="submit"
            disabled={disabled || !hasText}
            className="font-display font-bold"
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              backgroundColor:
                disabled || !hasText
                  ? 'var(--color-bg-disabled-default)'
                  : 'var(--color-bg-brand-secondary-default)',
              color: 'var(--color-text-onbrand-default)',
              border: 'none',
              cursor: disabled || !hasText ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {disabled && value === '' ? <Spinner size={16} /> : 'Send'}
          </button>
        )}
      </form>
    </div>
  );
}

function MicButton({
  disabled,
  listening,
  onClick,
}: {
  disabled: boolean;
  listening: boolean;
  onClick: () => void;
}) {
  // Pulsing ring while listening; flat circular icon button otherwise.
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? 'Stop listening' : 'Start voice input'}
      aria-pressed={listening}
      style={{
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 9999,
        border: 'none',
        backgroundColor: disabled
          ? 'var(--color-bg-disabled-default)'
          : listening
            ? 'var(--color-bg-brand-primary-default)'
            : 'var(--color-bg-brand-secondary-default)',
        color: 'var(--color-text-onbrand-default)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {listening && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9999,
            backgroundColor: 'var(--color-bg-brand-primary-default)',
          }}
        />
      )}
      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 22,
          height: 22,
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
    </button>
  );
}
