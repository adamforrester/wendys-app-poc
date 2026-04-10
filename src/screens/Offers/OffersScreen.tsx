import { useState } from 'react';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Button } from '../../components/Button/Button';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { ListRow } from '../../components/ListRow/ListRow';
import { MenuCard } from '../../components/MenuCard/MenuCard';
import { useAuth } from '../../context/AuthContext';
import { useOfferData } from '../../hooks/useOfferData';
import { useMenuData } from '../../hooks/useMenuData';
import type { Offer } from '../../data/types';

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

function OfferRow({ offer, getProductImagePath }: { offer: Offer; getProductImagePath: (f: string) => string }) {
  const labels: { text: string; state: 'caution' | 'secondary' | 'success' | 'unavailable' }[] = [];

  if (isExpiringSoon(offer.expiresAt)) {
    labels.push({ text: 'Expires Soon!', state: 'caution' });
  }
  if ((offer as any).isForYou) {
    labels.push({ text: 'For You', state: 'secondary' });
  }
  if (offer.eligibility.state === 'progress') {
    const progress = offer.eligibility.progress;
    if (progress) {
      labels.push({ text: `$${progress.remaining.toFixed(2)} more to qualify`, state: 'secondary' });
    }
  }
  if (offer.eligibility.state === 'unavailable') {
    labels.push({ text: offer.eligibility.reason || 'Unavailable', state: 'unavailable' });
  }
  if (offer.eligibility.state === 'redeemed') {
    labels.push({ text: 'Redeemed', state: 'secondary' });
  }

  const imagePath = offer.image ? getProductImagePath(offer.image) : undefined;

  return (
    <ListRow
      headline={offer.title}
      supportText={formatExpiry(offer.expiresAt)}
      leading={imagePath ? 'image' : 'none'}
      leadingImage={imagePath}
      trailing="icon"
      labels={labels.length > 0 ? labels : undefined}
      metadata={offer.eligibility.state === 'progress' ? `$${offer.eligibility.progress?.current.toFixed(2)}/$${offer.eligibility.progress?.target}` : undefined}
    />
  );
}

const rewardsItems = [
  { id: 'rw_01', name: '4pc Chicken Nuggets', points: 200, image: 'food_chicken-nuggets-more_4-pc-chicken-nuggets_725.png' },
  { id: 'rw_02', name: 'Small Fries', points: 200, image: 'food_fries-sides_french-fries_165.png' },
  { id: 'rw_03', name: 'Crispy Chicken Sandwich', points: 300, image: 'food_chicken-nuggets-more_crispy-chicken-sandwich_2264.png' },
  { id: 'rw_04', name: 'Small Chili', points: 350, image: 'food_fries-sides_chili_170.png' },
  { id: 'rw_05', name: 'Jr Bacon Cheeseburger', points: 350, image: 'food_hamburgers_jr-bacon-cheeseburger_2260.png' },
  { id: 'rw_06', name: '6pc Chicken Nuggets', points: 350, image: 'food_chicken-nuggets-more_6-pc-chicken-nuggets_726.png' },
  { id: 'rw_07', name: 'Double Stack', points: 400, image: 'food_hamburgers_bacon-double-stack_2258.png' },
  { id: 'rw_08', name: '4pc French Toast Sticks', points: 400, image: 'food_classics_homestyle-french-toast-sticks-4-pc_1712.png' },
  { id: 'rw_09', name: 'Large Fries', points: 450, image: 'food_fries-sides_french-fries_165.png' },
  { id: 'rw_10', name: 'Honey Buddy Chicken Biscuit', points: 450, image: 'food_biscuits_honey-buddy-chicken-biscuit_440.png' },
  { id: 'rw_11', name: 'Bacon Egg & Cheese Biscuit', points: 450, image: 'food_biscuits_bacon-egg-cheese-biscuit_438.png' },
  { id: 'rw_12', name: 'Cinnabon Pull-Apart', points: 500, image: 'food_bakery_cinnabon-pull-apart_1982.png' },
  { id: 'rw_13', name: '10pc Chicken Nuggets', points: 600, image: 'food_chicken-nuggets-more_10-pc-chicken-nuggets_727.png' },
  { id: 'rw_14', name: 'Breakfast Baconator', points: 600, image: 'food_biscuits_sausage-biscuit_448.png' },
  { id: 'rw_15', name: 'Maple Bacon Chicken Croissant', points: 600, image: 'food_croissants_maple-bacon-chicken-croissant_823.png' },
  { id: 'rw_16', name: "Dave's Single\u00AE", points: 700, image: 'food_hamburgers_dave-s-single_2387.png' },
  { id: 'rw_17', name: 'Classic or Spicy Chicken Sandwich', points: 700, image: 'food_chicken-nuggets-more_crispy-chicken-sandwich_2264.png' },
  { id: 'rw_18', name: "Dave's Double\u00AE", points: 800, image: 'food_hamburgers_dave-s-double_2388.png' },
  { id: 'rw_19', name: 'Son of Baconator', points: 800, image: 'food_hamburgers_big-bacon-classic_2399.png' },
  { id: 'rw_20', name: 'Baconator', points: 900, image: 'food_hamburgers_baconator_2390.png' },
  { id: 'rw_21', name: 'Fresh Made Salad', points: 900, image: 'food_fresh-made-salads_apple-pecan-salad_1321.png' },
];

