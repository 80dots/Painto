import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { DashboardCardContentProps } from '@/features/dashboard/registry';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { usePaintList } from '@/features/paints/queries';
import { useProjectList, useProjectSummary } from '@/features/projects/queries';
import { addLowStockToShoppingList, useShoppingList } from '@/features/shopping/queries';
import { useMaskingTapes, useSupplyList, useSupplySummary } from '@/features/supplies/queries';
import { useTheme } from '@/hooks/use-theme';
import { PROJECT_STATUS_LABELS, SUPPLY_CATEGORY_LABELS } from '@/lib/labels';
import { formatQuantity } from '@/lib/utils';

/**
 * 도료 카드 외의 대시보드 카드들.
 * 작은 카드(size === 'small')는 화면 너비의 절반이라 요약만 그린다.
 * 카드가 커지면 파일을 하나씩 분리한다.
 */

/** 프라모델 — 미조립(적프라) 재고와 진행 중인 킷 */
export function ProjectsCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: summaryRows } = useProjectSummary();
  const { data: list } = useProjectList();

  const summary = summaryRows?.[0];

  if (size === 'small') {
    return (
      <View className="flex-row gap-2">
        <Stat label="미조립" value={`${summary?.unbuilt ?? 0}종`} />
        <Stat label="진행 중" value={`${summary?.inProgress ?? 0}종`} />
      </View>
    );
  }

  const inProgress = (list ?? [])
    .filter((project) => project.status !== 'done' && project.status !== 'unbuilt')
    .slice(0, 3);

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <Stat label="미조립" value={`${summary?.unbuilt ?? 0}종`} />
        <Stat label="진행 중" value={`${summary?.inProgress ?? 0}종`} />
        <Stat label="완성" value={`${summary?.done ?? 0}종`} />
      </View>

      {inProgress.length > 0 ? (
        <View className="gap-1">
          {inProgress.map((project) => (
            <Pressable
              key={project.id}
              onPress={() => router.push(`/project/${project.id}`)}
              className="flex-row items-center gap-2 rounded-md py-1 active:bg-muted"
            >
              <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                {project.name}
              </Text>
              <Badge label={PROJECT_STATUS_LABELS[project.status]} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text variant="muted">쌓아 둔 킷을 등록해 두면 중복 구매를 막을 수 있습니다.</Text>
      )}

      <Button variant="outline" size="sm" onPress={() => router.push('/project/new')}>
        <Plus size={16} color={colors.foreground} />
        <Text className="text-sm font-semibold text-foreground">프라모델 추가</Text>
      </Button>
    </View>
  );
}

/** 마스킹 테이프 — 폭별 보유 롤 수 */
export function MaskingCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { data } = useMaskingTapes();

  const tapes = data ?? [];
  const rolls = tapes.reduce((sum, tape) => sum + tape.quantity, 0);
  const low = tapes.filter((tape) => tape.quantity <= tape.minQuantity);
  const isSmall = size === 'small';

  if (tapes.length === 0) {
    return (
      <View className="gap-3">
        <Text variant="muted">
          {isSmall
            ? '자주 쓰는 폭부터 등록해 보세요.'
            : '자주 쓰는 폭(3·6·10·18mm)부터 등록해 두면 남은 롤 수를 바로 확인할 수 있습니다.'}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push('/supply/new?category=masking')}
        >
          <Plus size={16} color={colors.foreground} />
          <Text className="text-sm font-semibold text-foreground">테이프 추가</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <Stat label="보유 폭" value={`${tapes.length}종`} />
        {isSmall ? null : <Stat label="총 롤" value={`${formatQuantity(rolls)}롤`} />}
        <Stat label="부족" value={`${low.length}종`} highlight={low.length > 0} />
      </View>

      <View className="flex-row flex-wrap gap-2">
        {tapes.slice(0, isSmall ? 4 : 8).map((tape) => (
          <Pressable
            key={tape.id}
            onPress={() => router.push(`/supply/${tape.id}`)}
            className="flex-row items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 active:bg-muted"
          >
            <Text className="text-sm font-semibold text-foreground">
              {tape.widthMm ? `${formatQuantity(tape.widthMm)}mm` : tape.name}
            </Text>
            <Text
              className={
                tape.quantity <= tape.minQuantity
                  ? 'text-sm font-medium text-destructive'
                  : 'text-sm font-medium text-muted-foreground'
              }
            >
              {formatQuantity(tape.quantity)}
            </Text>
          </Pressable>
        ))}
      </View>

      {isSmall ? null : (
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push('/supply/new?category=masking')}
        >
          <Plus size={16} color={colors.foreground} />
          <Text className="text-sm font-semibold text-foreground">테이프 추가</Text>
        </Button>
      )}
    </View>
  );
}

