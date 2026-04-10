/* ── Menu Types ── */

export interface CalorieRange {
  min: number;
  max: number;
}

export interface ComboStep {
  type: string;
  label: string;
  options: ComboStepOption[];
}

export interface ComboStepOption {
  id: string;
  name: string;
  image?: string;
  priceDelta?: number;
  calories?: number;
}

export interface ComboSizeOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ComboConfig {
  comboSteps: ComboStep[];
  defaultSide?: string;
  defaultDrink?: string;
  sizeOptions?: ComboSizeOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  calories: CalorieRange;
  isCombo: boolean;
  productType: string;
  comboConfig?: ComboConfig;
  comboPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  daypart: string;
  displayOrder: number;
  itemCount: number;
  items: Product[];
}

/* ── Ingredient Types ── */

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  hasEdit: boolean;
  modifiers: string[];
  defaultState: string;
  appliesTo: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  calories: number;
  category: string;
  maxQuantity: number;
  isFeaturedUpsell?: boolean;
  isFree?: boolean;
}

export interface AddOnGroup {
  label: string;
  addOnIds: string[];
}

/* ── Location Types ── */

export interface LocationHours {
  open: string;
  close: string;
}

export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates: { lat: number; lng: number };
  distance: number;
  isOpen: boolean;
  hours: {
    breakfast: LocationHours;
    regular: LocationHours;
  };
  fulfillmentMethods: string[];
  phoneNumber: string;
}

/* ── Offer Types ── */

export interface OfferEligibility {
  state: string;
  minimumPurchase?: number;
  progress?: {
    current: number;
    target: number;
    remaining: number;
  } | null;
  reason?: string;
  redeemedAt?: string;
  [key: string]: unknown;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  type: string;
  eligibility: OfferEligibility;
  expiresAt: string;
  redemptionLimit: number;
  terms?: string;
  isRedeemed?: boolean;
  [key: string]: unknown;
}

/* ── User Types ── */

export interface RewardsProfile {
  memberId: string;
  points: number;
  tier: string;
  tierProgress: {
    currentTier: string;
    nextTier: string;
    pointsToNextTier: number;
    nextTierThreshold: number;
  };
  lifetimePoints: number;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiresAt: string;
  isDefault: boolean;
}

export interface RecentOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RecentOrder {
  id: string;
  date: string;
  location: string;
  total: number;
  items: RecentOrderItem[];
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rewardsProfile: RewardsProfile;
  favoriteLocation: string;
  paymentMethods: PaymentMethod[];
  recentOrders: RecentOrder[];
}
