import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PROJECT_STATUSES, type ProjectStatus } from '@/db/schema';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { usePaintList } from '@/features/paints/queries';
import {
  addPaintToProject,
  createProject,
  deleteProject,
  removePaintFromProject,
  updateProject,
  useProject,
  useProjectPaints,
} from '@/features/projects/queries';
import { useTheme } from '@/hooks/use-theme';
import { PROJECT_STATUS_LABELS } from '@/lib/labels';

type ProjectForm = {
  name: string;
  maker: string;
  scale: string;
  status: ProjectStatus;
  notes: string;
};

const EMPTY_FORM: ProjectForm = {
  name: '',
  maker: '',
  scale: '',
  status: 'planned',
  notes: '',
};

const STATUS_OPTIONS: ChipOption<ProjectStatus>[] = PROJECT_STATUSES.map((status) => ({
  value: status,
  label: PROJECT_STATUS_LABELS[status],
}));

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isNew = id === 'new';
  const projectId = isNew ? null : Number(id);

  const { data } = useProject(projectId);
  const project = data?.[0];
  const { data: palette } = useProjectPaints(projectId);

  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const initialized = useRef(isNew);

  useEffect(() => {
    if (initialized.current || !project) return;
    initialized.current = true;
    setForm({
      name: project.name,
      maker: project.maker ?? '',
      scale: project.scale ?? '',
      status: project.status,
      notes: project.notes ?? '',
    });
  }, [project]);

  const update = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('킷 이름을 입력해 주세요');
      return;
    }
    setSaving(true);
    try {
      const values = {
        name: form.name.trim(),
        maker: form.maker.trim() || null,
        scale: form.scale.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
        startedAt:
          form.status !== 'planned' && !project?.startedAt
            ? new Date()
            : (project?.startedAt ?? null),
        finishedAt: form.status === 'done' ? (project?.finishedAt ?? new Date()) : null,
      };

      if (isNew) {
        const newId = await createProject(values);
        router.replace(`/project/${newId}`);
      } else if (projectId) {
        await updateProject(projectId, values);
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!projectId) return;
    Alert.alert('킷 삭제', `'${form.name}' 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(projectId);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <Stack.Screen options={{ title: isNew ? '킷 추가' : '킷 편집' }} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Field label="킷 이름" required>
          <Input
            value={form.name}
            onChangeText={(value) => update('name', value)}
            placeholder="예: RG 사자비"
          />
        </Field>

        <View className="flex-row gap-3">
          <Field label="제조사" className="flex-1">
            <Input
              value={form.maker}
              onChangeText={(value) => update('maker', value)}
              placeholder="반다이"
            />
          </Field>
          <Field label="스케일" className="w-32">
            <Input
              value={form.scale}
              onChangeText={(value) => update('scale', value)}
              placeholder="1/144"
            />
          </Field>
        </View>

        <Field label="진행 상태">
          <ChipGroup
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(v) => update('status', v)}
          />
        </Field>

        <Field label="메모">
          <Input
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            placeholder="개조 계획, 데칼 순서 등"
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Button onPress={handleSave} loading={saving} size="lg">
          {isNew ? '등록' : '저장'}
        </Button>

        {!isNew ? (
          <>
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="subtitle">사용 도료</Text>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  accessibilityLabel="도료 추가"
                  className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
                >
                  <Plus size={16} color={colors.foreground} />
                </Pressable>
              </View>

              {palette && palette.length > 0 ? (
                palette.map((entry) => (
                  <View key={entry.id} className="flex-row items-center gap-3">
                    <ColorSwatch color={entry.colorHex} fallbackText={entry.paintCode} size="sm" />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                        {entry.paintCode ? `${entry.paintCode} ` : ''}
                        {entry.paintName}
                      </Text>
                      <Text variant="small">
                        {[entry.brandName, entry.part, entry.mixRatio].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removePaintFromProject(entry.id)}
                      hitSlop={8}
                      accessibilityLabel="팔레트에서 제거"
                    >
                      <X size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text variant="muted">
                  이 킷에 쓴 도료를 추가해 두면 다음 제작 때 그대로 재현할 수 있습니다.
                </Text>
              )}
            </Card>

            <Button variant="outline" onPress={handleDelete}>
              <Trash2 size={16} color={colors.destructive} />
              <Text className="text-base font-semibold text-destructive">삭제</Text>
            </Button>
          </>
        ) : null}
      </ScrollView>

      {projectId ? (
        <PaintPickerModal
          visible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={async (paintId) => {
            await addPaintToProject(projectId, paintId);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function PaintPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (paintId: number) => void;
}) {
  const [search, setSearch] = useState('');
  const { data } = usePaintList({ search, sort: 'name' });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <Screen className="gap-3">
        <View className="flex-row items-center justify-between px-4 pt-3">
          <Text variant="subtitle">도료 선택</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="닫기">
            <Text variant="label">닫기</Text>
          </Pressable>
        </View>

        <View className="px-4">
          <SearchBar value={search} onChangeText={setSearch} placeholder="이름 · 품번 검색" />
        </View>

        <FlatList
          data={data ?? []}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.id)}
              className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
            >
              <ColorSwatch color={item.colorHex} fallbackText={item.code} size="sm" />
              <View className="flex-1">
                <Text className="text-base text-foreground" numberOfLines={1}>
                  {item.code ? `${item.code} ` : ''}
                  {item.name}
                </Text>
                <Text variant="small">{item.brandName ?? ''}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="p-8">
              <Text variant="muted" className="text-center">
                먼저 도료 탭에서 도료를 등록해 주세요.
              </Text>
            </View>
          }
        />
      </Screen>
    </Modal>
  );
}
