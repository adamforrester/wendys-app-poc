/**
 * Drives a word-by-word highlight against an audio element.
 *
 * Why this exists: ElevenLabs' default REST endpoint returns an MP3 with
 * no per-word timing. Production-grade word highlighting would use the
 * `with-timestamps` endpoint (per-character timing) or the websocket
 * stream (word events). For the POC we estimate timing from `audio.duration`
 * weighted by word length — a tunable that's "good enough" to feel right
 * for a demo without changing the proxy contract.
 *
 * Usage:
 *   const { tokens, activeIndex, attach, reset } = useSpokenHighlight();
 *   // pass `attach` as useTTS's onPlaybackStart callback
 *   // render tokens[activeIndex] differently than the rest
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpokenToken {
  /** Word as it appears in the original text. */
  word: string;
  /** Whitespace/punctuation that follows the word. */
  trailing: string;
}

/**
 * Splits a string into [word, trailing] tokens. We keep the trailing chunk
 * separately so the renderer can show punctuation/whitespace between words
 * without it being "highlighted" along with the active word.
 */
export function tokenizeForHighlight(text: string): SpokenToken[] {
  if (!text) return [];
  // Match word characters (incl. internal apostrophes/hyphens) followed by
  // any non-word run. Unicode-aware so 'café' tokenizes correctly.
  const regex = /([\p{L}\p{N}'’-]+)(\s*[^\p{L}\p{N}'’-]*)/gu;
  const tokens: SpokenToken[] = [];
  for (const match of text.matchAll(regex)) {
    tokens.push({ word: match[1], trailing: match[2] ?? '' });
  }
  return tokens;
}

/**
 * Compute the cumulative seconds at which each word should *begin* being
 * highlighted, given the total audio duration. We weight by word length
 * (longer words take longer to say) plus a small constant so single-letter
 * words don't compress to zero. A short trailing pause is also added when
 * the trailing chunk contains a sentence-ending punctuation mark.
 */
function buildSchedule(tokens: SpokenToken[], duration: number): number[] {
  if (tokens.length === 0 || !isFinite(duration) || duration <= 0) return [];
  const PUNCT_PAUSE = 0.15;
  const weights = tokens.map(t => {
    const base = t.word.length + 2;
    const punct = /[.!?]/.test(t.trailing) ? PUNCT_PAUSE * 10 : 0;
    return base + punct;
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const schedule: number[] = [];
  let cum = 0;
  for (const w of weights) {
    schedule.push((cum / total) * duration);
    cum += w;
  }
  return schedule;
}

export function useSpokenHighlight() {
  const [tokens, setTokens] = useState<SpokenToken[]>([]);
  // -1 means "not started yet"; equal to tokens.length means "all spoken".
  const [activeIndex, setActiveIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scheduleRef = useRef<number[]>([]);
  const handlersRef = useRef<{
    onTime: (() => void) | null;
    onEnd: (() => void) | null;
  }>({ onTime: null, onEnd: null });

  const detach = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (handlersRef.current.onTime) audio.removeEventListener('timeupdate', handlersRef.current.onTime);
      if (handlersRef.current.onEnd) audio.removeEventListener('ended', handlersRef.current.onEnd);
    }
    audioRef.current = null;
    handlersRef.current = { onTime: null, onEnd: null };
  }, []);

  const reset = useCallback(() => {
    detach();
    setTokens([]);
    setActiveIndex(-1);
    scheduleRef.current = [];
  }, [detach]);

  const attach = useCallback(
    (audio: HTMLAudioElement, text: string) => {
      // Clean up any previous binding before attaching to a new clip.
      detach();
      const newTokens = tokenizeForHighlight(text);
      setTokens(newTokens);
      setActiveIndex(newTokens.length > 0 ? 0 : -1);

      const buildAndBind = () => {
        scheduleRef.current = buildSchedule(newTokens, audio.duration);
      };

      if (isFinite(audio.duration) && audio.duration > 0) {
        buildAndBind();
      } else {
        // duration may be NaN until metadata loads.
        const onMeta = () => {
          buildAndBind();
          audio.removeEventListener('loadedmetadata', onMeta);
        };
        audio.addEventListener('loadedmetadata', onMeta);
      }

      const onTime = () => {
        const schedule = scheduleRef.current;
        if (!schedule.length) return;
        const t = audio.currentTime;
        // Find the last word whose start <= currentTime. Linear is fine —
        // sentences are short and timeupdate fires ~4× per second.
        let next = -1;
        for (let i = 0; i < schedule.length; i++) {
          if (schedule[i] <= t) next = i;
          else break;
        }
        if (next === -1) return;
        setActiveIndex(prev => (prev === next ? prev : next));
      };

      const onEnd = () => {
        // Snap to the last word; the tail of the audio often outlives the
        // schedule's last bucket because we estimate, not measure.
        setActiveIndex(newTokens.length - 1);
      };

      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('ended', onEnd);
      audioRef.current = audio;
      handlersRef.current = { onTime, onEnd };
    },
    [detach],
  );

  useEffect(() => detach, [detach]);

  return { tokens, activeIndex, attach, reset };
}
