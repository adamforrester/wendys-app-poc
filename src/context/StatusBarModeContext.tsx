import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Tiny context that lets a screen control the global iOS-style status bar
 * tint. Default is 'light' (white text/icons) — most app shells have a red
 * top bar where that's correct. Screens with a light background should call
 * `useStatusBarMode('dark')` in an effect to flip the tint while mounted.
 *
 * Why a context and not a prop on DeviceFrame? DeviceFrame wraps the entire
 * router output; per-route mode would require lifting routing state into
 * DeviceFrame's parent, which is heavier than this hook. The context resets
 * the mode on unmount so we don't strand a screen-specific tint after
 * navigating away.
 */

type StatusBarMode = 'light' | 'dark';

interface StatusBarModeValue {
  mode: StatusBarMode;
  setMode: (mode: StatusBarMode) => void;
}

const StatusBarModeContext = createContext<StatusBarModeValue | null>(null);

export function StatusBarModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<StatusBarMode>('light');
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return (
    <StatusBarModeContext.Provider value={value}>
      {children}
    </StatusBarModeContext.Provider>
  );
}

/** Read the current status bar mode (e.g. for DeviceFrame). */
export function useStatusBarModeValue(): StatusBarMode {
  const ctx = useContext(StatusBarModeContext);
  // Treat absence as default light — keeps the component renderable in
  // Storybook stories that don't mount the provider.
  return ctx?.mode ?? 'light';
}

/**
 * Set the status bar mode for as long as the calling component is mounted.
 * Restores the previous mode on unmount so navigating away from a
 * dark-status-bar screen doesn't leave the rest of the app mistinted.
 */
export function useStatusBarMode(mode: StatusBarMode) {
  const ctx = useContext(StatusBarModeContext);
  const setter = useCallback(
    (next: StatusBarMode) => ctx?.setMode(next),
    [ctx],
  );

  useEffect(() => {
    if (!ctx) return;
    const previous = ctx.mode;
    setter(mode);
    return () => setter(previous);
    // We intentionally only re-run when `mode` changes; capturing
    // ctx.mode in deps would re-run the effect on every change anywhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
}
