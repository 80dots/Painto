import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
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

import { PhotoPicker } from '@/components/photo-picker';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import { IN_PROGRESS_STATUSES, PROJECT_STATUSES, type ProjectStatus } from '@/db/schema';
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
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { deletePhoto } from '@/lib/photos';
import { formatDate, toNumber } from '@/lib/utils';

type ProjectForm = {
  name: string;
  maker: string;
  scale: string;
  status: ProjectStatus;
  quantity: number;
  price: string;
  location: string;
  purchasedAt: Date | null;
  coverUri: string | null;
  notes: string;
};

const EMPTY_FORM: ProjectForm = {
  name: '',
  maker: '',
  scale: '',
  status: 'unbuilt',
  quantity: 1,
  price: '',
  location: '',
  purchasedAt: null,
  coverUri: null,
  notes: '',
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const t = useT();

  const isNew = id === 'new';
  const projectId = isNew ? null : Number(id);

  const { data } = useProject(projectId);
  const project = data?.[0];
  const { data: palette } = useProjectPaints(projectId);

  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const statusOptions = useMemo<ChipOption<ProjectStatus>[]>(
    () => PROJECT_STATUSES.map((item) => ({ value: item, label: t(`projectStatus.${item}`) })),
    [t],
  );
  const initialized = useRef(isNew);
  /** 저장 시 지워야 할 예전 박스아트 */
  const savedCoverUri = useRef<string | null>(null);

  useEffect(() => {
    if (initialized.current || !project) return;
    initialized.current = true;
    savedCoverUri.current = project.coverUri;
    setForm({
      name: project.name,
      maker: project.maker ?? '',
      scale: project.scale ?? '',
      status: project.status,
      quantity: project.quantity,
      price: project.price ? String(project.price) : '',
      location: project.location ?? '',
      purchasedAt: project.purchasedAt,
      coverUri: project.coverUri,
      notes: project.notes ?? '',
    });
  }, [project]);

  const update = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('projectForm.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      const startedNow = IN_PROGRESS_STATUSES.includes(form.status) && !project?.startedAt;

      const values = {
        name: form.name.trim(),
        maker: form.maker.trim() || null,
        scale: form.scale.trim() || null,
        status: form.status,
        quantity: form.quantity,
        price: form.price ? toNumber(form.price) : null,
        location: form.location.trim() || null,
        purchasedAt: form.purchasedAt,
        coverUri: form.coverUri,
        notes: form.notes.trim() || null,
        startedAt: startedNow ? new Date() : (project?.startedAt ?? null),
        finishedAt: form.status === 'done' ? (project?.finishedAt ?? new Date()) : null,
      };

      if (isNew) {
        const newId = await createProject(values);
        router.replace(`/project/${newId}`);
      } else if (projectId) {
        await updateProject(projectId, values);
        if (savedCoverUri.current && savedCoverUri.current !== form.coverUri) {
          deletePhoto(savedCoverUri.current);
        }
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!projectId) return;
    Alert.alert(t('projectForm.deleteTitle'), t('projectForm.deleteMessage', { name: form.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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
      <Stack.Screen
        options={{ title: isNew ? t('projectForm.titleNew') : t('projectForm.titleEdit') }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Field label={t('projectForm.name')} required>
          <Input
            value={form.name}
            onChangeText={(value) => update('name', value)}
            placeholder={t('projectForm.namePlaceholder')}
          />
        </Field>

        <View className="flex-row gap-3">
          <Field label={t('projectForm.maker')} className="flex-1">
            <Input
              value={form.maker}
              onChangeText={(value) => update('maker', value)}
              placeholder={t('projectForm.makerPlaceholder')}
            />
          </Field>
          <Field label={t('projectForm.scale')} className="w-32">
            <Input
              value={form.scale}
              onChangeText={(value) => update('scale', value)}
              placeholder={t('projectForm.scalePlaceholder')}
            />
          </Field>
        </View>

        <Field label={t('projectForm.status')}>
          <ChipGroup
            options={statusOptions}
            value={form.status}
            onChange={(v) => update('status', v)}
          />
        </Field>

        <Field label={t('projectForm.cover')}>
          <PhotoPicker uri={form.coverUri} onChange={(uri) => update('coverUri', uri)} />
        </Field>

        <View className="flex-row gap-3">
          <Field label={t('projectForm.quantity')} className="flex-1">
            <Stepper
              value={form.quantity}
              onChange={(v) => update('quantity', v)}
              min={1}
              suffix={t('units.item')}
            />
          </Field>
          <Field label={t('projectForm.price')} className="w-36">
            <Input
              value={form.price}
              onChangeText={(value) => update('price', value)}
              keyboardType="number-pad"
              placeholder={t('projectForm.pricePlaceholder')}
            />
          </Field>
        </View>

        <Field label={t('projectForm.purchasedAt')}>
          <View className="flex-row items-center gap-2">
            <View className="h-11 flex-1 justify-center rounded-lg border border-input bg-card px-3">
              <Text
                className={
                  form.purchasedAt ? 'text-base text-foreground' : 'text-base text-muted-foreground'
                }
              >
                {form.purchasedAt ? formatDate(form.purchasedAt) : t('projectForm.purchasedNone')}
              </Text>
            </View>
            <Button variant="outline" size="sm" onPress={() => update('purchasedAt', new Date())}>
              {t('common.today')}
            </Button>
            {form.purchasedAt ? (
              <Button variant="ghost" size="sm" onPress={() => update('purchasedAt', null)}>
                {t('common.clear')}
              </Button>
            ) : null}
          </View>
        </Field>

        <Field label={t('projectForm.location')}>
          <Input
            value={form.location}
            onChangeText={(value) => update('location', value)}
            placeholder={t('projectForm.locationPlaceholder')}
          />
        </Field>

        <Field label={t('projectForm.notes')}>
          <Input
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            placeholder={t('projectForm.notesPlaceholder')}
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Button onPress={handleSave} loading={saving} size="lg">
          {isNew ? t('common.register') : t('common.save')}
        </Button>

        {!isNew ? (
          <>
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="subtitle">{t('projectForm.palette')}</Text>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  accessibilityLabel={t('projectForm.addPaint')}
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
                      accessibilityLabel={t('projectForm.removeFromPalette')}
                    >
                      <X size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text variant="muted">{t('projectForm.paletteEmpty')}</Text>
              )}
            </Card>

            <Button variant="outline" onPress={handleDelete}>
              <Trash2 size={16} color={colors.destructive} />
              <Text className="text-base font-semibold text-destructive">{t('common.delete')}</Text>
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
  const t = useT();
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
          <Text variant="subtitle">{t('projectForm.pickPaint')}</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel={t('common.close')}>
            <Text variant="label">{t('common.close')}</Text>
          </Pressable>
        </View>

        <View className="px-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('projectForm.pickPaintSearch')}
          />
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
                {t('projectForm.pickPaintEmpty')}
              </Text>
            </View>
          }
        />
      </Screen>
    </Modal>
  );
}
