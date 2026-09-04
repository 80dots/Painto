import { useRouter } from 'expo-router';
import { Minus, Plus, ScanBarcode } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import type { DashboardCardContentProps } from '@/features/dashboard/registry';
import { adjustPaintQuantity, usePaintList, usePaintSummary } from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { formatQuantity } from '@/lib/utils';

/** 대시보드 첫 카드 — 보유 도료 요약과 최근 도료 재고 조절 */
export function PaintsCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: summaryRows } = usePaintSummary();
  const { data: recent } = usePaintList({ sort: 'recent' });

  const summary = summaryRows?.[0];
  const paints = recent ?? [];

  if (size === 'small') {
    return (
      <View className="gap-3">
        <View className="flex-row gap-2">
          <Stat label="보유" value={`${summary?.total ?? 0}종`} />
          <Stat
            label="부족"
            value={`${summary?.lowStock ?? 0}종`}
            highlight={!!summary?.lowStock}
          />
        </View>
        <Button size="sm" onPress={() => router.push('/paint/scan')}>
          <ScanBarcode size={16} color={colors.primaryForeground} />
          <Text className="text-sm font-semibold text-primary-foreground">스캔</Text>
        </Button>
      </View>
    );
  }

  const preview = paints.slice(0, 4);

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <Stat label="보유" value={`${summary?.total ?? 0}종`} />
        <Stat label="총 재고" value={`${formatQuantity(summary?.bottles ?? 0)}병`} />
        <Stat label="부족" value={`${summary?.lowStock ?? 0}종`} highlight={!!summary?.lowStock} />
      </View>

      {preview.length === 0 ? (
        <Text variant="muted">
          아직 등록된 도료가 없습니다. 바코드를 찍거나 이름을 입력해 추가해 보세요.
        </Text>
      ) : (
        <View className="gap-1">
          {preview.map((paint) => (
            <Pressable
              key={paint.id}
              onPress={() => router.push(`/paint/${paint.id}`)}
              className="flex-row items-center gap-3 rounded-md py-1.5 active:bg-muted"
            >
              <ColorSwatch color={paint.colorHex} fallbackText={paint.code} size="sm" />
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                  {paint.name}
                </Text>
                <Text variant="small" numberOfLines={1}>
                  {[paint.brandName, paint.code].filter(Boolean).join(' · ') || '브랜드 없음'}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Pressable
                  onPress={() => adjustPaintQuantity(paint.id, -1, 'use', '대시보드에서 사용')}
                  hitSlop={6}
                  accessibilityLabel={`${paint.name} 재고 1 줄이기`}
                  className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
                >
                  <Minus size={14} color={colors.foreground} />
                </Pressable>
                <View className="min-w-10 items-center">
                  <Text
                    className={
                      paint.quantity <= paint.minQuantity
                        ? 'text-base font-semibold text-destructive'
                        : 'text-base font-semibold text-foreground'
                    }
                  >
                    {formatQuantity(paint.quantity)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustPaintQuantity(paint.id, 1, 'purchase')}
                  hitSlop={6}
                  accessibilityLabel={`${paint.name} 재고 1 늘리기`}
                  className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
                >
                  <Plus size={14} color={colors.foreground} />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View className="flex-row gap-2">
        <Button size="sm" className="flex-1" onPress={() => router.push('/paint/scan')}>
          <ScanBarcode size={16} color={colors.primaryForeground} />
          <Text className="text-sm font-semibold text-primary-foreground">바코드 스캔</Text>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => router.push('/paint/new')}
        >
          <Plus size={16} color={colors.foreground} />
          <Text className="text-sm font-semibold text-foreground">도료 추가</Text>
        </Button>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-1 rounded-md bg-muted px-3 py-2">
      <Text variant="small">{label}</Text>
      <Text
        className={
          highlight ? 'text-lg font-bold text-destructive' : 'text-lg font-bold text-foreground'
        }
      >
        {value}
      </Text>
    </View>
  );
}
