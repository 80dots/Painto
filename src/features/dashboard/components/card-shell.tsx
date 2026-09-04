import { useRouter } from 'expo-router';
import { ArrowDown, ArrowUp, ChevronRight, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { type DashboardCardDefinition } from '@/features/dashboard/registry';
import { useTheme } from '@/hooks/use-theme';

export type CardShellProps = {
  definition: DashboardCardDefinition;
  editing: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

/** 모든 대시보드 카드의 공통 껍데기 — 제목 줄과 편집 컨트롤을 담당한다. */
export function CardShell({
  definition,
  editing,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CardShellProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { icon: Icon, href, Content } = definition;

  const openHref = () => {
    if (href) router.push(href);
  };

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <Icon size={18} color={colors.primary} />

        {editing || !href ? (
          <Text variant="subtitle" className="flex-1">
            {definition.title}
          </Text>
        ) : (
          <Pressable onPress={openHref} className="flex-1 flex-row items-center gap-1">
            <Text variant="subtitle">{definition.title}</Text>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </Pressable>
        )}

        {editing ? (
          <View className="flex-row items-center gap-1">
            <IconButton
              label="위로 이동"
              disabled={!canMoveUp}
              onPress={onMoveUp}
              icon={<ArrowUp size={16} color={colors.foreground} />}
            />
            <IconButton
              label="아래로 이동"
              disabled={!canMoveDown}
              onPress={onMoveDown}
              icon={<ArrowDown size={16} color={colors.foreground} />}
            />
            <IconButton
              label="카드 삭제"
              onPress={onRemove}
              icon={<X size={16} color={colors.destructive} />}
            />
          </View>
        ) : null}
      </View>

      <Content />
    </Card>
  );
}

function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      className={`h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {icon}
    </Pressable>
  );
}
