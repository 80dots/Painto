import { Stack, useRouter } from 'expo-router';
import { Boxes, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PROJECT_STATUSES, type ProjectStatus } from '@/db/schema';
import { useProjectList } from '@/features/projects/queries';
import { useTheme } from '@/hooks/use-theme';
import { PROJECT_STATUS_LABELS } from '@/lib/labels';
import { formatDate } from '@/lib/utils';

const STATUS_OPTIONS: ChipOption<ProjectStatus | null>[] = [
  { value: null, label: '전체' },
  ...PROJECT_STATUSES.map((status) => ({ value: status, label: PROJECT_STATUS_LABELS[status] })),
];

export default function ProjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [status, setStatus] = useState<ProjectStatus | null>(null);

  const { data } = useProjectList(status);
  const projects = data ?? [];

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: `킷 ${projects.length}개`,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/project/new')}
              accessibilityLabel="킷 추가"
              hitSlop={8}
            >
              <Plus size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View className="px-4 pb-3">
        <ChipGroup options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/project/${item.id}`)} className="gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <Text variant="subtitle" className="flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              <Badge
                label={PROJECT_STATUS_LABELS[item.status]}
                variant={item.status === 'done' ? 'success' : 'primary'}
              />
            </View>
            <Text variant="muted">
              {[item.maker, item.scale].filter(Boolean).join(' · ') || '정보 없음'}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text variant="small">사용 도료 {item.paintCount}종</Text>
              {item.startedAt ? (
                <Text variant="small">시작 {formatDate(item.startedAt)}</Text>
              ) : null}
              {item.finishedAt ? (
                <Text variant="small">완성 {formatDate(item.finishedAt)}</Text>
              ) : null}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Boxes}
            title="등록된 킷이 없습니다"
            description="제작 중인 킷을 등록하면 어떤 도료를 썼는지 함께 기록할 수 있습니다."
            actionLabel="킷 추가"
            onAction={() => router.push('/project/new')}
          />
        }
      />
    </Screen>
  );
}
