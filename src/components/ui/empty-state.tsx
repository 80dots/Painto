import { type ComponentType } from 'react';
import { View } from 'react-native';

import { type IconProps } from '@/components/icons/paint-bottle';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export type EmptyStateProps = {
  icon?: ComponentType<IconProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center justify-center gap-3 px-8 py-16">
      {Icon ? (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon size={26} color={colors.mutedForeground} />
        </View>
      ) : null}
      <Text variant="subtitle" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="muted" className="text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onPress={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
