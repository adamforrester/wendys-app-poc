import { useMemo } from 'react';
import locationsJson from '../data/locations.json';
import type { Location } from '../data/types';

const data = locationsJson as unknown as { locations: Location[] };

/**
 * Read-only access to location data.
 */
export function useLocationData() {
  return useMemo(() => {
    const getAllLocations = (): Location[] => data.locations;

    const getLocationById = (id: string): Location | undefined =>
      data.locations.find(l => l.id === id);

    const getOpenLocations = (): Location[] =>
      data.locations.filter(l => l.isOpen);

    const getClosedLocations = (): Location[] =>
      data.locations.filter(l => !l.isOpen);

    const getLocationsByFulfillment = (method: string): Location[] =>
      data.locations.filter(l => l.fulfillmentMethods.includes(method));

    const getNearestLocations = (limit = 5): Location[] =>
      [...data.locations].sort((a, b) => a.distance - b.distance).slice(0, limit);

    const getFormattedAddress = (location: Location): string =>
      `${location.address.street}, ${location.address.city}, ${location.address.state} ${location.address.zip}`;

    return {
      getAllLocations,
      getLocationById,
      getOpenLocations,
      getClosedLocations,
      getLocationsByFulfillment,
      getNearestLocations,
      getFormattedAddress,
      locations: data.locations,
    };
  }, []);
}
