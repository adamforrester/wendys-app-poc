/**
 * Haptic feedback utility using the Web Vibration API.
 * Works on Android browsers. Gracefully no-ops on iOS/Safari.
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export const haptics = {
  /** Light tap — button press, minor selection */
  light: () => vibrate(10),

  /** Medium tap — add to bag, toggle */
  medium: () => vibrate(20),

  /** Success — order confirmed, item added */
  success: () => vibrate([10, 50, 10]),

  /** Error — validation failure */
  error: () => vibrate([30, 50, 30]),

  /** Warning — destructive action confirmation */
  warning: () => vibrate([15, 30, 15, 30, 15]),
};
