/**
 * HomeLocationCard — pickup location row that lives at the top of the
 * Home screen, between the TopAppBar and the hero ContentCard.
 *
 * Two visual states keyed off props passed by the screen:
 *
 *   • granted  → "Pickup Location" overline + full address + Edit link
 *                (mirrors the card on /order/menu)
 *   • default  → "Find a Wendy's" + Search link, used until a location
 *                is selected (covers idle/loading geo AND denied)
 *
 * The card is purely presentational — it doesn't run geo itself. The
 * Home screen owns useNearestLocation and feeds props in.
 */

import { ListRow } from '../ListRow/ListRow';

export type HomeLocationCardState = 'granted' | 'default';

interface HomeLocationCardProps {
  state: HomeLocationCardState;
  /** Required when state === 'granted'. Full address line, e.g.
   * "4728 Maple Hollow Lane, Columbus, OH 43228". */
  address?: string;
  /** Tap handler. Routes to /order (location selection) in both states. */
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

  return (
    <ListRow
      style="rounded"
      overline="Pickup Location"
      headline={address ?? ''}
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
  );
}
