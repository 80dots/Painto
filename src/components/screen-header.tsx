import { type ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/** 탭 화면 상단의 제목 줄 */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 px-4 pb-3 pt-2">
      <View className="flex-1">
        <Text variant="title">{title}</Text>
        {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
