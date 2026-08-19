import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { BagProvider } from './context/BagContext';
import { DaypartProvider } from './context/DaypartContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import { StatusBarModeProvider } from './context/StatusBarModeContext';
import { DeviceFrame } from './components/DeviceFrame/DeviceFrame';
import { AppShell } from './components/AppShell/AppShell';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { HomeScreen } from './screens/Home/HomeScreen';
import { OffersScreen } from './screens/Offers/OffersScreen';
import { OrderScreen } from './screens/Order/OrderScreen';
import { DeliveryScreen } from './screens/Order/DeliveryScreen';
import { EarnScreen } from './screens/Earn/EarnScreen';
import { AccountScreen } from './screens/Account/AccountScreen';
import { DevToolsScreen } from './screens/Account/DevToolsScreen';
import { MenuCategoryScreen } from './screens/Order/MenuCategoryScreen';
import { MenuProductListScreen } from './screens/Order/MenuProductListScreen';
import { SingleProductScreen } from './screens/Order/SingleProductScreen';
import { LocationConfirmationScreen } from './screens/Order/LocationConfirmationScreen';
import { BagScreen } from './screens/Order/BagScreen';
import splashLottie from './animations/lottie/splash.json';
import { useFeatureFlags } from './context/FeatureFlagsContext';
import { resolveRetro } from './config/featureFlags';
import { VoiceOrderingScreen } from './features/voice-ordering/VoiceOrderingScreen';

/**
 * Picks the splash variant from the resolved flag. Split out of `App`
 * because `App` renders the FeatureFlagsProvider itself and so can't call
 * useFeatureFlags in its own body.
 *
 * SplashScreen already handles all three formats, so the retro GIF and MP4
 * need no conversion — just the right animationType and src.
 */
function AppSplash({ onComplete }: { onComplete: () => void }) {
  const { flags } = useFeatureFlags();
  const { splash } = resolveRetro(flags);

  if (splash === 'retro-yellow') {
    return (
      <SplashScreen
        animationType="image"
        animationSrc="/animations/retro-yellow.gif"
        onComplete={onComplete}
      />
    );
  }

  if (splash === 'retro-newsprint') {
    return (
      <SplashScreen
        animationType="video"
        animationSrc="/animations/retro-newsprint.mp4"
        onComplete={onComplete}
      />
    );
  }

  return <SplashScreen lottieData={splashLottie} onComplete={onComplete} />;
}

export default function App() {
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <FeatureFlagsProvider>
      <AuthProvider>
        <LocationProvider>
          <BagProvider>
            <DaypartProvider>
              <BrowserRouter>
                <StatusBarModeProvider>
                <DeviceFrame>
                  {!splashComplete && (
                    <AppSplash onComplete={() => setSplashComplete(true)} />
                  )}
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<HomeScreen />} />
                      <Route path="/offers" element={<OffersScreen />} />
                      <Route path="/order" element={<OrderScreen />} />
                      <Route path="/order/delivery" element={<DeliveryScreen />} />
                      <Route path="/order/menu" element={<MenuCategoryScreen />} />
                      <Route path="/order/menu/:slug" element={<MenuProductListScreen />} />
                      <Route path="/earn" element={<EarnScreen />} />
                      <Route path="/account" element={<AccountScreen />} />
                      <Route path="/account/dev-tools" element={<DevToolsScreen />} />
                    </Route>
                    {/* SPP — full screen, no tab bar */}
                    <Route path="/order/menu/:slug/:productId" element={<SingleProductScreen />} />
                    {/* Location confirmation — shown once before bag */}
                    <Route path="/order/confirm-location" element={<LocationConfirmationScreen />} />
                    {/* Bag screen */}
                    <Route path="/order/bag" element={<BagScreen />} />
                    {/* Voice ordering — full screen, no tab bar */}
                    <Route path="/voice" element={<VoiceOrderingScreen />} />
                  </Routes>
                </DeviceFrame>
                </StatusBarModeProvider>
              </BrowserRouter>
            </DaypartProvider>
          </BagProvider>
        </LocationProvider>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
}
