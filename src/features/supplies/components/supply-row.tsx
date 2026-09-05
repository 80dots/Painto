import { Minus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { Supply } from '@/db/schema';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { formatQuantity } from '@/lib/utils';

export type SupplyRowProps = {
  item: Supply;
  onPress: () => void;
  onAdjust: (delta: number) => void;
};

export function SupplyRow({ item, onPress, onAdjust }: SupplyRowProps) {
  const { colors } = useTheme();
  const t = useT();
  const isOut = item.quantity <= 0;
  const isLow = !isOut && item.quantity <= item.minQuantity;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
    >
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {item.name}
          {item.spec ? <Text variant="muted">{` ${item.spec}`}</Text> : null}
        </Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          {item.brand ? <Text variant="small">{item.brand}</Text> : null}
          <Badge label={t(`supplyCategory.${item.category}`)} />
          {isOut ? <Badge label={t('common.outOfStock')} variant="destructive" /> : null}
          {isLow ? <Badge label={t('common.lowStock')} variant="warning" /> : null}
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => onAdjust(-1)}
          hitSlop={6}
          accessibilityLabel={t('a11y.decreaseStock')}
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Minus size={14} color={colors.foreground} />
        </Pressable>
        <View className="min-w-12 items-center">
          <Text className="text-base font-semibold text-foreground">
            {formatQuantity(item.quantity)}
          </Text>
          <Text variant="small">{item.unit}</Text>
        </View>
        <Pressable
          onPress={() => onAdjust(1)}
          hitSlop={6}
          accessibilityLabel={t('a11y.increaseStock')}
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Plus size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </Pressable>
  );
}
