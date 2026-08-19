import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';
import { useFeatureFlags } from '../../context/FeatureFlagsContext';
import { resolveRetro } from '../../config/featureFlags';

export function AccountScreen() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { getUser, getRewardsPoints } = useUserData();
  const { flags } = useFeatureFlags();
  // The hero has no flag of its own — it follows the retroBranding master.
  const retroHero = resolveRetro(flags).accountHero === 'retro';

  const user = getUser();
  const points = getRewardsPoints();
  const firstName = authState.isAuthenticated && user ? user.firstName : 'Guest';

  const menuRows = [
    { headline: 'Mobile Pay', onPress: () => {} },
    { headline: 'Favorites', onPress: () => {} },
    { headline: 'History', onPress: () => {} },
    { headline: 'Settings', onPress: () => {} },
    { headline: 'Privacy', onPress: () => {} },
    { headline: 'Contact Us', onPress: () => {} },
    { headline: 'Developer Tools', onPress: () => navigate('/account/dev-tools') },
  ];

  return (
    <>
      <TopAppBar
        titleMode="title"
        title="Account"
        titlePlacement="left"
        titleWeight="black"
        showPoints
        points={points}
      />

      {/* Hero section — red with the current cameo, or retro yellow with the
          retro cameo. Retro geometry is Figma 27:29849 exactly: 390x218,
          padding 0/16/16/16, gap 16, cameo at its native 137x154 flush to
          the app bar. 154 + 16 + 32 + 16 = 218. */}
      <div
        style={{
          backgroundColor: retroHero
            ? 'var(--color-bg-brand-retro-default)'
            : 'var(--color-bg-brand-primary-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: retroHero ? '0 16px 16px' : '24px 16px 32px',
          gap: retroHero ? 16 : 0,
        }}
      >
        <img
          src={retroHero ? '/images/retro-cameo.svg' : '/images/cameo-fullColor-withTrademark.svg'}
          alt="Wendy's"
          style={retroHero ? { width: 137, height: 154 } : { width: 131, height: 131 }}
        />
        <h2
          className="font-display text-[23px] leading-[32px] font-black"
          style={{
            color: retroHero
              ? 'var(--color-text-primary-default)'
              : 'var(--color-text-onbrand-default)',
            margin: 0,
            // Classic spaces the greeting with a margin; retro uses the flex
            // gap above, so the margin must be zero to avoid stacking both.
            marginBlockStart: retroHero ? 0 : 12,
          }}
        >
          Hey, {firstName}!
        </h2>
      </div>

      {/* Menu list rows */}
      <div>
        {menuRows.map((row, i) => (
          <ListRow
            key={row.headline}
            headline={row.headline}
            trailing="icon"
            showDivider={i < menuRows.length - 1}
            onPress={row.onPress}
          />
        ))}
      </div>
    </>
  );
}
