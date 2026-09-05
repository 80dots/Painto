import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { Blocks, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PROJECT_STATUSES, type ProjectStatus } from '@/db/schema';
import { useProjectList, useProjectSummary } from '@/features/projects/queries';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatQuantity } from '@/lib/utils';

export default function ProjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const t = useT();

  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [search, setSearch] = useState('');

  const statusOptions = useMemo<ChipOption<ProjectStatus | null>[]>(
    () => [
      { value: null, label: t('common.all') },
      ...PROJECT_STATUSES.map((item) => ({ value: item, label: t(`projectStatus.${item}`) })),
    ],
    [t],
  );

  const { data } = useProjectList({ status, search });
  const { data: summaryRows } = useProjectSummary();

  const projects = data ?? [];
  const summary = summaryRows?.[0];

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: t('projects.title', { count: projects.length }),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/project/new')}
              accessibilityLabel={t('projects.add')}
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
          placeholder={t('projects.searchPlaceholder')}
        />

        <View className="flex-row gap-2">
          <Stat label={t('projects.unbuilt')} value={`${summary?.unbuilt ?? 0}`} />
          <Stat label={t('projects.inProgress')} value={`${summary?.inProgress ?? 0}`} />
          <Stat label={t('projects.done')} value={`${summary?.done ?? 0}`} />
        </View>

        <ChipGroup options={statusOptions} value={status} onChange={setStatus} />
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
                {[item.maker, item.scale, item.location].filter(Boolean).join(' · ') ||
                  t('common.noInfo')}
              </Text>
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Badge
                  label={t(`projectStatus.${item.status}`)}
                  variant={item.status === 'done' ? 'success' : 'primary'}
                />
                {item.paintCount > 0 ? (
                  <Badge label={t('projects.paintCount', { count: item.paintCount })} />
                ) : null}
                {item.purchasedAt ? (
                  <Text variant="small">
                    {t('projects.purchasedAt', { date: formatDate(item.purchasedAt) })}
                  </Text>
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
            title={search || status ? t('projects.emptyFiltered') : t('projects.empty')}
            description={t('projects.emptyDescription')}
            actionLabel={t('projects.add')}
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
