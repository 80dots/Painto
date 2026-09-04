import { type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

export type ScreenProps = {
  children: ReactNode;
  /** 안전영역을 적용할 방향. 탭 화면은 상단만, 스택 화면은 헤더가 처리하므로 생략 */
  edges?: readonly Edge[];
  className?: string;
};

/** 모든 화면의 바깥 컨테이너 — 배경색과 안전영역을 한곳에서 관리한다. */
export function Screen({ children, edges = ['top'], className }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <View className={cn('flex-1', className)}>{children}</View>
    </SafeAreaView>
  );
}
