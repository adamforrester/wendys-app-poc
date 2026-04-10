import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/TopAppBar/TopAppBar';
import { ListRow } from '../../components/ListRow/ListRow';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';

export function AccountScreen() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { getUser, getRewardsPoints } = useUserData();

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

      {/* Hero section with red background and cameo logo */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-brand-primary-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 16px 32px',
        }}
      >
        <img
          src="/images/cameo-fullColor-withTrademark.svg"
          alt="Wendy's"
          style={{ width: 131, height: 131 }}
        />
        <h2
          className="font-display text-[23px] leading-[32px] font-black"
          style={{ color: 'var(--color-text-onbrand-default)', marginTop: 12, margin: 0, marginBlockStart: 12 }}
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
