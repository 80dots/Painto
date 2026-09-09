import { Minus, Plus, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import type { PaintListItem } from '@/features/paints/queries';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn, formatQuantity } from '@/lib/utils';

export type PaintRowProps = {
  item: PaintListItem;
  onPress: () => void;
  onAdjust: (delta: number) => void;
  /** 브랜드별로 묶어 놓은 목록에서는 줄마다 브랜드를 다시 쓰지 않는다 */
  showBrand?: boolean;
};

export function PaintRow({ item, onPress, onAdjust, showBrand = true }: PaintRowProps) {
  const { colors } = useTheme();
  const t = useT();
  const isOut = item.quantity <= 0;
  const isLow = !isOut && item.quantity <= item.minQuantity;

  const brandLabel = [item.brandName, item.brandLine].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
    >
      {/* 재고가 모자라면 썸네일에 뱃지를 달아 준다 */}
      <View>
        <ColorSwatch color={item.colorHex} photoUri={item.photoUri} fallbackText={item.code} />
        {isOut || isLow ? (
          <View
            accessibilityLabel={isOut ? t('common.outOfStock') : t('common.lowStock')}
            className={cn(
              'absolute -right-1.5 -top-1.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-background',
              isOut ? 'bg-destructive' : 'bg-warning',
            )}
          >
            <Text
              className={cn(
                'text-[11px] font-bold',
                isOut ? 'text-destructive-foreground' : 'text-white',
              )}
            >
              !
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
            {item.name}
          </Text>
          {item.isFavorite ? <Star size={14} color={colors.warning} fill={colors.warning} /> : null}
        </View>

        {showBrand && brandLabel ? <Text variant="small">{brandLabel}</Text> : null}
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
        <View className="min-w-10 items-center">
          <Text className="text-base font-semibold text-foreground">
            {formatQuantity(item.quantity)}
          </Text>
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
