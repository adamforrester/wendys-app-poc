import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lets DevTools re-run the splash sequence without reloading the page.
 *
 * Why this exists: the splash renders once at mount, and feature flags live
 * in memory only (see FeatureFlagsContext) — so a reload, the only other way
 * to see the splash again, resets `splashAnimation` to its default. That made
 * the retro GIF and MP4 variants impossible to view. Replaying in place keeps
 * the flags intact.
 *
 * `runId` is bumped on every replay and used as the splash's React key, so the
 * component remounts and its <img>/<video> restart from the first frame rather
 * than resuming a finished animation.
 */

interface SplashReplayValue {
  /** Remount key — changes on every replay. */
  runId: number;
  /** Whether the splash should be on screen. */
  visible: boolean;
  /** Called by the splash when its sequence finishes. */
  complete: () => void;
  /** Show the splash again from the top, using the current splashAnimation flag. */
  replay: () => void;
}

const SplashReplayContext = createContext<SplashReplayValue | null>(null);

export function SplashReplayProvider({ children }: { children: ReactNode }) {
  const [runId, setRunId] = useState(0);
  const [visible, setVisible] = useState(true);

  const complete = useCallback(() => setVisible(false), []);
  const replay = useCallback(() => {
    setRunId((id) => id + 1);
    setVisible(true);
  }, []);

  const value = useMemo(
    () => ({ runId, visible, complete, replay }),
    [runId, visible, complete, replay],
  );

  return (
    <SplashReplayContext.Provider value={value}>
      {children}
    </SplashReplayContext.Provider>
  );
}

export function useSplashReplay(): SplashReplayValue {
  const context = useContext(SplashReplayContext);
  if (!context) throw new Error('useSplashReplay must be used within SplashReplayProvider');
  return context;
}
