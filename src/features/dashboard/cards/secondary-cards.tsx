import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { usePaintList } from '@/features/paints/queries';
import { useProjectList, useProjectSummary } from '@/features/projects/queries';
import { addLowStockToShoppingList, useShoppingList } from '@/features/shopping/queries';
import { useSupplyList, useSupplySummary } from '@/features/supplies/queries';
import { PROJECT_STATUS_LABELS } from '@/lib/labels';
import { formatQuantity } from '@/lib/utils';

/**
 * 도료 카드 외의 카드들. 기본은 숨김 상태이고 대시보드 편집에서 추가할 수 있다.
 * 카드가 커지면 파일을 하나씩 분리한다.
 */

/** 재고 부족 — 도료와 소모품을 함께 보여준다 */
export function LowStockCard() {
  const router = useRouter();
  const { data: lowPaints } = usePaintList({ onlyLowStock: true, sort: 'quantity' });
  const { data: lowSupplies } = useSupplyList({ onlyLowStock: true });

  const paints = lowPaints ?? [];
  const supplies = lowSupplies ?? [];
  const total = paints.length + supplies.length;

  if (total === 0) {
    return <Text variant="muted">부족한 재고가 없습니다. 도색 준비 완료!</Text>;
  }

  return (
    <View className="gap-2">
      {paints.slice(0, 4).map((paint) => (
        <Pressable
          key={`paint-${paint.id}`}
          onPress={() => router.push(`/paint/${paint.id}`)}
          className="flex-row items-center gap-3"
        >
          <ColorSwatch color={paint.colorHex} fallbackText={paint.code} size="sm" />
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {paint.name}
          </Text>
          <Badge
            label={paint.quantity <= 0 ? '품절' : `${formatQuantity(paint.quantity)}병`}
            variant={paint.quantity <= 0 ? 'destructive' : 'warning'}
          />
        </Pressable>
      ))}

      {supplies.slice(0, 4).map((supply) => (
        <Pressable
          key={`supply-${supply.id}`}
          onPress={() => router.push(`/supply/${supply.id}`)}
          className="flex-row items-center gap-3"
        >
          <View className="h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Text variant="small">소모</Text>
          </View>
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {supply.name}
          </Text>
          <Badge
            label={
              supply.quantity <= 0 ? '품절' : `${formatQuantity(supply.quantity)}${supply.unit}`
            }
            variant={supply.quantity <= 0 ? 'destructive' : 'warning'}
          />
        </Pressable>
      ))}

      <Button variant="outline" size="sm" onPress={() => addLowStockToShoppingList()}>
        구매 목록에 담기
      </Button>
    </View>
  );
}

/** 구매 목록 미리보기 */
export function ShoppingCard() {
  const { data } = useShoppingList();
  const items = data ?? [];
  const pending = items.filter((item) => !item.isPurchased);

  if (pending.length === 0) {
    return <Text variant="muted">담아 둔 항목이 없습니다.</Text>;
  }

  return (
    <View className="gap-1">
      {pending.slice(0, 5).map((item) => (
        <View key={item.id} className="flex-row items-center gap-2">
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="small">{item.itemType === 'paint' ? '도료' : '소모품'}</Text>
        </View>
      ))}
      {pending.length > 5 ? <Text variant="small">외 {pending.length - 5}건</Text> : null}
    </View>
  );
}

/** 소모품 요약 */
export function SuppliesCard() {
  const { data } = useSupplySummary();
  const summary = data?.[0];

  return (
    <View className="flex-row gap-2">
      <View className="flex-1 rounded-md bg-muted px-3 py-2">
        <Text variant="small">보유</Text>
        <Text className="text-lg font-bold text-foreground">{summary?.total ?? 0}종</Text>
      </View>
      <View className="flex-1 rounded-md bg-muted px-3 py-2">
        <Text variant="small">부족</Text>
        <Text className="text-lg font-bold text-foreground">{summary?.lowStock ?? 0}종</Text>
      </View>
    </View>
  );
}

/** 제작 중인 킷 */
export function ProjectsCard() {
  const router = useRouter();
  const { data: summaryRows } = useProjectSummary();
  const { data: list } = useProjectList();

  const summary = summaryRows?.[0];
  const active = (list ?? []).filter((project) => project.status !== 'done').slice(0, 3);

  return (
    <View className="gap-2">
      <Text variant="muted">
        진행 중 {summary?.active ?? 0}개 · 완성 {summary?.done ?? 0}개
      </Text>
      {active.map((project) => (
        <Pressable
          key={project.id}
          onPress={() => router.push(`/project/${project.id}`)}
          className="flex-row items-center gap-2"
        >
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {project.name}
          </Text>
          <Badge label={PROJECT_STATUS_LABELS[project.status]} />
        </Pressable>
      ))}
    </View>
  );
}
