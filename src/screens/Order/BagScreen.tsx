import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { SectionHeader } from '../../components/SectionHeader/SectionHeader';
import { Chip } from '../../components/Chip/Chip';
import { Button } from '../../components/Button/Button';
import { BagItemCard } from '../../components/BagItemCard/BagItemCard';
import { ActionCard } from '../../components/ActionCard/ActionCard';
import { DonationSection } from '../../components/DonationSection/DonationSection';
import { OrderSummary, type OrderSummaryLine } from '../../components/OrderSummary/OrderSummary';
import { useBag } from '../../context/BagContext';
import { useLocation } from '../../context/LocationContext';
import { useLocationData } from '../../hooks/useLocationData';
import { useMenuData } from '../../hooks/useMenuData';

/* ── Cross-sell/upsell items for "Complete your meal" ── */
const crossSellItems = [
  { title: 'Baconator Fries', subtitle: '$3.99 | 480 Cal.', imageSrc: '/images/product-images/food_fries-sides_baconator-fries_217.png' },
  { title: 'Classic Frosty', subtitle: '$1.00 | 4 Sizes', imageSrc: '/images/product-images/food_frosty-_classic-chocolate-frosty_179.png' },
  { title: 'Small Chili', subtitle: '$2.49 | 280 Cal.', imageSrc: '/images/product-images/food_fries-sides_chili_170.png' },
  { title: 'Apple Pecan Salad', subtitle: '$8.29 | 560 Cal.', imageSrc: '/images/product-images/food_fresh-made-salads_apple-pecan-salad_1321.png' },
];

/* ── Pickup time chips ── */
function getPickupTimes(): string[] {
  const now = new Date();
  const times: string[] = [];
  // Round up to next 5-minute interval
  const minutes = Math.ceil(now.getMinutes() / 5) * 5 + 5;
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setMinutes(minutes + i * 5);
    d.setSeconds(0);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const h12 = h % 12 || 12;
    times.push(`${h12}:${m}`);
  }
  return times;
}

