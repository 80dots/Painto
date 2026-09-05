import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import { SUPPLY_CATEGORIES, type SupplyCategory } from '@/db/schema';
import {
  createSupply,
  deleteSupply,
  MASKING_CATEGORY,
  updateSupply,
  useSupply,
} from '@/features/supplies/queries';
import { useAppSettingsContext } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { MASKING_WIDTH_PRESETS } from '@/lib/labels';
import { toNumber } from '@/lib/utils';

type SupplyForm = {
  name: string;
  category: SupplyCategory;
  brand: string;
  spec: string;
  /** 마스킹 테이프 폭(mm) */
  widthMm: string;
  quantity: number;
  unit: string;
  minQuantity: string;
  location: string;
  notes: string;
};

const EMPTY_FORM: SupplyForm = {
  name: '',
  category: 'etc',
  brand: '',
  spec: '',
  widthMm: '',
  quantity: 1,
  unit: '',
  minQuantity: '1',
  location: '',
  notes: '',
};

const WIDTH_OPTIONS: ChipOption<string>[] = MASKING_WIDTH_PRESETS.map((width) => ({
  value: String(width),
  label: `${width}mm`,
}));

export default function SupplyDetailScreen() {
  const { id, category: categoryParam } = useLocalSearchParams<{
    id: string;
    category?: SupplyCategory;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, catalog } = useAppSettingsContext();

  const isNew = id === 'new';
  const supplyId = isNew ? null : Number(id);

  const { data } = useSupply(supplyId);
  const supply = data?.[0];

  const [form, setForm] = useState<SupplyForm>(() =>
    categoryParam === MASKING_CATEGORY
      ? {
          ...EMPTY_FORM,
          category: MASKING_CATEGORY,
          unit: t('units.roll'),
          name: t('supplyForm.maskingDefaultName'),
        }
      : categoryParam
        ? { ...EMPTY_FORM, category: categoryParam, unit: t('units.item') }
        : { ...EMPTY_FORM, unit: t('units.item') },
  );
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo<ChipOption<SupplyCategory>[]>(
    () => SUPPLY_CATEGORIES.map((item) => ({ value: item, label: t(`supplyCategory.${item}`) })),
    [t],
  );

  const unitOptions = useMemo<ChipOption<string>[]>(
    () => catalog.units.presets.map((unit) => ({ value: unit, label: unit })),
    [catalog],
  );
  const initialized = useRef(isNew);

  useEffect(() => {
    if (initialized.current || !supply) return;
    initialized.current = true;
    setForm({
      name: supply.name,
      category: supply.category,
      brand: supply.brand ?? '',
      spec: supply.spec ?? '',
      widthMm: supply.widthMm ? String(supply.widthMm) : '',
      quantity: supply.quantity,
      unit: supply.unit,
      minQuantity: String(supply.minQuantity),
      location: supply.location ?? '',
      notes: supply.notes ?? '',
    });
  }, [supply]);

  const update = <K extends keyof SupplyForm>(key: K, value: SupplyForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('supplyForm.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      const values = {
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim() || null,
        spec: form.spec.trim() || null,
        widthMm: form.widthMm ? toNumber(form.widthMm) : null,
        quantity: form.quantity,
        unit: form.unit,
        minQuantity: toNumber(form.minQuantity, 1),
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (isNew) {
        await createSupply(values);
      } else if (supplyId) {
        await updateSupply(supplyId, values);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!supplyId) return;
    Alert.alert(t('supplyForm.deleteTitle'), t('supplyForm.deleteMessage', { name: form.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteSupply(supplyId);
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
        options={{ title: isNew ? t('supplyForm.titleNew') : t('supplyForm.titleEdit') }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Field label={t('supplyForm.name')} required>
          <Input
            value={form.name}
            onChangeText={(value) => update('name', value)}
            placeholder={t('supplyForm.namePlaceholder')}
          />
        </Field>

        <Field label={t('supplyForm.category')}>
          <ChipGroup
            options={categoryOptions}
            value={form.category}
            onChange={(v) => update('category', v)}
          />
        </Field>

        {form.category === MASKING_CATEGORY ? (
          <Field label={t('supplyForm.width')} hint={t('supplyForm.widthHint')}>
            <View className="gap-2">
              <ChipGroup
                options={WIDTH_OPTIONS}
                value={form.widthMm}
                onChange={(v) => update('widthMm', v)}
              />
              <Input
                value={form.widthMm}
                onChangeText={(value) => update('widthMm', value)}
                keyboardType="decimal-pad"
                placeholder={t('supplyForm.widthPlaceholder')}
              />
            </View>
          </Field>
        ) : null}

        <View className="flex-row gap-3">
          <Field label={t('supplyForm.brand')} className="flex-1">
            <Input
              value={form.brand}
              onChangeText={(value) => update('brand', value)}
              placeholder={t('supplyForm.brandPlaceholder')}
            />
          </Field>
          <Field label={t('supplyForm.spec')} className="flex-1">
            <Input
              value={form.spec}
              onChangeText={(value) => update('spec', value)}
              placeholder={
                form.category === MASKING_CATEGORY
                  ? t('supplyForm.specMasking')
                  : t('supplyForm.specDefault')
              }
            />
          </Field>
        </View>

        <View className="flex-row gap-3">
          <Field label={t('supplyForm.quantity')} className="flex-1">
            <Stepper
              value={form.quantity}
              onChange={(v) => update('quantity', v)}
              suffix={form.unit}
            />
          </Field>
          <Field label={t('supplyForm.minQuantity')} className="w-28">
            <Input
              value={form.minQuantity}
              onChangeText={(value) => update('minQuantity', value)}
              keyboardType="decimal-pad"
              placeholder="1"
            />
          </Field>
        </View>

        <Field label={t('supplyForm.unit')}>
          <ChipGroup options={unitOptions} value={form.unit} onChange={(v) => update('unit', v)} />
        </Field>

        <Field label={t('supplyForm.location')}>
          <Input
            value={form.location}
            onChangeText={(value) => update('location', value)}
            placeholder={t('supplyForm.locationPlaceholder')}
          />
        </Field>

        <Field label={t('supplyForm.notes')}>
          <Input
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            placeholder={t('supplyForm.notesPlaceholder')}
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Button onPress={handleSave} loading={saving} size="lg">
          {isNew ? t('common.register') : t('common.save')}
        </Button>

        {!isNew ? (
          <Button variant="outline" onPress={handleDelete}>
            <Trash2 size={16} color={colors.destructive} />
            <Text className="text-base font-semibold text-destructive">{t('common.delete')}</Text>
          </Button>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
