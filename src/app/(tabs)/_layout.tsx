import { Tabs } from 'expo-router/js-tabs';
import { Home, Settings } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { PaintBottle } from '@/components/icons/paint-bottle';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/utils';

/** 리플이 아이콘 주변에만 작게 퍼지도록 하는 반지름 (dp) */
const RIPPLE_RADIUS = 22;

export default function TabsLayout() {
  const { colors } = useTheme();
  const t = useT();

  const ripple = {
    color: withAlpha(colors.primary, 0.1),
    radius: RIPPLE_RADIUS,
    borderless: true,
  };

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
        // 기본 버튼은 탭 칸 전체를 덮는 큰 리플을 그린다.
        // 레이아웃·접근성 속성은 그대로 넘기고 리플만 작고 연하게 바꾼다.
        // style 은 반드시 받은 배열 그대로 넘긴다 — 함수형으로 감싸면
        // NativeWind 를 거치며 기본 정렬(alignItems: center)이 사라져 아이콘이 왼쪽으로 쏠린다.
        tabBarButton: ({ href, hoverEffect, pressColor, pressOpacity, style, ...rest }) => (
          <Pressable {...(rest as PressableProps)} style={style} android_ripple={ripple} />
        ),
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