/** 모델링 용품 — 사포·접착제·퍼티·공구 등 (마스킹 테이프 제외) */
export function SuppliesCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { data: summaryRows } = useSupplySummary('others');
  const { data: list } = useSupplyList({ excludeCategory: 'masking' });

  const summary = summaryRows?.[0];
  const items = list ?? [];
  const low = items.filter((item) => item.quantity <= item.minQuantity).slice(0, 4);

  const stats = (
    <View className="flex-row gap-2">
      <Stat label="보유" value={`${summary?.total ?? 0}종`} />
      <Stat label="부족" value={`${summary?.lowStock ?? 0}종`} highlight={!!summary?.lowStock} />
    </View>
  );

  if (size === 'small') return stats;

  return (
    <View className="gap-3">
      {stats}

      {low.length > 0 ? (
        <View className="gap-1">
          {low.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/supply/${item.id}`)}
              className="flex-row items-center gap-2 rounded-md py-1 active:bg-muted"
            >
              <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                {item.name}
              </Text>
              <Badge label={SUPPLY_CATEGORY_LABELS[item.category]} />
              <Badge
                label={item.quantity <= 0 ? '품절' : `${formatQuantity(item.quantity)}${item.unit}`}
                variant={item.quantity <= 0 ? 'destructive' : 'warning'}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text variant="muted">
          사포·접착제·퍼티·공구처럼 계속 쓰는 용품을 등록해 두면 떨어지기 전에 알 수 있습니다.
        </Text>
      )}
    </View>
  );
}

/** 재고 부족 — 도료·마스킹·용품을 한 번에 */
export function LowStockCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { data: lowPaints } = usePaintList({ onlyLowStock: true, sort: 'quantity' });
  const { data: lowSupplies } = useSupplyList({ onlyLowStock: true });

  const paints = lowPaints ?? [];
  const supplies = lowSupplies ?? [];
  const total = paints.length + supplies.length;

  if (total === 0) {
    return <Text variant="muted">부족한 재고가 없습니다. 도색 준비 완료!</Text>;
  }

  const isSmall = size === 'small';
  const limit = isSmall ? 2 : 4;

  return (
    <View className="gap-2">
      {isSmall ? (
        <View className="flex-row gap-2">
          <Stat label="도료" value={`${paints.length}종`} highlight={paints.length > 0} />
          <Stat label="용품" value={`${supplies.length}종`} highlight={supplies.length > 0} />
        </View>
      ) : null}

      {paints.slice(0, limit).map((paint) => (
        <Pressable
          key={`paint-${paint.id}`}
          onPress={() => router.push(`/paint/${paint.id}`)}
          className="flex-row items-center gap-3"
        >
          {isSmall ? null : (
            <ColorSwatch color={paint.colorHex} fallbackText={paint.code} size="sm" />
          )}
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {paint.name}
          </Text>
          <Badge
            label={paint.quantity <= 0 ? '품절' : `${formatQuantity(paint.quantity)}병`}
            variant={paint.quantity <= 0 ? 'destructive' : 'warning'}
          />
        </Pressable>
      ))}

      {supplies.slice(0, limit).map((supply) => (
        <Pressable
          key={`supply-${supply.id}`}
          onPress={() => router.push(`/supply/${supply.id}`)}
          className="flex-row items-center gap-3"
        >
          {isSmall ? null : (
            <View className="h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Text variant="small">용품</Text>
            </View>
          )}
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

      {isSmall ? null : (
        <Button variant="outline" size="sm" onPress={() => addLowStockToShoppingList()}>
          구매 목록에 담기
        </Button>
      )}
    </View>
  );
}

/** 구매 목록 미리보기 */
export function ShoppingCard({ size }: DashboardCardContentProps) {
  const { data } = useShoppingList();
  const items = data ?? [];
  const pending = items.filter((item) => !item.isPurchased);

  if (pending.length === 0) {
    return <Text variant="muted">담아 둔 항목이 없습니다.</Text>;
  }

  const limit = size === 'small' ? 3 : 5;

  return (
    <View className="gap-1">
      {pending.slice(0, limit).map((item) => (
        <View key={item.id} className="flex-row items-center gap-2">
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="small">{item.itemType === 'paint' ? '도료' : '용품'}</Text>
        </View>
      ))}
      {pending.length > limit ? <Text variant="small">외 {pending.length - limit}건</Text> : null}
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
