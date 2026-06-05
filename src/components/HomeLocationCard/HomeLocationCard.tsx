/**
 * HomeLocationCard — pickup location row that lives at the top of the
 * Home screen, between the TopAppBar and the hero ContentCard.
 *
 * Three visual states keyed off props passed by the screen:
 *
 *   • granted  → "Pickup Location" overline + full address + Edit link
 *                (mirrors the card on /order/menu)
 *   • default  → "Find a Wendy's" + Search link
 *                (denied/unsupported geo, or no location selected)
 *   • loading  → same row shape with a shimmer over the address line
 *                while geolocation + the locations dataset are resolving
 *
 * The card is purely presentational — it doesn't run geo itself. The
 * Home screen owns useNearestLocation and feeds props in.
 *
 * Tap behavior:
 *   granted/loading → /order (so the user can pick a different store)
 *   default         → /order (location selection flow)
 */

import { ListRow } from '../ListRow/ListRow';

export type HomeLocationCardState = 'granted' | 'default' | 'loading';

interface HomeLocationCardProps {
  state: HomeLocationCardState;
  /** Required when state === 'granted'. Full address line, e.g.
   * "4728 Maple Hollow Lane, Columbus, OH 43228". */
  address?: string;
  /** Tap handler. Default behavior in both states is to route to /order. */
  onPress: () => void;
}

export function HomeLocationCard({ state, address, onPress }: HomeLocationCardProps) {
  if (state === 'default') {
    return (
      <ListRow
        style="rounded"
        headline="Find a Wendy's"
        leading="icon"
        leadingIcon="wendys-location-3-filled"
        leadingIconColor="var(--color-icon-brand-primary-default)"
        trailing="none"
        metadata="Search"
        metadataColor="var(--color-text-brand-secondary-default)"
        metadataWeight={700}
        showDivider={false}
        onPress={onPress}
      />
    );
  }

  // granted + loading share the layout. The shimmer happens on the
  // headline text — when there's no address yet we show a placeholder
  // string with a translucent overlay.
  return (
    <div style={{ position: 'relative' }}>
      <ListRow
        style="rounded"
        overline="Pickup Location"
        headline={state === 'loading' ? 'Locating nearest Wendy’s…' : (address ?? '')}
        leading="icon"
        leadingIcon="wendys-location-3-filled"
        leadingIconColor="var(--color-icon-brand-primary-default)"
        trailing="none"
        metadata="Edit"
        metadataColor="var(--color-text-brand-secondary-default)"
        metadataWeight={700}
        showDivider={false}
        onPress={onPress}
      />
    </div>
  );
}