export function BagScreen() {
  const navigate = useNavigate();
  const { state: bagState, dispatch: bagDispatch } = useBag();
  const { state: locationState } = useLocation();
  const { getAllLocations, getFormattedAddress } = useLocationData();
  const { getProductById, getProductImagePath } = useMenuData();

  const [donationChecked, setDonationChecked] = useState(true);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Location data
  const allLocations = getAllLocations();
  const location = allLocations.length > 0 ? allLocations[0] : null;
  const fulfillmentMethod = locationState.fulfillmentMethod || 'drive-thru';
  const isCarryout = fulfillmentMethod === 'carry-out';

  const fulfillmentLabel = fulfillmentMethod === 'drive-thru'
    ? 'Drive-Thru'
    : fulfillmentMethod === 'dine-in'
      ? 'Dine In'
      : 'Carryout';

  const pickupTimes = getPickupTimes();

  // Calculate totals
  const subtotal = bagState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = -3.00; // Mock discount
  const taxRate = 0.0825;
  const taxableAmount = subtotal + discount;
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const donation = donationChecked ? Math.ceil((taxableAmount + tax) * 100) / 100 - (taxableAmount + tax) || 0.21 : 0;
  const total = Math.round((taxableAmount + tax + donation) * 100) / 100;

  const summaryLines: OrderSummaryLine[] = [
    ...(discount < 0 ? [{ label: 'Discount', value: `$${discount.toFixed(2)}`, variant: 'discount' as const }] : []),
    { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
    { label: 'Tax', value: `$${tax.toFixed(2)}` },
    ...(donationChecked ? [{ label: 'Donation', value: `$${donation.toFixed(2)}` }] : []),
    { label: 'Total', value: `$${total.toFixed(2)}`, variant: 'total' as const },
  ];

  // Carousel scroll handler
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 358 + 12; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setCarouselIndex(Math.min(index, crossSellItems.length - 1));
  };

  // Empty bag state
  if (bagState.items.length === 0) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
        <TopAppBar
          titleMode="title"
          title="Your Bag"
          titlePlacement="center"
          titleWeight="black"
          showBackButton
          onBack={() => navigate(-1)}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-wds-16" style={{ gap: 16 }}>
          <span
            className="font-display font-[800]"
            style={{ fontSize: 23, lineHeight: '32px', color: 'var(--color-text-primary-default)' }}
          >
            Your bag is empty
          </span>
          <span
            className="font-body text-center"
            style={{ fontSize: 14, lineHeight: '20px', color: 'var(--color-text-secondary-default)' }}
          >
            Add items from the menu to get started.
          </span>
          <Button variant="filled" onClick={() => navigate('/order/menu')}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
      <TopAppBar
        titleMode="title"
        title="Your Bag"
        titlePlacement="center"
        titleWeight="black"
        showBackButton
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Pickup / Location row */}
        {location && (
          <ListRow
            headline={`Pickup | ${fulfillmentLabel}`}
            supportText={getFormattedAddress(location)}
            leadingIcon="location-outline"
            metadata="Edit"
            metadataColor="var(--color-text-brand-secondary-default)"
            metadataWeight={700}
            onPress={() => navigate('/order/confirm-location')}
          />
        )}

        {/* Payment Method row */}
        <ListRow
          headline="Payment Method"
          supportText="Apple Pay"
          leadingIcon="credit-card"
          metadata="Edit"
          metadataColor="var(--color-text-brand-secondary-default)"
          metadataWeight={700}
        />

        {/* Pickup Time (carryout only) */}
        {isCarryout && (
          <>
            <ListRow
              headline="Pickup Time"
              supportText={selectedPickupTime ? `Today, ${selectedPickupTime}` : undefined}
              leadingIcon="clock"
              metadata={selectedPickupTime ? 'Edit' : undefined}
              metadataColor="var(--color-text-brand-secondary-default)"
              metadataWeight={700}
            />
            {!selectedPickupTime && (
              <div className="px-wds-16 pb-wds-8">
                <div className="flex gap-wds-8 flex-wrap pb-wds-8">
                  <Chip
                    type="select"
                    label="ASAP"
                    selected={selectedPickupTime === 'ASAP'}
                    onPress={() => setSelectedPickupTime('ASAP')}
                  />
                  {pickupTimes.map((time) => (
                    <Chip
                      key={time}
                      type="select"
                      label={time}
                      selected={selectedPickupTime === time}
                      onPress={() => setSelectedPickupTime(time)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-wds-4">
                  <span
                    aria-hidden="true"
                    className="inline-block"
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: 'var(--color-icon-validation-caution)',
                      maskImage: 'url(/icons/alert-outline.svg)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage: 'url(/icons/alert-outline.svg)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                    }}
                  />
                  <span
                    className="font-body"
                    style={{
                      fontSize: 12,
                      lineHeight: '16px',
                      color: 'var(--color-text-validation-caution)',
                    }}
                  >
                    Please choose a pickup time.
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bag items */}
        {bagState.items.map((item) => {
          const product = getProductById(item.menuItemId);
          const imageSrc = product ? getProductImagePath(product.image) : undefined;

          // Build combo sub-items if product is a combo
          const comboItems = product?.isCombo && (product as any).defaultComponents
            ? ((product as any).defaultComponents as Array<{ label: string; productRef: string | null }>).map((comp) => {
                const compProduct = comp.productRef ? getProductById(comp.productRef) : null;
                return {
                  name: comp.label,
                  imageSrc: compProduct ? getProductImagePath(compProduct.image) : undefined,
                };
              })
            : undefined;

          return (
            <BagItemCard
              key={item.id}
              name={item.name}
              price={`$${(item.price * item.quantity).toFixed(2)}`}
              imageSrc={imageSrc}
              quantity={item.quantity}
              onQuantityChange={(qty) =>
                bagDispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: qty })
              }
              onEdit={() => {/* TODO: navigate to SPP for editing */}}
              onRemove={() => bagDispatch({ type: 'REMOVE_ITEM', id: item.id })}
              comboItems={comboItems}
            />
          );
        })}

        {/* Complete your meal — cross-sell carousel */}
        <SectionHeader
          title="Complete your meal"
          ctaLabel="View All"
          onCtaPress={() => {/* TODO: bottom sheet with all items */}}
        />
        <div
          ref={carouselRef}
          className="flex gap-wds-12 overflow-x-auto px-wds-16 pb-wds-8"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          onScroll={handleCarouselScroll}
        >
          {crossSellItems.map((item, i) => (
            <div key={i} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <ActionCard
                title={item.title}
                subtitle={item.subtitle}
                imageSrc={item.imageSrc}
                imageSide="right"
                imageSize={112}
                ctaType="text"
                ctaLabel="Add to Bag"
                onCtaPress={() => {
                  bagDispatch({
                    type: 'ADD_ITEM',
                    item: {
                      id: `cross-sell-${Date.now()}-${i}`,
                      menuItemId: `cross-sell-${i}`,
                      name: item.title,
                      quantity: 1,
                      price: parseFloat(item.subtitle.replace(/[^0-9.]/g, '')) || 0,
                      customizations: { removed: [] },
                      comboSelections: null,
                    },
                  });
                }}
              />
            </div>
          ))}
        </div>

        {/* Carousel dot indicators */}
        <div className="flex justify-center gap-wds-4 pb-wds-16">
          {crossSellItems.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === carouselIndex
                  ? 'var(--color-bg-primary-inverse-default)'
                  : 'var(--color-bg-tertiary-default)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>

        {/* Disclaimer + Add More Items */}
        <div className="flex flex-col items-center px-wds-16" style={{ gap: 12, paddingBottom: 16 }}>
          <span
            className="font-body text-center"
            style={{
              fontSize: 12,
              lineHeight: '16px',
              color: 'var(--color-text-secondary-default)',
            }}
          >
            Orders cannot exceed $150
          </span>
          <Button
            variant="outline"
            onClick={() => navigate('/order/menu')}
          >
            Add More Items
          </Button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)', marginLeft: 16, marginRight: 16 }} />

        {/* Round Up & Donate */}
        <DonationSection
          isChecked={donationChecked}
          onChange={setDonationChecked}
        />

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)', marginLeft: 16, marginRight: 16 }} />

        {/* Order Summary */}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
          <OrderSummary lines={summaryLines} />
        </div>

        {/* Bottom spacer for Place Order button */}
        <div style={{ height: 80 }} />
      </div>

      {/* Place Order — sticky bottom */}
      <div
        className="px-wds-24 pb-wds-24 pt-wds-16"
        style={{
          backgroundColor: 'var(--color-bg-primary-default)',
          borderTop: '1px solid var(--color-border-tertiary-default)',
        }}
      >
        <Button
          variant="filled"
          fullWidth
          onClick={() => {/* TODO: navigate to checkout */}}
        >
          {`Place Order | $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
