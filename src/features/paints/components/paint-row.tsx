import { Minus, Plus, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import type { PaintListItem } from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { PAINT_FINISH_LABELS, PAINT_TYPE_LABELS } from '@/lib/labels';
import { formatQuantity } from '@/lib/utils';

export type PaintRowProps = {
  item: PaintListItem;
  onPress: () => void;
  onAdjust: (delta: number) => void;
};

export function PaintRow({ item, onPress, onAdjust }: PaintRowProps) {
  const { colors } = useTheme();
  const isOut = item.quantity <= 0;
  const isLow = !isOut && item.quantity <= item.minQuantity;

  const brandLabel = [item.brandName, item.brandLine].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
    >
      <ColorSwatch color={item.colorHex} fallbackText={item.code} />

      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
            {item.code ? `${item.code} ` : ''}
            {item.name}
          </Text>
          {item.isFavorite ? <Star size={14} color={colors.warning} fill={colors.warning} /> : null}
        </View>

        <View className="flex-row flex-wrap items-center gap-1.5">
          {brandLabel ? <Text variant="small">{brandLabel}</Text> : null}
          <Badge label={PAINT_TYPE_LABELS[item.type]} />
          {item.finish !== 'none' ? <Badge label={PAINT_FINISH_LABELS[item.finish]} /> : null}
          {isOut ? <Badge label="품절" variant="destructive" /> : null}
          {isLow ? <Badge label="부족" variant="warning" /> : null}
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => onAdjust(-1)}
          hitSlop={6}
          accessibilityLabel="재고 1 줄이기"
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Minus size={14} color={colors.foreground} />
        </Pressable>
        <View className="min-w-10 items-center">
          <Text className="text-base font-semibold text-foreground">
            {formatQuantity(item.quantity)}
          </Text>
          {item.quantity > 0 && item.remainingPct < 100 ? (
            <Text variant="small">{item.remainingPct}%</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => onAdjust(1)}
          hitSlop={6}
          accessibilityLabel="재고 1 늘리기"
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Plus size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </Pressable>
  );
}
