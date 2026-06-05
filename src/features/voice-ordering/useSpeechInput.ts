/**
 * Speech-to-text via the browser-native Web Speech API.
 *
 * Two consumption modes:
 *   1. **Auto-VAD (default)** — the hook runs a small silence timer and
 *      auto-commits when result events stop for `silenceMs`. Used by the
 *      legacy chat panel.
 *   2. **Manual commit** (`manualCommit: true`) — silence timer is
 *      disabled, `onend` does not auto-fire `onAutoSubmit`. The consumer
 *      explicitly calls `commit()` to capture the transcript and submit.
 *      Used by push-to-talk (hold-to-talk) on the voice screen.
 *
 * Caveats:
 *   - Web Speech API is well-supported in Chrome/Edge and macOS Safari
 *     (under `webkitSpeechRecognition`). iOS Safari support is historically
 *     spotty; if `supported` is false the panel should fall back to the
 *     text input. A Whisper-via-proxy fallback is planned but deferred.
 *   - `continuous: true` keeps the recognizer open across pauses so we
 *     decide when a turn is done — not the API's own end-of-speech
 *     detection.
 *   - `lang: 'en-US'`. If we ever go multilingual the menu/system prompt
 *     would need parallel work; not worth parameterising now.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SpeechRecognitionErrorLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechInputOptions {
  /** Auto-commit after this many ms of detected silence. Default 1200. Ignored when `manualCommit` is true. */
  silenceMs?: number;
  /**
   * When true, disable the silence timer and skip the on-end auto-fire.
   * The consumer is responsible for calling `commit()` to capture the
   * transcript. Used for push-to-talk.
   */
  manualCommit?: boolean;
  /** Called with the final transcript when commit fires (auto or manual). */
  onAutoSubmit?: (transcript: string) => void;
  /** Called as the transcript updates (live mirroring into the input). */
  onTranscriptChange?: (transcript: string) => void;
}

export interface UseSpeechInputReturn {
  /** Web Speech API is available in this browser. */
  supported: boolean;
  /** Recognizer is actively listening. */
  listening: boolean;
  /** Last error string from the API (mic denied, network, etc.). */
  error: string | null;
  /** Open the mic. No-op if already listening. */
  start: () => void;
  /** Close the mic. Cancels any pending auto-submit timer. */
  stop: () => void;
  /**
   * Capture the current transcript, fire `onAutoSubmit`, and stop
   * listening. Use this in `manualCommit` mode (e.g. on pointerup for
   * push-to-talk). No-op if there's no transcript yet.
   */
  commit: () => void;
}

export function useSpeechInput(options: UseSpeechInputOptions = {}): UseSpeechInputReturn {
  const { silenceMs = 1200, manualCommit = false, onAutoSubmit, onTranscriptChange } = options;

  const [supported] = useState(() => getRecognitionCtor() != null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs for callbacks so the recognizer's event handlers — bound once at
  // start() — always see the latest functions without re-instantiating it.
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);
  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearSilenceTimer();
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    setListening(false);
    if (rec) {
      try {
        rec.abort();
      } catch {
        // Already stopped — ignore.
      }
    }
  }, [clearSilenceTimer]);

  const commit = useCallback(() => {
    const final = transcriptRef.current.trim();
    transcriptRef.current = '';
    stop();
    if (final.length > 0) onAutoSubmitRef.current?.(final);
  }, [stop]);

  const start = useCallback(() => {
    if (recognitionRef.current) return; // already running
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    transcriptRef.current = '';

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      // Reassemble the transcript from all results since this session
      // started — `resultIndex` lets us splice in just the new ones.
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        text += result[0].transcript;
      }
      transcriptRef.current = text;
      onTranscriptChangeRef.current?.(text);

      // In manual-commit (push-to-talk) mode the consumer triggers commit
      // explicitly on release — never on a silence timer.
      if (manualCommit) return;

      // Auto-VAD: reset the silence timer on every result event.
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(commit, silenceMs);
    };

    rec.onerror = (event) => {
      // 'no-speech' and 'aborted' are expected during normal flow; don't
      // surface them as errors. Anything else (mic denied, network) is.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(event.message || event.error || 'Speech recognition error.');
      stop();
    };

    rec.onend = () => {
      // The browser ended the session on its own (timeout, no input, etc.).
      // In auto-VAD mode we treat this as a commit fallback. In manual mode
      // we do NOT — the consumer owns the commit moment, and a stray onend
      // (silent room, browser-side timeout) shouldn't fire onAutoSubmit.
      if (recognitionRef.current === rec) {
        clearSilenceTimer();
        const final = transcriptRef.current.trim();
        recognitionRef.current = null;
        setListening(false);
        if (!manualCommit && final.length > 0) onAutoSubmitRef.current?.(final);
        transcriptRef.current = '';
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start speech recognition.');
    }
  }, [clearSilenceTimer, commit, silenceMs, stop]);

  // Tear down on unmount.
  useEffect(() => stop, [stop]);

  return { supported, listening, error, start, stop, commit };
}
