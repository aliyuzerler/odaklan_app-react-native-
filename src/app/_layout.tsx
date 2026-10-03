import '../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { AppSync } from '@/components/app-sync';
import { initNotifications } from '@/lib/notifications';
import { initAds } from '@/lib/ads';
import { initRemoteConfig } from '@/lib/remoteConfig';
import { logAppOpen } from '@/lib/analytics';
import { useSettings } from '@/store/settings';
import { useGoals } from '@/store/goals';
import { useStreak } from '@/store/streak';
import { useBadges } from '@/store/badges';

void SplashScreen.preventAutoHideAsync();

const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#10B981',
    background: '#09090B',
    card: '#0F0F12',
    text: '#FAFAFA',
    border: '#1F1F23',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterExtraBold: Inter_800ExtraBold,
  });
  const onboardingDone = useSettings((s) => s.onboardingDone);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void (async () => {
      useGoals.getState().syncToday();
      useStreak.getState().sync();
      useBadges.getState().evaluate();
      await initNotifications();
      initAds();
      void initRemoteConfig();
      logAppOpen();
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1 bg-background">
      <ThemeProvider value={darkNavigationTheme}>
        <StatusBar style="light" />
        <AppSync />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090B' } }}
          initialRouteName={onboardingDone ? '(tabs)' : 'onboarding'}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* Dialog/Dropdown gibi portal içeriği buraya yansıtılır — Stack'in üstünde */}
        <View className="absolute inset-0 z-50" pointerEvents="box-none">
          <PortalHost />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
