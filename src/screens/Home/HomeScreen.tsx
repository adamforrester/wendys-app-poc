import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SESSION_SNACKBAR_KEY = 'home-nearest-snackbar-shown';

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

  // When the hook lands on a granted result and we don't already have a
  // selected location, push it into LocationContext + flash the snackbar
  // (once per browser session). If the user is denied, mark the
  // permission so other surfaces (voice) can ask for ZIP/city instead.
  useEffect(() => {
    if (nearest.status === 'granted' && nearest.nearest && !locationState.selectedLocation) {
      locationDispatch({ type: 'SET_LOCATION', location: nearest.nearest });
      locationDispatch({ type: 'SET_PERMISSION', permission: 'granted' });
      try {
        if (sessionStorage.getItem(SESSION_SNACKBAR_KEY) !== '1') {
          sessionStorage.setItem(SESSION_SNACKBAR_KEY, '1');
          setShowNearestSnackbar(true);
        }
      } catch {
        // sessionStorage unavailable (private mode in some browsers) — show anyway, once per mount.
        setShowNearestSnackbar(true);
      }
    } else if (nearest.status === 'denied') {
      locationDispatch({ type: 'SET_PERMISSION', permission: 'denied' });
    }
  }, [nearest.status, nearest.nearest, locationState.selectedLocation, locationDispatch]);

  // Decide which HomeLocationCard variant to render. The card is purely
  // presentational — we compose state here based on what the user has
  // and where the geo lookup is.
  const cardState =
    locationState.selectedLocation
      ? 'granted'
      : nearest.status === 'loading' || nearest.status === 'idle'
        ? 'loading'
        : 'default';
  const cardAddress = locationState.selectedLocation
    ? `${locationState.selectedLocation.address.street}, ${locationState.selectedLocation.address.city}, ${locationState.selectedLocation.address.state} ${locationState.selectedLocation.address.zip}`
    : undefined;

  return (
    <>
      <TopAppBar
        titleMode="logo"
        showPoints={authState.isAuthenticated}
        points={authState.user?.rewardsPoints ?? 0}
        showFind
        showBag
      />

      {/* Pickup location card — granted (address) | loading (skeleton-ish) |
          default ("Find a Wendy's") based on geo + selectedLocation. */}
      <div className="px-wds-16 pt-wds-8">
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

      {/* "We've selected your nearest Wendy's location" — fires once per
          browser session when geo auto-picks a store. Sits above the
          bottom tab bar so it doesn't get clipped. */}
      {showNearestSnackbar && (
        <div
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 88, // above the 80px tab bar
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <Snackbar
              message="We've selected your nearest Wendy's location."
              showClose
              onClose={() => setShowNearestSnackbar(false)}
              duration={4000}
            />
          </div>
        </div>
      )}
    </>
  );
}
