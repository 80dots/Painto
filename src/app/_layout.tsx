import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationThemes } from '@/constants/theme';
import { DatabaseProvider } from '@/db/provider';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { scheme, colors } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationThemes[scheme]}>
          <DatabaseProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.foreground,
                headerTitleStyle: { color: colors.foreground },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="paint/[id]" options={{ title: '도료' }} />
              <Stack.Screen name="paint/scan" options={{ title: '바코드 스캔' }} />
              <Stack.Screen name="supplies" options={{ title: '모델링 용품' }} />
              <Stack.Screen name="masking" options={{ title: '마스킹 테이프' }} />
              <Stack.Screen name="projects" options={{ title: '프라모델' }} />
              <Stack.Screen name="supply/[id]" options={{ title: '용품' }} />
              <Stack.Screen name="project/[id]" options={{ title: '프라모델' }} />
              <Stack.Screen name="shopping" options={{ title: '구매 목록' }} />
            </Stack>
          </DatabaseProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
