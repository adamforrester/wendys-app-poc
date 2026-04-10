import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { ListRow } from '../../components/ListRow/ListRow';
import { useAuth } from '../../context/AuthContext';
import { useOfferData } from '../../hooks/useOfferData';
import { useMenuData } from '../../hooks/useMenuData';

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
  const { getActiveOffers } = useOfferData();
  const { getProductImagePath } = useMenuData();

  const activeOffers = getActiveOffers().slice(0, 4);

  return (
    <>
      <TopAppBar
        titleMode="logo"
        showPoints={authState.isAuthenticated}
        points={authState.user?.rewardsPoints ?? 0}
        showFind
        showBag
      />

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

    </>
  );
}
