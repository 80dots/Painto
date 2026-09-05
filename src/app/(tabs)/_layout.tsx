import { Tabs } from 'expo-router/js-tabs';
import { Home, Settings } from 'lucide-react-native';

import { PaintBottle } from '@/components/icons/paint-bottle';

import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="paints"
        options={{
          title: t('tabs.paints'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <PaintBottle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
