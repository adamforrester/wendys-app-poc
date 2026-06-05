/**
 * Delivery landing screen — `/order/delivery`.
 *
 * Static page reached when the user toggles "Delivery" in the Order root
 * top bar. Mirrors the Pickup/Delivery toggle so the user can switch back.
 *
 * Per the Figma source frame
 * (https://www.figma.com/design/Itu1j5keGK2efB2IbD3dje/COR-Tickets?node-id=1690-16963):
 * red top bar with "Order" title + Pickup/Delivery toggle, hero meal-deals
 * image, "It's a good day for delivery" headline, primary CTA, secondary
 * link, "Powered by DoorDash" + delivery legalese.
 *
 * The "Get started" / "Delivery FAQs" buttons are intentionally inert —
 * delivery flow is not built. Tapping does nothing for now.
 */

import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Button } from '../../components/Button/Button';

export function DeliveryScreen() {
  const navigate = useNavigate();

  const handleFulfillmentChange = (next: string) => {
    if (next === 'pickup') navigate('/order');
    // 'delivery' is the current screen — no-op
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary-default)',
      }}
    >
      <TopAppBar
        titleMode="title"
        title="Order"
        titlePlacement="left"
        trailingContent={
          <SegmentedControl
            segments={[
              { id: 'pickup', label: 'Pickup' },
              { id: 'delivery', label: 'Delivery' },
            ]}
            activeSegment="delivery"
            onSegmentChange={handleFulfillmentChange}
            density="sm"
            colorScheme="onBrand"
          />
        }
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          overflowY: 'auto',
        }}
      >
        {/* Hero image — Wendy's meal deals composition */}
        <img
          src="/images/delivery/meal-deals.png"
          alt="A Wendy's meal — sandwich, fries, nuggets, and a drink"
          style={{
            width: 290,
            height: 223,
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />

        {/* Headline — TitleL/Black per Figma */}
        <div
          className="font-display"
          style={{
            color: 'var(--color-text-primary-default)',
            fontWeight: 800,
            fontSize: 23,
            lineHeight: '32px',
            textAlign: 'center',
            padding: '24px 16px',
            width: '100%',
          }}
        >
          It’s a good day for delivery
        </div>

        {/* Button stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Button
            variant="filled"
            colorScheme="secondary"
            size="large"
            onClick={() => {
              // Delivery flow is not built — intentionally inert.
            }}
          >
            Get started
          </Button>
          <Button
            variant="text"
            colorScheme="secondary"
            size="small"
            noPadding
            onClick={() => {
              // FAQ link not built — intentionally inert.
            }}
          >
            Delivery FAQs
          </Button>
        </div>

        {/* Powered by DoorDash + legalese */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            paddingTop: 32,
            paddingBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="font-body"
              style={{
                color: 'var(--color-text-secondary-default)',
                fontSize: 12,
                fontWeight: 900,
                lineHeight: '16px',
              }}
            >
              POWERED BY
            </span>
            <img
              src="/images/delivery/doordash.png"
              alt="DoorDash"
              style={{ height: 10, width: 89 }}
            />
          </div>
          <p
            className="font-body"
            style={{
              color: 'var(--color-text-secondary-default)',
              fontSize: 11,
              lineHeight: '16px',
              textAlign: 'center',
              width: 307,
              margin: 0,
            }}
          >
            Menu limited. Menu pricing for delivery may be higher than posted in stores or as marked. Additional fees may apply. Delivery orders are not eligible for Wendy’s Rewards benefits at this time. Check our Delivery FAQs for additional help.
          </p>
        </div>
      </div>
    </div>
  );
}
