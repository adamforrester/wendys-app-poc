import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Location } from '../data/types';

export type FulfillmentMethod = 'drive-thru' | 'carry-out' | 'dine-in';
export type LocationPermission = 'granted' | 'denied' | 'prompt';

// Re-export so existing imports of `Location` from this module keep working.
// The canonical definition lives in src/data/types.ts (matches the JSON shape:
// hours.breakfast/regular, phoneNumber, fulfillmentMethods as string[]).
export type { Location };

interface LocationState {
  selectedLocation: Location | null;
  /**
   * Other nearby stores ranked by distance from the user — populated by
   * whichever screen runs `useNearestLocation` (Home on geo grant, voice
   * on ZIP resolve). Shared here so the Order tab's map and any other
   * "browse nearby Wendy's" surfaces don't have to re-run the ranking
   * (5,629-row scan) or, worse, re-prompt for geolocation. Includes the
   * primary `selectedLocation` as the first entry by convention.
   */
  candidates: Location[];
  fulfillmentMethod: FulfillmentMethod | null;
  locationPermission: LocationPermission;
}

type LocationAction =
  | { type: 'SET_LOCATION'; location: Location }
  | { type: 'SET_CANDIDATES'; candidates: Location[] }
  | { type: 'SET_FULFILLMENT'; method: FulfillmentMethod }
  | { type: 'SET_PERMISSION'; permission: LocationPermission }
  | { type: 'CLEAR_LOCATION' };

const initialState: LocationState = {
  selectedLocation: null,
  candidates: [],
  fulfillmentMethod: null,
  locationPermission: 'prompt',
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, selectedLocation: action.location };
    case 'SET_CANDIDATES':
      return { ...state, candidates: action.candidates };
    case 'SET_FULFILLMENT':
      return { ...state, fulfillmentMethod: action.method };
    case 'SET_PERMISSION':
      return { ...state, locationPermission: action.permission };
    case 'CLEAR_LOCATION':
      return { ...state, selectedLocation: null, fulfillmentMethod: null, candidates: [] };
    default:
      return state;
  }
}

const LocationContext = createContext<{
  state: LocationState;
  dispatch: React.Dispatch<LocationAction>;
} | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  return (
    <LocationContext.Provider value={{ state, dispatch }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
}
