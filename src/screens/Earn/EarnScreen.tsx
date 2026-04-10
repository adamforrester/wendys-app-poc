import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { useAuth } from '../../context/AuthContext';

/** Simple QR code placeholder SVG */
function QRCodePlaceholder() {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="white" rx="8" />
      {/* Position markers */}
      <rect x="8" y="8" width="30" height="30" stroke="#000" strokeWidth="3" fill="none" />
      <rect x="14" y="14" width="18" height="18" fill="#000" />
      <rect x="82" y="8" width="30" height="30" stroke="#000" strokeWidth="3" fill="none" />
      <rect x="88" y="14" width="18" height="18" fill="#000" />
      <rect x="8" y="82" width="30" height="30" stroke="#000" strokeWidth="3" fill="none" />
      <rect x="14" y="88" width="18" height="18" fill="#000" />
      {/* Data pattern */}
      {[44, 50, 56, 62, 68, 74].map(x =>
        [44, 50, 56, 62, 68, 74, 80, 86, 92, 98].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill={(x + y) % 12 < 7 ? '#000' : 'none'} />
        ))
      )}
      {[8, 14, 20, 26, 32].map(x =>
        [44, 50, 56, 62, 68, 74].map(y => (
          <rect key={`b${x}-${y}`} x={x} y={y} width="5" height="5" fill={(x * y) % 11 < 6 ? '#000' : 'none'} />
        ))
      )}
      {[44, 50, 56, 62, 68, 74].map(x =>
        [8, 14, 20, 26, 32].map(y => (
          <rect key={`c${x}-${y}`} x={x} y={y} width="5" height="5" fill={(x + y * 2) % 9 < 5 ? '#000' : 'none'} />
        ))
      )}
      {[82, 88, 94, 100].map(x =>
        [44, 50, 56, 62, 68, 74, 80, 86, 92, 98, 104].map(y => (
          <rect key={`d${x}-${y}`} x={x} y={y} width="5" height="5" fill={(x * 3 + y) % 10 < 5 ? '#000' : 'none'} />
        ))
      )}
    </svg>
  );
}

export function EarnScreen() {
  const { state: authState } = useAuth();
  const userName = authState.user?.name || 'Guest';

  return (
    <>
      <TopAppBar
        titleMode="title"
        title="Earn"
        titlePlacement="left"
      />

      {/* Scan Before You Pay */}
      <div className="text-center py-wds-16">
        <span className="font-display text-[18px] leading-[24px] font-[800]" style={{ color: 'var(--color-text-primary-default)' }}>
          Scan Before You Pay
        </span>
      </div>

      {/* Rewards Card */}
      <div className="px-wds-16 pb-wds-16">
        <div
          style={{
            backgroundColor: 'var(--color-bg-brand-primary-default)',
            borderRadius: 12,
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Left: Logo + Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <img
              src="/images/rewards-logo-white.svg"
              alt="Wendy's Rewards"
              style={{ height: 32, width: 'auto', alignSelf: 'flex-start' }}
            />
            <span
              className="font-display text-[20px] leading-[24px] font-bold"
              style={{ color: 'var(--color-text-onbrand-default)' }}
            >
              {userName}
            </span>
          </div>

          {/* Right: QR Code */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <QRCodePlaceholder />
            <span className="font-body text-[11px] leading-[16px]" style={{ color: 'var(--color-text-secondary-default)' }}>
              Tap to enlarge code
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-wds-24 pb-wds-16 text-center">
        <span className="font-body text-[14px] leading-[20px]" style={{ color: 'var(--color-text-secondary-default)' }}>
          All loyalty selections must be made before scanning occurs. After scanning, selections will be locked.
        </span>
      </div>

      {/* Gray section with action rows */}
      <div style={{ backgroundColor: 'var(--color-bg-secondary-default)', padding: '16px 0' }}>
        {/* Add Reward To My Card */}
        <div className="px-wds-16 pb-wds-12">
          <ListRow
            style="rounded"
            headline="Add Reward To My Card"
            leading="icon"
            leadingIcon="rewards-simple"
            trailing="icon"
            trailingIcon="add"
            showDivider={false}
          />
        </div>

        {/* Add Offer To My Card */}
        <div className="px-wds-16 pb-wds-16">
          <ListRow
            style="rounded"
            headline="Add Offer To My Card"
            leading="icon"
            leadingIcon="tag-outline"
            trailing="icon"
            trailingIcon="add"
            showDivider={false}
          />
        </div>

        {/* Claim Receipt Rewards */}
        <div className="text-center pb-wds-16">
          <button
            className="font-body text-[16px] leading-[24px] font-bold border-none bg-transparent underline"
            style={{ color: 'var(--color-text-brand-secondary-default)' }}
          >
            Claim Receipt Rewards
          </button>
        </div>

        {/* Divider */}
        <div className="px-wds-16">
          <div style={{ height: 1, backgroundColor: 'var(--color-border-tertiary-default)' }} />
        </div>

        {/* Need Help? */}
        <div className="text-center py-wds-16">
          <button
            className="flex items-center justify-center gap-wds-4 border-none bg-transparent mx-auto font-body text-[16px] leading-[24px] font-bold underline"
            style={{ color: 'var(--color-text-brand-secondary-default)' }}
          >
            Need Help?
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 20, height: 20,
                backgroundColor: 'var(--color-icon-brand-secondary-default)',
                maskImage: 'url(/icons/caret-right.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                WebkitMaskImage: 'url(/icons/caret-right.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
              }}
            />
          </button>
        </div>
      </div>

    </>
  );
}