export function OffersScreen() {
  const { state: authState } = useAuth();
  const { getAllOffers, getRedeemedOffers } = useOfferData();
  const { getProductImagePath } = useMenuData();
  const [tab, setTab] = useState('offers');

  const availableOffers = getAllOffers().filter(o => o.eligibility.state === 'available' || o.eligibility.state === 'progress');
  const unavailableOffers = getAllOffers().filter(o => o.eligibility.state === 'unavailable');
  const redeemedOffers = getRedeemedOffers();

  return (
    <>
      <TopAppBar
        titleMode="logo"
        logoSrc="/images/rewards-logo-white.svg"
        showPoints={authState.isAuthenticated}
        points={authState.user?.rewardsPoints ?? 0}
      />

      {/* Offers / Rewards toggle */}
      <div className="px-wds-16 py-wds-8" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
        <SegmentedControl
          segments={[
            { id: 'offers', label: 'Offers' },
            { id: 'rewards', label: 'Rewards' },
          ]}
          activeSegment={tab}
          onSegmentChange={setTab}
          fullWidth
          density="lg"
        />
      </div>

      {tab === 'offers' && (
        <>
          {/* Redeem Promo Code button */}
          <div className="px-wds-16 pb-wds-8">
            <Button variant="outline" fullWidth size="small">
              Redeem Promo Code
            </Button>
          </div>

          {/* Available Offers */}
          <SectionHeader
            title="Available Offers"
            subtitle="Not available for delivery orders"
            size="large"
          />
          {availableOffers.map(offer => (
            <OfferRow key={offer.id} offer={offer} getProductImagePath={getProductImagePath} />
          ))}

          {/* Unavailable Offers */}
          {unavailableOffers.length > 0 && (
            <>
              <SectionHeader title="Unavailable" size="small" />
              {unavailableOffers.map(offer => (
                <OfferRow key={offer.id} offer={offer} getProductImagePath={getProductImagePath} />
              ))}
            </>
          )}

          {/* Redeemed Offers */}
          {redeemedOffers.length > 0 && (
            <>
              <SectionHeader title="Redeemed" size="small" />
              {redeemedOffers.map(offer => (
                <OfferRow key={offer.id} offer={offer} getProductImagePath={getProductImagePath} />
              ))}
            </>
          )}
        </>
      )}

      {tab === 'rewards' && (
        <>
          <SectionHeader
            title="Rewards Store"
            subtitle="Not available for delivery orders"
            size="large"
          />
          <div
            className="px-wds-16 pb-wds-16"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, alignItems: 'stretch' }}
          >
            {rewardsItems.map((item) => (
              <MenuCard
                key={item.id}
                title={item.name}
                subtitle={`${item.points} PTS`}
                showRewardsIcon
                imageSrc={getProductImagePath(item.image)}
              />
            ))}
          </div>

          {/* View History button */}
          <div className="px-wds-16 py-wds-8">
            <Button variant="outline" fullWidth size="large">
              View History
            </Button>
          </div>

          {/* Learn More About Rewards */}
          <div
            className="mt-wds-16"
            style={{
              backgroundColor: 'var(--color-bg-secondary-default)',
              padding: '24px 16px 32px 16px',
            }}
          >
            <button
              className="flex items-center gap-wds-8 border-none bg-transparent p-0 font-body text-[16px] leading-[24px] font-bold underline"
              style={{ color: 'var(--color-text-brand-secondary-default)' }}
            >
              Learn More About Rewards
              <span
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: 16, height: 16,
                  backgroundColor: 'var(--color-icon-brand-secondary-default)',
                  maskImage: 'url(/icons/caret-right.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                  WebkitMaskImage: 'url(/icons/caret-right.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                }}
              />
            </button>
            {/* Frosty nurdle placeholder — swap with campaign image when available */}
            <div className="flex justify-center mt-wds-16">
              <img
                src="/images/nurdles/Rewards Bowl.svg"
                alt=""
                style={{ width: 200, height: 200, opacity: 0.8 }}
              />
            </div>
          </div>
        </>
      )}

    </>
  );
}
