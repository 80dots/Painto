import { ChevronRight, Maximize2, Minimize2, X } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { DashboardCardSize } from '@/db/schema';
import { type DashboardCardDefinition } from '@/features/dashboard/registry';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';

export type CardShellProps = {
  definition: DashboardCardDefinition;
  size: DashboardCardSize;
  editing: boolean;
  /** 제목을 눌렀을 때 (카드에 연결된 화면으로 이동) */
  onOpen?: () => void;
  onToggleSize: () => void;
  onRemove: () => void;
};

/** 모든 대시보드 카드의 공통 껍데기 — 제목 줄과 편집 컨트롤을 담당한다. */
export function CardShell({
  definition,
  size,
  editing,
  onOpen,
  onToggleSize,
  onRemove,
}: CardShellProps) {
  const { colors } = useTheme();
  const t = useT();
  const { icon: Icon, Content } = definition;
  const title = t(definition.titleKey);

  const isSmall = size === 'small';

  return (
    // 한 줄에 나란히 선 카드끼리 아래를 맞추기 위해 남는 높이를 채운다
    <Card className="grow gap-3">
      <View className="flex-row items-center gap-2">
        <Icon size={isSmall ? 16 : 18} color={colors.primary} />

        {editing || !onOpen ? (
          <Text variant={isSmall ? 'label' : 'subtitle'} className="flex-1" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Pressable onPress={onOpen} className="flex-1 flex-row items-center gap-1">
            <Text variant={isSmall ? 'label' : 'subtitle'} numberOfLines={1}>
              {title}
            </Text>
            <ChevronRight size={14} color={colors.mutedForeground} />
          </Pressable>
        )}

        {editing ? (
          <View className="flex-row items-center gap-1">
            <IconButton
              label={isSmall ? t('dashboard.sizeLarger') : t('dashboard.sizeSmaller')}
              onPress={onToggleSize}
              icon={
                isSmall ? (
                  <Maximize2 size={14} color={colors.foreground} />
                ) : (
                  <Minimize2 size={14} color={colors.foreground} />
                )
              }
            />
            <IconButton
              label={t('dashboard.removeCard')}
              onPress={onRemove}
              icon={<X size={14} color={colors.destructive} />}
            />
          </View>
        ) : null}
      </View>

      <Content size={size} />
    </Card>
  );
}

function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={4}
      className="h-7 w-7 items-center justify-center rounded-md border border-border active:bg-muted"
    >
      {icon}
    </Pressable>
  );
}
