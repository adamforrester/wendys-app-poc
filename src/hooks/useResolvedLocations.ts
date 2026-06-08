/**
 * useResolvedLocations — bridges the geo-driven real-store data with the
 * order-flow screens that used to hardcode the 5 Columbus mocks.
 *
 * The Order tab map, Location Confirmation, Bag pickup row, and the menu
 * "Pickup Location" header all need to display the store the user is
 * actually at. Home owns the geolocation prompt and writes both the
 * picked store and the ranked top-5 candidates into `LocationContext`;
 * voice's ZIP fence does the same on the denied-geo path. This hook
 * unifies all of that into one "what stores should we render?" answer.
 *
 * Resolution order:
 *   1. If LocationContext has a selectedLocation, use it as `primary` and
 *      union it with `LocationContext.candidates` (deduped by id) for the
 *      list. If no candidates yet (rare — voice resolved via ZIP without
 *      ranking, or someone manually dispatched SET_LOCATION), pad the
 *      tail with the 5 mocks so the Order tab map still has multiple pins.
 *   2. If LocationContext has candidates but no selection (transient state
 *      while Home is mid-dispatch, or after CLEAR_LOCATION),  surface the
 *      candidates with the first as primary.
 *   3. Fallback to the 5 mocks. Cold-start before any geo or ZIP path has
 *      run; also covers prototype scenarios where geolocation isn't
 *      granted (developer testing without permission).
 *
 * This hook does NOT trigger any geolocation request — Home is the single
 * owner of the browser permission dialog. Order/Bag/Menu/Confirm just
 * consume what's already been resolved.
 */

import { useMemo } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLocationData } from './useLocationData';
import type { Location } from '../data/types';

interface UseResolvedLocationsResult {
  /** The single store to highlight — selected location, then nearest, then first mock. */
  primary: Location | null;
  /** The full list to display (primary first, then any other candidates / mocks). */
  list: Location[];
  /** True when we're showing real geo-resolved data (not the mock fallback). */
  isReal: boolean;
}

export function useResolvedLocations(): UseResolvedLocationsResult {
  const { state: locationState } = useLocation();
  const { getAllLocations } = useLocationData();

  return useMemo(() => {
    const selected = locationState.selectedLocation;
    const candidates = locationState.candidates;
    const mocks = getAllLocations();

    if (selected) {
      const seen = new Set<string>([selected.id]);
      const rest: Location[] = [];
      for (const c of candidates) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          rest.push(c);
        }
      }
      // Pad with mocks when we have a chosen store but no ranked
      // candidates yet (e.g. someone dispatched SET_LOCATION manually).
      if (rest.length === 0) {
        for (const m of mocks) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            rest.push(m);
          }
        }
      }
      return { primary: selected, list: [selected, ...rest], isReal: true };
    }

    if (candidates.length > 0) {
      return {
        primary: candidates[0] ?? null,
        list: candidates,
        isReal: true,
      };
    }

    return {
      primary: mocks[0] ?? null,
      list: mocks,
      isReal: false,
    };
  }, [locationState.selectedLocation, locationState.candidates, getAllLocations]);
}
