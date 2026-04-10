import { useMemo } from 'react';
import offersJson from '../data/offers.json';
import type { Offer } from '../data/types';

const data = offersJson as unknown as { offers: Offer[] };

/**
 * Read-only access to offer data.
 */
export function useOfferData() {
  return useMemo(() => {
    const getAllOffers = (): Offer[] => data.offers;

    const getOfferById = (id: string): Offer | undefined =>
      data.offers.find(o => o.id === id);

    const getAvailableOffers = (): Offer[] =>
      data.offers.filter(o => o.eligibility.state === 'available');

    const getProgressOffers = (): Offer[] =>
      data.offers.filter(o => o.eligibility.state === 'progress');

    const getUnavailableOffers = (): Offer[] =>
      data.offers.filter(o => o.eligibility.state === 'unavailable');

    const getRedeemedOffers = (): Offer[] =>
      data.offers.filter(o => o.eligibility.state === 'redeemed');

    const getActiveOffers = (): Offer[] =>
      data.offers.filter(o => o.eligibility.state === 'available' || o.eligibility.state === 'progress');

    return {
      getAllOffers,
      getOfferById,
      getAvailableOffers,
      getProgressOffers,
      getUnavailableOffers,
      getRedeemedOffers,
      getActiveOffers,
      offers: data.offers,
    };
  }, []);
}
