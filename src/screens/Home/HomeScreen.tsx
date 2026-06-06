import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { ListRow } from '../../components/ListRow/ListRow';
import { HomeLocationCard } from '../../components/HomeLocationCard/HomeLocationCard';
import { Snackbar } from '../../components/Snackbar/Snackbar';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { useOfferData } from '../../hooks/useOfferData';
import { useMenuData } from '../../hooks/useMenuData';
import { useNearestLocation } from '../../hooks/useNearestLocation';

function formatExpiry(isoDate: string): string {
  const d = new Date(isoDate);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `Expires ${mm}/${dd}/${d.getFullYear()}`;
}

function isExpiringSoon(isoDate: string, days = 7): boolean {
  const diff = new Date(isoDate).getTime() - Date.now();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { state: locationState, dispatch: locationDispatch } = useLocationCtx();
  const { getActiveOffers } = useOfferData();
  const { getProductImagePath } = useMenuData();

  const activeOffers = getActiveOffers().slice(0, 4);

  // Geo-driven nearest store. Auto-runs on first mount of the session.
  // Subsequent home re-mounts (e.g. tab nav back to /) are a no-op once
  // the hook has resolved — selectedLocation in LocationContext is the
  // source of truth.
  const nearest = useNearestLocation();
  const [showNearestSnackbar, setShowNearestSnackbar] = useState(false);
  // Whether we've already auto-set a location during *this* mount of
  // HomeScreen. Prevents the snackbar from re-firing on every render
  // and prevents us from clobbering a manual location pick made later.
  const autoSetThisMountRef = useRef(false);

  // When the hook lands on a granted result and we don't already have a
  // selected location, push it into LocationContext + flash the snackbar.
  // The snackbar fires once per HomeScreen mount where we auto-picked.
  // If the user is denied, mark the permission so other surfaces (voice)
  // can ask for ZIP/city instead.
  useEffect(() => {
    if (
      nearest.status === 'granted' &&
      nearest.nearest &&
      !locationState.selectedLocation &&
      !autoSetThisMountRef.current
    ) {
      autoSetThisMountRef.current = true;
      locationDispatch({ type: 'SET_LOCATION', location: nearest.nearest });
      locationDispatch({ type: 'SET_PERMISSION', permission: 'granted' });
      setShowNearestSnackbar(true);
    } else if (nearest.status === 'denied') {
      locationDispatch({ type: 'SET_PERMISSION', permission: 'denied' });
    }
  }, [nearest.status, nearest.nearest, locationState.selectedLocation, locationDispatch]);

  // Decide which HomeLocationCard variant to render. The card is purely
  // presentational — we compose state here based on what the user has
  // and where the geo lookup is. The 'loading' transient is folded into
  // 'default' so the user just sees "Find a Wendy's" until geo resolves
  // (typically a few hundred ms — flashing a temporary "locating…" copy
  // is more distracting than helpful).
  const cardState = locationState.selectedLocation ? 'granted' : 'default';
  const cardAddress = locationState.selectedLocation
    ? `${locationState.selectedLocation.address.street}, ${locationState.selectedLocation.address.city}, ${locationState.selectedLocation.address.state} ${locationState.selectedLocation.address.zip}`
    : undefined;

  return (
    <>
      <TopAppBar
        titleMode="logo"
        showPoints={authState.isAuthenticated}
        points={authState.user?.rewardsPoints ?? 0}
        showBag
      />

      {/* Pickup location card — granted (address) | loading (skeleton-ish) |
          default ("Find a Wendy's") based on geo + selectedLocation.
          ListRow style="rounded" provides its own 16px horizontal padding,
          so we only add the top spacer here. Wrapping in px-wds-16 would
          double-pad and shrink the card from 358px to 326px. */}
      <div className="pt-wds-8">
        <HomeLocationCard
          state={cardState}
          address={cardAddress}
          onPress={() => navigate('/order')}
        />
      </div>

      {/* Hero promo banner */}
      <div className="px-wds-16 pt-wds-8">
        <ContentCard size="large" onPress={() => navigate('/order')} />
      </div>

      {/* Your Offers section */}
      <SectionHeader
        title="Your Offers"
        subtitle="Not available for delivery orders"
        size="large"
        ctaLabel="View All"
        onCtaPress={() => navigate('/offers')}
      />

      {/* Offer list rows */}
      {activeOffers.map((offer) => {
        const labels: { text: string; state: 'caution' | 'secondary' | 'success' }[] = [];
        if (isExpiringSoon(offer.expiresAt)) {
          labels.push({ text: 'Expires Soon!', state: 'caution' });
        }
        if ((offer as any).isForYou) {
          labels.push({ text: 'For You', state: 'secondary' });
        }

        const imagePath = offer.image ? getProductImagePath(offer.image) : undefined;

        return (
          <ListRow
            key={offer.id}
            headline={offer.title}
            supportText={formatExpiry(offer.expiresAt)}
            leading={imagePath ? 'image' : 'none'}
            leadingImage={imagePath}
            trailing="icon"
            labels={labels.length > 0 ? labels : undefined}
            onPress={() => navigate('/offers')}
          />
        );
      })}

      {/* Secondary promo banner */}
      <div className="px-wds-16 py-wds-8">
        <ContentCard size="small" onPress={() => navigate('/offers')} />
      </div>

      {/* Privacy policy link */}
      <ListRow headline="Our Privacy Policy" trailing="icon" showDivider={false} />

      {/* "We've selected your nearest Wendy's location" — fires every
          time HomeScreen freshly auto-picks a store. position: absolute
          (NOT fixed) is intentional: the app renders inside DeviceFrame,
          which is the nearest positioned ancestor; fixed positions
          relative to the desktop viewport and ends up off-screen below
          the device. AnimatePresence drives the snackbar's spring entry. */}
      <AnimatePresence>
        {showNearestSnackbar && (
          // bottom: 174 clears the voice FAB (sits at bottom:110, h:56)
          // with an 8px gap above its top edge. If/when the FAB moves or
          // is removed, drop this back to ~100.
          <div style={{ position: 'absolute', bottom: 174, left: 0, right: 0, zIndex: 30 }}>
            <Snackbar
              message="We've selected your nearest Wendy's location."
              showClose
              onClose={() => setShowNearestSnackbar(false)}
              duration={4000}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
