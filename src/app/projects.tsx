import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { Blocks, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PROJECT_STATUSES, type ProjectStatus } from '@/db/schema';
import { useProjectList, useProjectSummary } from '@/features/projects/queries';
import { useTheme } from '@/hooks/use-theme';
import { PROJECT_STATUS_LABELS } from '@/lib/labels';
import { formatDate, formatQuantity } from '@/lib/utils';

const STATUS_OPTIONS: ChipOption<ProjectStatus | null>[] = [
  { value: null, label: '전체' },
  ...PROJECT_STATUSES.map((status) => ({ value: status, label: PROJECT_STATUS_LABELS[status] })),
];

export default function ProjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [search, setSearch] = useState('');

  const { data } = useProjectList({ status, search });
  const { data: summaryRows } = useProjectSummary();

  const projects = data ?? [];
  const summary = summaryRows?.[0];

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: `프라모델 ${projects.length}종`,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/project/new')}
              accessibilityLabel="프라모델 추가"
              hitSlop={8}
            >
              <Plus size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View className="gap-3 px-4 pb-3 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="이름 · 제조사 · 스케일 검색"
        />

        <View className="flex-row gap-2">
          <Stat label="미조립" value={`${summary?.unbuilt ?? 0}`} />
          <Stat label="진행 중" value={`${summary?.inProgress ?? 0}`} />
          <Stat label="완성" value={`${summary?.done ?? 0}`} />
        </View>

        <ChipGroup options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/project/${item.id}`)}
            className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
          >
            {item.coverUri ? (
              <Image
                source={{ uri: item.coverUri }}
                style={{ width: 56, height: 56, borderRadius: 8 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-lg bg-muted">
                <Blocks size={20} color={colors.mutedForeground} />
              </View>
            )}

            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="small" numberOfLines={1}>
                {[item.maker, item.scale, item.location].filter(Boolean).join(' · ') || '정보 없음'}
              </Text>
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Badge
                  label={PROJECT_STATUS_LABELS[item.status]}
                  variant={item.status === 'done' ? 'success' : 'primary'}
                />
                {item.paintCount > 0 ? <Badge label={`도료 ${item.paintCount}`} /> : null}
                {item.purchasedAt ? (
                  <Text variant="small">구입 {formatDate(item.purchasedAt)}</Text>
                ) : null}
              </View>
            </View>

            {item.quantity > 1 ? (
              <Text className="text-base font-semibold text-foreground">
                ×{formatQuantity(item.quantity)}
              </Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Blocks}
            title={search || status ? '조건에 맞는 킷이 없습니다' : '등록된 프라모델이 없습니다'}
            description="쌓아 둔 미조립 킷부터 등록해 두면 중복 구매를 막을 수 있습니다."
            actionLabel="프라모델 추가"
            onAction={() => router.push('/project/new')}
          />
        }
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-md bg-muted px-3 py-2">
      <Text variant="small">{label}</Text>
      <Text className="text-lg font-bold text-foreground">{value}</Text>
    </View>
  );
}
