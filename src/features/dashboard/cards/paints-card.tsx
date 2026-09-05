import { useRouter } from 'expo-router';
import { ScanBarcode } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { DashboardCardContentProps } from '@/features/dashboard/registry';
import { usePaintSummary } from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { formatQuantity } from '@/lib/utils';

/** 대시보드 첫 카드 — 보유 도료 재고 요약과 바코드 스캔 */
export function PaintsCard({ size }: DashboardCardContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: summaryRows } = usePaintSummary();
  const summary = summaryRows?.[0];

  const isSmall = size === 'small';

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <Stat label="보유" value={`${summary?.total ?? 0}종`} />
        {isSmall ? null : (
          <Stat label="총 재고" value={`${formatQuantity(summary?.bottles ?? 0)}병`} />
        )}
        <Stat label="부족" value={`${summary?.lowStock ?? 0}종`} highlight={!!summary?.lowStock} />
      </View>

      <Button size="sm" onPress={() => router.push('/paint/scan')}>
        <ScanBarcode size={16} color={colors.primaryForeground} />
        <Text className="text-sm font-semibold text-primary-foreground">
          {isSmall ? '스캔' : '바코드 스캔'}
        </Text>
      </Button>
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
