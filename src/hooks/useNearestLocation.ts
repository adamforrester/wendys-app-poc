/**
 * useNearestLocation — geo-driven nearest-Wendy's lookup.
 *
 * Two consumers planned:
 *   1. Home screen — auto-prompts for geolocation on mount, sets the
 *      LocationContext so the rest of the app sees the picked store.
 *   2. Voice ordering — reads the same hook to skip the permission prompt
 *      (already handled on Home) and confirms the store the user can see.
 *
 * The vendored `wendys-locations.json` is 5.4 MB. We DO NOT import it
 * statically — it would bloat the main bundle from ~1.8 MB to ~7 MB.
 * Instead we dynamic-import on demand, which Vite splits into its own
 * chunk and the browser caches after first load.
 *
 * State machine:
 *   idle      — nothing requested yet
 *   loading   — resolving permissions + position + dataset
 *   granted   — position resolved, nearest store ranked, ready
 *   denied    — user declined geolocation OR Permissions API said 'denied'
 *   error     — geo lookup failed for non-permission reasons
 *
 * The hook does NOT write to LocationContext. Callers compose: Home reads
 * the result and dispatches SET_LOCATION; voice reads the same and threads
 * it into the agent's context. Keeps the hook pure-ish and testable.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Location } from '../data/types';

export type NearestStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export interface NearestLocationState {
  status: NearestStatus;
  /** Selected nearest store, mapped to the app's Location shape. */
  nearest: Location | null;
  /** Top-N candidates for "pick a different one" flows. */
  candidates: Location[];
  /** Coordinates returned by the browser, when available. */
  coords: { lat: number; lng: number } | null;
  /** Friendly error string for the error state. */
  errorMessage: string | null;
}

const INITIAL: NearestLocationState = {
  status: 'idle',
  nearest: null,
  candidates: [],
  coords: null,
  errorMessage: null,
};

/* ── Real-store dataset (lazy) ────────────────────────────────────────── */

interface RealStore {
  store_number: string;
  name: string;
  address: { street: string; city: string; state: string; zip: string; country?: string };
  lat: number;
  lng: number;
  phone: string;
  hours: Record<string, string>;
  services?: string[];
  delivery_partners?: string[];
}

let storesPromise: Promise<RealStore[]> | null = null;

function loadStores(): Promise<RealStore[]> {
  if (!storesPromise) {
    // Dynamic import → Vite emits a separate chunk; main bundle stays small.
    // The data file lives under voice-ordering's data/ dir today (vendored
    // there for the voice POC); we read it from there to avoid duplication.
    storesPromise = import(
      '../features/voice-ordering/data/wendys-locations.json'
    ).then(mod => {
      const raw = (mod.default ?? mod) as { stores: RealStore[] };
      return raw.stores;
    });
  }
  return storesPromise;
}

/* ── Distance + adapter ───────────────────────────────────────────────── */

const EARTH_MI = 3958.7613;

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sLat = Math.sin(dLat / 2);
  const sLng = Math.sin(dLng / 2);
  const c = sLat * sLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sLng * sLng;
  return 2 * EARTH_MI * Math.asin(Math.sqrt(c));
}

/**
 * Convert a real-store row + distance into the app's Location shape.
 * The app expects breakfast + regular hour ranges; the real data has a
 * single window per weekday. We assume a 6:30-10:30 breakfast window when
 * the store advertises Breakfast service, otherwise leave it tight.
 * Fulfillment methods are inferred from `services` (Drive Thru) and
 * sane defaults — every Wendy's supports carry-out and dine-in.
 */
function adaptRealStore(s: RealStore, distanceMiles: number): Location {
  const hasBreakfast = (s.services ?? []).some(svc => /breakfast/i.test(svc));
  const hasDriveThru = (s.services ?? []).some(svc => /drive.?thru/i.test(svc));

  // `Mo` Monday hours as the canonical "regular" window — close enough for
  // the prototype's purposes. Real app would key off the actual weekday.
  const monday = s.hours.Mo || s.hours.Tu || '10:30-00:00';
  const [openTime, closeTime] = monday.split('-');

  const fulfillment: string[] = ['carry-out', 'dine-in'];
  if (hasDriveThru) fulfillment.unshift('drive-thru');

  return {
    id: `real_${s.store_number}`,
    name: s.name,
    address: {
      street: s.address.street,
      city: s.address.city,
      state: s.address.state,
      zip: (s.address.zip || '').split('-')[0], // strip ZIP+4
    },
    coordinates: { lat: s.lat, lng: s.lng },
    distance: Number(distanceMiles.toFixed(1)),
    isOpen: true, // We don't compute open/closed off the per-day hours; assume open.
    hours: {
      breakfast: hasBreakfast
        ? { open: '06:30', close: '10:30' }
        : { open: openTime ?? '10:30', close: openTime ?? '10:30' },
      regular: { open: openTime ?? '10:30', close: closeTime ?? '00:00' },
    },
    fulfillmentMethods: fulfillment,
    phoneNumber: s.phone,
  };
}

