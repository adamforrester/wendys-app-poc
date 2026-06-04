/**
 * Text-to-speech via the /api/tts proxy.
 *
 * Returns a `speak(text)` function that fetches MP3 audio from the proxy
 * and plays it. Each call cancels any in-flight request and stops the
 * currently-playing clip — so a new assistant message immediately
 * interrupts the previous one. Errors are swallowed (TTS is non-critical;
 * the chat must keep working even if voice fails).
 *
 * Usage:
 *   const tts = useTTS({ enabled: !muted });
 *   tts.speak('Hi there.');
 *   tts.stop(); // explicit interrupt (e.g. when user starts typing)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTTSOptions {
  /** When false, speak() is a no-op. Lets the panel toggle mute without unmounting. */
  enabled: boolean;
  /** Override proxy URL — defaults to '/api/tts'. */
  endpoint?: string;
  /** Override the voice ID — defaults to whatever the proxy uses. */
  voiceId?: string;
  /** Override TTS model — defaults to 'eleven_turbo_v2'. */
  modelId?: string;
}

export function useTTS(options: UseTTSOptions) {
  const { enabled, endpoint = '/api/tts', voiceId, modelId } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Exposed so consumers (e.g. the panel's mic auto-loop) can wait until
  // the assistant has finished speaking before opening the mic — otherwise
  // the recognizer picks up our own TTS audio.
  const [isPlaying, setIsPlaying] = useState(false);

  const cleanup = useCallback(() => {
    // Stop playback.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    // Free the previous Blob URL so we don't leak.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    // Cancel any in-flight request.
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const speak = useCallback(
    async (text: string) => {
      if (!enabled) return;
      const trimmed = text?.trim();
      if (!trimmed) return;

      // Interrupt anything currently playing.
      cleanup();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed, voice_id: voiceId, model_id: modelId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          // Silently no-op when proxy isn't configured (e.g. missing key).
          // Don't bubble the error — chat works without audio.
          return;
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        // Free Blob when playback ends naturally.
        audio.onended = () => {
          if (objectUrlRef.current === url) {
            URL.revokeObjectURL(url);
            objectUrlRef.current = null;
          }
          if (audioRef.current === audio) {
            audioRef.current = null;
            setIsPlaying(false);
          }
        };

        try {
          await audio.play();
          if (audioRef.current === audio) setIsPlaying(true);
        } catch {
          // Browsers may block autoplay until first user gesture; ignore.
          if (audioRef.current === audio) setIsPlaying(false);
        }
      } catch {
        // AbortError (interrupted) or network error — both safe to ignore.
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [cleanup, enabled, endpoint, voiceId, modelId],
  );

  // Stop on unmount.
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Stop when toggled off.
  useEffect(() => {
    if (!enabled) cleanup();
  }, [enabled, cleanup]);

  return { speak, stop, isPlaying };
}
