import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { BagProvider } from './context/BagContext';
import { DaypartProvider } from './context/DaypartContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import { DeviceFrame } from './components/DeviceFrame/DeviceFrame';
import { AppShell } from './components/AppShell/AppShell';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { HomeScreen } from './screens/Home/HomeScreen';
import { OffersScreen } from './screens/Offers/OffersScreen';
import { OrderScreen } from './screens/Order/OrderScreen';
import { EarnScreen } from './screens/Earn/EarnScreen';
import { AccountScreen } from './screens/Account/AccountScreen';
import { DevToolsScreen } from './screens/Account/DevToolsScreen';
import { MenuCategoryScreen } from './screens/Order/MenuCategoryScreen';
import { MenuProductListScreen } from './screens/Order/MenuProductListScreen';
import { SingleProductScreen } from './screens/Order/SingleProductScreen';
import splashAnimation from './animations/lottie/splash.json';

export default function App() {
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <FeatureFlagsProvider>
      <AuthProvider>
        <LocationProvider>
          <BagProvider>
            <DaypartProvider>
              <BrowserRouter>
                <DeviceFrame>
                  {!splashComplete && (
                    <SplashScreen
                      lottieData={splashAnimation}
                      onComplete={() => setSplashComplete(true)}
                    />
                  )}
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<HomeScreen />} />
                      <Route path="/offers" element={<OffersScreen />} />
                      <Route path="/order" element={<OrderScreen />} />
                      <Route path="/order/menu" element={<MenuCategoryScreen />} />
                      <Route path="/order/menu/:slug" element={<MenuProductListScreen />} />
                      <Route path="/earn" element={<EarnScreen />} />
                      <Route path="/account" element={<AccountScreen />} />
                      <Route path="/account/dev-tools" element={<DevToolsScreen />} />
                    </Route>
                    {/* SPP — full screen, no tab bar */}
                    <Route path="/order/menu/:slug/:productId" element={<SingleProductScreen />} />
                  </Routes>
                </DeviceFrame>
              </BrowserRouter>
            </DaypartProvider>
          </BagProvider>
        </LocationProvider>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
}
