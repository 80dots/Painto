import { useRouter } from 'expo-router';
import { AlertTriangle, ChevronRight, ShoppingCart } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { usePaintList, usePaintSummary } from '@/features/paints/queries';
import { useProjectSummary } from '@/features/projects/queries';
import { addLowStockToShoppingList, useShoppingList } from '@/features/shopping/queries';
import { useSupplyList, useSupplySummary } from '@/features/supplies/queries';
import { useTheme } from '@/hooks/use-theme';
import { formatQuantity } from '@/lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: paintSummary } = usePaintSummary();
  const { data: supplySummary } = useSupplySummary();
  const { data: projectSummary } = useProjectSummary();
  const { data: lowPaints } = usePaintList({ onlyLowStock: true, sort: 'quantity' });
  const { data: lowSupplies } = useSupplyList({ onlyLowStock: true });
  const { data: shopping } = useShoppingList();

  const paints = paintSummary?.[0];
  const supplies = supplySummary?.[0];
  const projects = projectSummary?.[0];

  const lowCount = (lowPaints?.length ?? 0) + (lowSupplies?.length ?? 0);
  const pendingShopping = (shopping ?? []).filter((item) => !item.isPurchased).length;

  const handleAddLowStock = async () => {
    const added = await addLowStockToShoppingList();
    Alert.alert(
      added > 0 ? `${added}개를 구매 목록에 담았습니다` : '새로 담을 항목이 없습니다',
      added > 0 ? undefined : '이미 담겨 있거나 부족한 재고가 없습니다.',
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-8">
        <ScreenHeader title="Painto" subtitle="도료·소모품 재고 한눈에" />

        <View className="flex-row gap-3 px-4">
          <SummaryCard
            label="보유 도료"
            value={`${paints?.total ?? 0}종`}
            hint={`총 ${formatQuantity(paints?.bottles ?? 0)}병`}
            onPress={() => router.push('/paints')}
          />
          <SummaryCard
            label="소모품"
            value={`${supplies?.total ?? 0}종`}
            hint={`부족 ${supplies?.lowStock ?? 0}`}
            onPress={() => router.push('/supplies')}
          />
          <SummaryCard
            label="진행 중 킷"
            value={`${projects?.active ?? 0}개`}
            hint={`완성 ${projects?.done ?? 0}`}
            onPress={() => router.push('/projects')}
          />
        </View>

        <View className="px-4">
          <Card onPress={() => router.push('/shopping')} className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ShoppingCart size={18} color={colors.foreground} />
            </View>
            <View className="flex-1">
              <Text variant="subtitle">구매 목록</Text>
              <Text variant="muted">
                {pendingShopping > 0 ? `${pendingShopping}개 담김` : '비어 있음'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </Card>
        </View>

        <View className="gap-3 px-4">
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={16} color={colors.warning} />
            <Text variant="subtitle" className="flex-1">
              재고 부족
            </Text>
            {lowCount > 0 ? <Badge label={`${lowCount}`} variant="warning" /> : null}
          </View>

          {lowCount === 0 ? (
            <Card>
              <Text variant="muted">부족한 재고가 없습니다. 도색 준비 완료!</Text>
            </Card>
          ) : (
            <Card className="gap-3">
              {(lowPaints ?? []).slice(0, 5).map((paint) => (
                <Pressable
                  key={`paint-${paint.id}`}
                  onPress={() => router.push(`/paint/${paint.id}`)}
                  className="flex-row items-center gap-3"
                >
                  <ColorSwatch color={paint.colorHex} fallbackText={paint.code} size="sm" />
                  <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                    {paint.code ? `${paint.code} ` : ''}
                    {paint.name}
                  </Text>
                  <Badge
                    label={paint.quantity <= 0 ? '품절' : `${formatQuantity(paint.quantity)}병`}
                    variant={paint.quantity <= 0 ? 'destructive' : 'warning'}
                  />
                </Pressable>
              ))}

              {(lowSupplies ?? []).slice(0, 5).map((supply) => (
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
                      supply.quantity <= 0
                        ? '품절'
                        : `${formatQuantity(supply.quantity)}${supply.unit}`
                    }
                    variant={supply.quantity <= 0 ? 'destructive' : 'warning'}
                  />
                </Pressable>
              ))}

              <Button variant="outline" size="sm" onPress={handleAddLowStock}>
                부족한 재고 구매 목록에 담기
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  onPress,
}: {
  label: string;
  value: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} className="flex-1 gap-1 p-3">
      <Text variant="small">{label}</Text>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text variant="small">{hint}</Text>
    </Card>
  );
}
