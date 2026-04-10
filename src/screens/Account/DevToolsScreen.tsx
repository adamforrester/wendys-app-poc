import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { useAuth } from '../../context/AuthContext';
import { useDaypart, type Daypart } from '../../context/DaypartContext';
import { useLocation as useLocationCtx, type FulfillmentMethod, type LocationPermission } from '../../context/LocationContext';
import { useBag } from '../../context/BagContext';
import { useLocationData } from '../../hooks/useLocationData';
import { flagMeta, defaultFeatureFlags, type FeatureFlags } from '../../config/featureFlags';
import userData from '../../data/user.json';

const defaultUser = userData.authenticatedUser;

/* ── Reusable styled primitives ── */

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border-tertiary-default)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full border-none bg-transparent"
        style={{ padding: '16px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary-default)', textAlign: 'left' }}
      >
        {title}
        <span
          className="inline-block"
          style={{
            width: 16, height: 16,
            backgroundColor: 'var(--color-icon-secondary-default)',
            maskImage: `url(/icons/caret-${open ? 'up' : 'down'}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            WebkitMaskImage: `url(/icons/caret-${open ? 'up' : 'down'}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
          }}
        />
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

function ControlRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 0', gap: 12, borderBottom: '1px solid var(--color-border-tertiary-default)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-body text-[14px] leading-[20px] font-bold" style={{ color: 'var(--color-text-primary-default)' }}>{label}</div>
        {description && (
          <div className="font-body text-[12px] leading-[16px]" style={{ color: 'var(--color-text-secondary-default)' }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-body text-[13px]"
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid var(--color-border-secondary-default)',
        backgroundColor: 'var(--color-bg-primary-default)',
        color: 'var(--color-text-primary-default)',
        minWidth: 130,
        appearance: 'auto' as const,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative border-none p-0"
      style={{
        width: 48, height: 28, borderRadius: 14,
        backgroundColor: checked ? 'var(--color-bg-brand-secondary-default)' : 'var(--color-bg-disabled-default)',
        transition: 'background-color 0.2s',
      }}
      role="switch"
      aria-checked={checked}
    >
      <div style={{
        width: 22, height: 22,
        borderRadius: 11,
        backgroundColor: 'white',
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function ActionButton({ label, variant = 'default', onClick }: { label: string; variant?: 'default' | 'danger'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-body text-[14px] font-bold border-none"
      style={{
        padding: '10px 16px',
        borderRadius: 8,
        backgroundColor: variant === 'danger' ? 'var(--color-bg-validation-critical)' : 'var(--color-bg-secondary-default)',
        color: variant === 'danger' ? 'white' : 'var(--color-text-primary-default)',
        width: '100%',
        textAlign: 'center',
      }}
    >
      {label}
    </button>
  );
}

/* ── Screen ── */

export function DevToolsScreen() {
  const navigate = useNavigate();
  const { flags, dispatch: flagsDispatch } = useFeatureFlags();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { state: daypartState, dispatch: daypartDispatch } = useDaypart();
  const { state: locationState, dispatch: locationDispatch } = useLocationCtx();
  const { state: bagState, dispatch: bagDispatch } = useBag();
  const { getAllLocations } = useLocationData();
  const locations = getAllLocations();

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleFlagChange = (key: keyof FeatureFlags, value: string) => {
    flagsDispatch({ type: 'SET_FLAG', key, value: value as FeatureFlags[keyof FeatureFlags] });
  };

  const handleResetFlags = () => {
    flagsDispatch({ type: 'RESET' });
  };

  const handleAuthToggle = (isAuth: boolean) => {
    if (isAuth) {
      authDispatch({
        type: 'LOGIN',
        user: {
          name: `${defaultUser.firstName} ${defaultUser.lastName}`,
          email: defaultUser.email,
          rewardsPoints: defaultUser.rewardsProfile.points,
          rewardsTier: defaultUser.rewardsProfile.tier,
          favoriteLocationId: defaultUser.favoriteLocation,
        },
      });
    } else {
      authDispatch({ type: 'LOGOUT' });
    }
  };

  const handleResetAll = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    flagsDispatch({ type: 'RESET' });
    bagDispatch({ type: 'CLEAR_BAG' });
    locationDispatch({ type: 'CLEAR_LOCATION' });
    daypartDispatch({ type: 'SET_DAYPART', daypart: 'lunch' });
    handleAuthToggle(true);
    setResetConfirm(false);
  };

  const flagKeys = Object.keys(flagMeta) as (keyof FeatureFlags)[];

  return (
    <>
      <TopAppBar
        titleMode="title"
        title="Developer Tools"
        titlePlacement="center"
        titleWeight="semibold"
        showBackButton
        onBack={() => navigate('/account')}
      />

      <div style={{ backgroundColor: 'var(--color-bg-primary-default)' }}>
        {/* Feature Flags */}
        <Section title="Feature Flags">
          {flagKeys.map((key) => {
            const meta = flagMeta[key];
            const currentValue = flags[key];
            const isDefault = currentValue === defaultFeatureFlags[key];

            return (
              <ControlRow key={key} label={meta.label} description={meta.description}>
                <div className="flex items-center gap-wds-8">
                  {!isDefault && (
                    <span
                      className="font-body text-[11px] font-bold"
                      style={{ color: 'var(--color-text-brand-secondary-default)', letterSpacing: '0.5px' }}
                    >
                      MODIFIED
                    </span>
                  )}
                  {meta.options.length === 2 && meta.options.some(o => o.value === 'off') ? (
                    <ToggleSwitch
                      checked={currentValue !== 'off'}
                      onChange={(on) => handleFlagChange(key, on ? meta.options.find(o => o.value !== 'off')!.value : 'off')}
                    />
                  ) : (
                    <Select
                      value={currentValue}
                      options={meta.options}
                      onChange={(v) => handleFlagChange(key, v)}
                    />
                  )}
                </div>
              </ControlRow>
            );
          })}
          <div style={{ paddingTop: 12 }}>
            <ActionButton label="Reset All Flags to Defaults" onClick={handleResetFlags} />
          </div>
        </Section>

        {/* State Controls */}
        <Section title="State Controls">
          <ControlRow label="Authenticated" description="Toggle between auth and guest states">
            <ToggleSwitch checked={authState.isAuthenticated} onChange={handleAuthToggle} />
          </ControlRow>

          <ControlRow label="Daypart" description="Controls visible menu categories and promotions">
            <Select
              value={daypartState.daypart}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'late-night', label: 'Late Night' },
              ]}
              onChange={(v) => daypartDispatch({ type: 'SET_DAYPART', daypart: v as Daypart })}
            />
          </ControlRow>

          <ControlRow label="Location Permission" description="Simulates GPS permission states">
            <Select
              value={locationState.locationPermission}
              options={[
                { value: 'granted', label: 'Granted' },
                { value: 'denied', label: 'Denied' },
                { value: 'prompt', label: 'Prompt' },
              ]}
              onChange={(v) => locationDispatch({ type: 'SET_PERMISSION', permission: v as LocationPermission })}
            />
          </ControlRow>

          <ControlRow label="Selected Location" description={locationState.selectedLocation?.name || 'None selected'}>
            <Select
              value={locationState.selectedLocation?.id || ''}
              options={[
                { value: '', label: 'None' },
                ...locations.map(l => ({ value: l.id, label: l.name })),
              ]}
              onChange={(v) => {
                if (!v) {
                  locationDispatch({ type: 'CLEAR_LOCATION' });
                } else {
                  const loc = locations.find(l => l.id === v);
                  if (loc) locationDispatch({ type: 'SET_LOCATION', location: loc as any });
                }
              }}
            />
          </ControlRow>

          <ControlRow label="Fulfillment Method" description="Current fulfillment method override">
            <Select
              value={locationState.fulfillmentMethod || ''}
              options={[
                { value: '', label: 'None' },
                { value: 'drive-thru', label: 'Drive-Thru' },
                { value: 'carry-out', label: 'Carry-Out' },
                { value: 'curbside', label: 'Curbside' },
              ]}
              onChange={(v) => {
                if (v) locationDispatch({ type: 'SET_FULFILLMENT', method: v as FulfillmentMethod });
              }}
            />
          </ControlRow>

          <ControlRow label="Bag Items" description={`${bagState.items.length} item(s) in bag`}>
            <ActionButton
              label="Clear Bag"
              onClick={() => bagDispatch({ type: 'CLEAR_BAG' })}
            />
          </ControlRow>
        </Section>

        {/* Session Actions */}
        <Section title="Session Actions" defaultOpen={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ActionButton
              label={resetConfirm ? 'Tap again to confirm reset' : 'Reset All State'}
              variant={resetConfirm ? 'danger' : 'default'}
              onClick={handleResetAll}
            />
            {resetConfirm && (
              <ActionButton label="Cancel" onClick={() => setResetConfirm(false)} />
            )}
          </div>
        </Section>

        {/* Current State Debug */}
        <Section title="Current State" defaultOpen={false}>
          <pre
            className="font-body text-[11px] leading-[16px]"
            style={{
              backgroundColor: 'var(--color-bg-secondary-default)',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              maxHeight: 300,
              color: 'var(--color-text-primary-default)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify({
              featureFlags: flags,
              auth: { isAuthenticated: authState.isAuthenticated, userName: authState.user?.name },
              daypart: daypartState.daypart,
              location: {
                selected: locationState.selectedLocation?.name || null,
                fulfillment: locationState.fulfillmentMethod,
                permission: locationState.locationPermission,
              },
              bag: { itemCount: bagState.items.length, promoCode: bagState.promoCode },
            }, null, 2)}
          </pre>
        </Section>
      </div>
    </>
  );
}
