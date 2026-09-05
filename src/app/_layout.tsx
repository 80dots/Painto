import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationTheme } from '@/constants/theme';
import { DatabaseProvider } from '@/db/provider';
import { AppSettingsProvider, useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <AppSettingsProvider>
            <ThemedStack />
          </AppSettingsProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const { colors, palette } = useTheme();
  const t = useT();

  return (
    <ThemeProvider value={navigationTheme(palette)}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { color: colors.foreground },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="paint/[id]" options={{ title: t('nav.paint') }} />
        <Stack.Screen name="paint/scan" options={{ title: t('nav.paintScan') }} />
        <Stack.Screen name="supplies" options={{ title: t('nav.supplies') }} />
        <Stack.Screen name="masking" options={{ title: t('nav.masking') }} />
        <Stack.Screen name="projects" options={{ title: t('nav.projects') }} />
        <Stack.Screen name="supply/[id]" options={{ title: t('nav.supply') }} />
        <Stack.Screen name="project/[id]" options={{ title: t('nav.project') }} />
        <Stack.Screen name="shopping" options={{ title: t('nav.shopping') }} />
      </Stack>
      <StatusBar style={palette.isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