function rankNearest(
  origin: { lat: number; lng: number },
  stores: RealStore[],
  limit = 5,
): Location[] {
  // Compute distance for every store (5,629 rows, ~5ms on a laptop) then
  // sort. For larger datasets we'd want a spatial index; not worth it here.
  return stores
    .map(s => ({ s, d: haversineMiles(origin, { lat: s.lat, lng: s.lng }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ s, d }) => adaptRealStore(s, d));
}

/* ── Permissions API helper ───────────────────────────────────────────── */

async function readPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (typeof navigator === 'undefined') return 'unsupported';
  if (!('permissions' in navigator) || typeof navigator.permissions?.query !== 'function') {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return status.state;
  } catch {
    return 'unsupported';
  }
}

function getCurrentPositionAsync(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation API unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000, // accept a 5-min-old fix
    });
  });
}

/* ── Hook ─────────────────────────────────────────────────────────────── */

interface UseNearestLocationOptions {
  /**
   * When true, the hook auto-runs on mount. Default: true. Pass false when
   * the consumer wants to gate the prompt behind a user gesture.
   */
  autoRun?: boolean;
}

export function useNearestLocation(options: UseNearestLocationOptions = {}) {
  const { autoRun = true } = options;
  const [state, setState] = useState<NearestLocationState>(INITIAL);
  const ranRef = useRef(false);

  /**
   * Resolve nearest from a known coordinate. Used by both geo + ZIP paths.
   * Returns the ranked top-5 so callers can dispatch the result immediately
   * without waiting on a re-render to read it off `state`.
   */
  const rankFromCoords = useCallback(
    async (coords: { lat: number; lng: number }): Promise<Location[]> => {
      const stores = await loadStores();
      const top = rankNearest(coords, stores, 5);
      setState({
        status: 'granted',
        nearest: top[0] ?? null,
        candidates: top,
        coords,
        errorMessage: null,
      });
      return top;
    },
    [],
  );

  const request = useCallback(async () => {
    setState(s => ({ ...s, status: 'loading', errorMessage: null }));

    const perm = await readPermissionState();
    if (perm === 'denied') {
      setState({ ...INITIAL, status: 'denied' });
      return;
    }

    try {
      const pos = await getCurrentPositionAsync();
      await rankFromCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch (err) {
      // PERMISSION_DENIED = 1 in the GeolocationPositionError spec.
      const code = (err as GeolocationPositionError | undefined)?.code;
      if (code === 1) {
        setState({ ...INITIAL, status: 'denied' });
      } else {
        const message = err instanceof Error ? err.message : 'Could not get your location.';
        setState({ ...INITIAL, status: 'error', errorMessage: message });
      }
    }
  }, [rankFromCoords]);

  /**
   * ZIP fallback. Looks up the centroid of the matching store's ZIP within
   * the dataset (we don't have a generic ZIP→coords table; first store in
   * the ZIP is "good enough" for the prototype). Returns the resolved
   * Location on success so the caller can dispatch immediately.
   */
  const resolveByZip = useCallback(
    async (zip: string): Promise<Location | null> => {
      const cleaned = zip.trim().replace(/\D+/g, '').slice(0, 5);
      if (cleaned.length !== 5) return null;
      setState(s => ({ ...s, status: 'loading', errorMessage: null }));
      const stores = await loadStores();
      const match = stores.find(s => (s.address.zip || '').startsWith(cleaned));
      if (!match) {
        setState({
          ...INITIAL,
          status: 'error',
          errorMessage: `No Wendy's found near ${cleaned}.`,
        });
        return null;
      }
      const ranked = await rankFromCoords({ lat: match.lat, lng: match.lng });
      return ranked[0] ?? null;
    },
    [rankFromCoords],
  );

  // Auto-run on mount, exactly once. Subsequent re-mounts in the same
  // session are a no-op — the consumer can call request() to re-fetch.
  useEffect(() => {
    if (!autoRun) return;
    if (ranRef.current) return;
    ranRef.current = true;
    void request();
  }, [autoRun, request]);

  return { ...state, request, resolveByZip };
}
