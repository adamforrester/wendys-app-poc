import { useMemo } from 'react';
import userJson from '../data/user.json';
import type { AuthenticatedUser, RecentOrder, PaymentMethod } from '../data/types';

const data = userJson as unknown as { authenticatedUser: AuthenticatedUser };

/**
 * Read-only access to mock user data.
 * For mutable auth state (login/logout), use useAuth() context instead.
 * This hook provides the default authenticated user profile data.
 */
export function useUserData() {
  return useMemo(() => {
    const getUser = (): AuthenticatedUser => data.authenticatedUser;

    const getRewardsPoints = (): number => data.authenticatedUser.rewardsProfile.points;

    const getRewardsTier = (): string => data.authenticatedUser.rewardsProfile.tier;

    const getPointsToNextTier = (): number => data.authenticatedUser.rewardsProfile.tierProgress.pointsToNextTier;

    const getPaymentMethods = (): PaymentMethod[] => data.authenticatedUser.paymentMethods;

    const getDefaultPayment = (): PaymentMethod | undefined =>
      data.authenticatedUser.paymentMethods.find(p => p.isDefault);

    const getRecentOrders = (): RecentOrder[] => data.authenticatedUser.recentOrders;

    const getFavoriteLocationId = (): string => data.authenticatedUser.favoriteLocation;

    return {
      getUser,
      getRewardsPoints,
      getRewardsTier,
      getPointsToNextTier,
      getPaymentMethods,
      getDefaultPayment,
      getRecentOrders,
      getFavoriteLocationId,
      user: data.authenticatedUser,
    };
  }, []);
}
