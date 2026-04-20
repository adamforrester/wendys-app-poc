import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { ItemSelector } from '../../components/ItemSelector/ItemSelector';
import { Button } from '../../components/Button/Button';
import { useBag } from '../../context/BagContext';
import { useLocation } from '../../context/LocationContext';
import { useLocationData } from '../../hooks/useLocationData';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function getStaticMapUrl(lat: number, lng: number): string | null {
  if (!MAPBOX_TOKEN) return null;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+cd2028(${lng},${lat})/${lng},${lat},14,0/390x179@2x?access_token=${MAPBOX_TOKEN}`;
}

interface FulfillmentOption {
  id: string;
  label: string;
  image: string;
  status: string;
  statusColor: 'positive' | 'critical' | 'warning';
  available: boolean;
}

const fulfillmentOptions: FulfillmentOption[] = [
  {
    id: 'carry-out',
    label: 'Carryout',
    image: '/images/nurdles/Carryout-right.svg',
    status: 'Closed',
    statusColor: 'critical',
    available: false,
  },
  {
    id: 'drive-thru',
    label: 'Drive-Thru',
    image: '/images/nurdles/Drive Thru.svg',
    status: 'Open',
    statusColor: 'positive',
    available: true,
  },
  {
    id: 'dine-in',
    label: 'Dine In',
    image: '/images/nurdles/Dine In.svg',
    status: 'Closing Soon',
    statusColor: 'warning',
    available: true,
  },
];

export function LocationConfirmationScreen() {
  const navigate = useNavigate();
  const { dispatch: bagDispatch } = useBag();
  const { state: locationState } = useLocation();
  const { getFormattedAddress, getAllLocations } = useLocationData();

  // Use first location from data as the mock selected location
  const allLocations = getAllLocations();
  const location = allLocations.length > 0 ? allLocations[0] : null;

  // Default to first available fulfillment option
  const [selectedFulfillment, setSelectedFulfillment] = useState(
    locationState.fulfillmentMethod || 'drive-thru'
  );
  const [isFavorited, setIsFavorited] = useState(false);

  const handleProceed = () => {
    bagDispatch({ type: 'CONFIRM_LOCATION' });
    navigate('/order/bag');
  };

  if (!location) {
    return (
      <div className="h-full flex flex-col">
        <TopAppBar
          titleMode="title"
          title="Location"
          titlePlacement="center"
          titleWeight="semibold"
          showBackButton
          onBack={() => navigate(-1)}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body" style={{ color: 'var(--color-text-secondary-default)' }}>
            No location selected
          </p>
        </div>
      </div>
    );
  }

  const formattedAddress = getFormattedAddress(location);
  const closingTime = location.hours?.regular?.close || '12:00 AM';

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
      <TopAppBar
        titleMode="title"
        title="Location"
        titlePlacement="center"
        titleWeight="semibold"
        showBackButton
        onBack={() => navigate(-1)}
        showBag
      />

      <div className="flex-1 overflow-y-auto">
        {/* Static map image */}
        <img
          src={
            getStaticMapUrl(location.coordinates.lat, location.coordinates.lng)
            || '/images/generic-map.png'
          }
          alt={`Map showing ${location.name}`}
          style={{
            width: '100%',
            height: 179,
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/generic-map.png';
          }}
        />

        {/* Section Header: Confirm Your Location */}
        <SectionHeader title="Confirm Your Location" />

        {/* Location details card */}
        <div className="px-wds-24" style={{ paddingBottom: 16 }}>
          <div className="flex gap-wds-0">
            {/* Text content */}
            <div className="flex-1 flex flex-col" style={{ gap: 4 }}>
              <span
                className="font-display font-bold"
                style={{
                  fontSize: 16,
                  lineHeight: '20px',
                  color: 'var(--color-text-primary-default)',
                }}
              >
                {location.name}
              </span>
              <span
                className="font-body"
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  color: 'var(--color-text-primary-default)',
                }}
              >
                {formattedAddress}
              </span>
              <div className="flex items-center" style={{ gap: 4 }}>
                <span
                  className="font-body"
                  style={{
                    fontSize: 14,
                    lineHeight: '20px',
                    color: 'var(--color-text-secondary-default)',
                  }}
                >
                  {location.distance} km
                </span>
                <span
                  className="font-body font-bold"
                  style={{
                    fontSize: 14,
                    lineHeight: '20px',
                    color: location.isOpen
                      ? 'var(--color-text-validation-positive)'
                      : 'var(--color-text-validation-critical)',
                  }}
                >
                  {location.isOpen ? 'Open' : 'Closed'}
                </span>
                <span
                  className="font-body"
                  style={{
                    fontSize: 14,
                    lineHeight: '20px',
                    color: 'var(--color-text-secondary-default)',
                  }}
                >
                  &bull; Closes {closingTime}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: 'var(--color-icon-secondary-default)',
                    maskImage: 'url(/icons/caret-down.svg)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: 'url(/icons/caret-down.svg)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                  }}
                />
              </div>
            </div>

            {/* Favorite button */}
            <button
              className="flex items-center justify-center border-none bg-transparent flex-shrink-0"
              style={{ width: 48, height: 48, padding: 0 }}
              onClick={() => setIsFavorited(!isFavorited)}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: isFavorited
                    ? 'var(--color-icon-brand-primary-default)'
                    : 'var(--color-icon-primary-default)',
                  maskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: `url(/icons/favorite-${isFavorited ? 'filled' : 'outline'}.svg)`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                }}
              />
            </button>
          </div>

          {/* Change Location button */}
          <div style={{ paddingTop: 16 }}>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/order')}
            >
              Change Location
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)', marginLeft: 16 }} />

        {/* How would you like your order? */}
        <div className="px-wds-16 py-wds-16">
          <span
            className="font-display font-bold"
            style={{
              fontSize: 16,
              lineHeight: '20px',
              color: 'var(--color-text-primary-default)',
            }}
          >
            How would you like your order?
          </span>
        </div>

        {/* Fulfillment method selectors */}
        <div className="flex justify-center" style={{ gap: 23, padding: '8px 32px' }}>
          {fulfillmentOptions.map((option) => (
            <ItemSelector
              key={option.id}
              title={option.label}
              imageSrc={option.image}
              caption={option.status}
              captionColor={option.statusColor}
              selected={selectedFulfillment === option.id}
              disabled={!option.available}
              onPress={() => {
                if (option.available) setSelectedFulfillment(option.id as any);
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-wds-24 pb-wds-24 pt-wds-16">
        <Button
          variant="filled"
          fullWidth
          onClick={handleProceed}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
