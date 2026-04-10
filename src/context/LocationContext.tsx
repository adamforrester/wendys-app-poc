import { createContext, useContext, useReducer, type ReactNode } from 'react';

export type FulfillmentMethod = 'drive-thru' | 'carry-out' | 'curbside';
export type LocationPermission = 'granted' | 'denied' | 'prompt';

export interface Location {
  id: string;
  name: string;
  address: { street: string; city: string; state: string; zip: string };
  distance: number;
  isOpen: boolean;
  hours: { open: string; close: string };
  fulfillmentMethods: FulfillmentMethod[];
  coordinates: { lat: number; lng: number };
}

interface LocationState {
  selectedLocation: Location | null;
  fulfillmentMethod: FulfillmentMethod | null;
  locationPermission: LocationPermission;
}

type LocationAction =
  | { type: 'SET_LOCATION'; location: Location }
  | { type: 'SET_FULFILLMENT'; method: FulfillmentMethod }
  | { type: 'SET_PERMISSION'; permission: LocationPermission }
  | { type: 'CLEAR_LOCATION' };

const initialState: LocationState = {
  selectedLocation: null,
  fulfillmentMethod: null,
  locationPermission: 'prompt',
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, selectedLocation: action.location };
    case 'SET_FULFILLMENT':
      return { ...state, fulfillmentMethod: action.method };
    case 'SET_PERMISSION':
      return { ...state, locationPermission: action.permission };
    case 'CLEAR_LOCATION':
      return { ...state, selectedLocation: null, fulfillmentMethod: null };
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
