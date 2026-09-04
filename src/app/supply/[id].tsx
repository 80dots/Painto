import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import { SUPPLY_CATEGORIES, type SupplyCategory } from '@/db/schema';
import { createSupply, deleteSupply, updateSupply, useSupply } from '@/features/supplies/queries';
import { useTheme } from '@/hooks/use-theme';
import { SUPPLY_CATEGORY_LABELS, SUPPLY_UNITS } from '@/lib/labels';
import { toNumber } from '@/lib/utils';

type SupplyForm = {
  name: string;
  category: SupplyCategory;
  brand: string;
  spec: string;
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
  quantity: 1,
  unit: '개',
  minQuantity: '1',
  location: '',
  notes: '',
};

const CATEGORY_OPTIONS: ChipOption<SupplyCategory>[] = SUPPLY_CATEGORIES.map((category) => ({
  value: category,
  label: SUPPLY_CATEGORY_LABELS[category],
}));

const UNIT_OPTIONS: ChipOption<string>[] = SUPPLY_UNITS.map((unit) => ({
  value: unit,
  label: unit,
}));

export default function SupplyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isNew = id === 'new';
  const supplyId = isNew ? null : Number(id);

  const { data } = useSupply(supplyId);
  const supply = data?.[0];

  const [form, setForm] = useState<SupplyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(isNew);

  useEffect(() => {
    if (initialized.current || !supply) return;
    initialized.current = true;
    setForm({
      name: supply.name,
      category: supply.category,
      brand: supply.brand ?? '',
      spec: supply.spec ?? '',
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
      Alert.alert('이름을 입력해 주세요');
      return;
    }
    setSaving(true);
    try {
      const values = {
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim() || null,
        spec: form.spec.trim() || null,
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
    Alert.alert('소모품 삭제', `'${form.name}' 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
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
      <Stack.Screen options={{ title: isNew ? '소모품 추가' : '소모품 편집' }} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Field label="이름" required>
          <Input
            value={form.name}
            onChangeText={(value) => update('name', value)}
            placeholder="예: 마스킹 테이프"
          />
        </Field>

        <Field label="분류">
          <ChipGroup
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(v) => update('category', v)}
          />
        </Field>

        <View className="flex-row gap-3">
          <Field label="브랜드" className="flex-1">
            <Input
              value={form.brand}
              onChangeText={(value) => update('brand', value)}
              placeholder="타미야"
            />
          </Field>
          <Field label="규격" className="flex-1">
            <Input
              value={form.spec}
              onChangeText={(value) => update('spec', value)}
              placeholder="6mm / #400"
            />
          </Field>
        </View>

        <View className="flex-row gap-3">
          <Field label="보유 수량" className="flex-1">
            <Stepper
              value={form.quantity}
              onChange={(v) => update('quantity', v)}
              suffix={form.unit}
            />
          </Field>
          <Field label="부족 기준" className="w-28">
            <Input
              value={form.minQuantity}
              onChangeText={(value) => update('minQuantity', value)}
              keyboardType="decimal-pad"
              placeholder="1"
            />
          </Field>
        </View>

        <Field label="단위">
          <ChipGroup options={UNIT_OPTIONS} value={form.unit} onChange={(v) => update('unit', v)} />
        </Field>

        <Field label="보관 위치">
          <Input
            value={form.location}
            onChangeText={(value) => update('location', value)}
            placeholder="공구함"
          />
        </Field>

        <Field label="메모">
          <Input
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            placeholder="구매처, 사용 팁 등"
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Button onPress={handleSave} loading={saving} size="lg">
          {isNew ? '등록' : '저장'}
        </Button>

        {!isNew ? (
          <Button variant="outline" onPress={handleDelete}>
            <Trash2 size={16} color={colors.destructive} />
            <Text className="text-base font-semibold text-destructive">삭제</Text>
          </Button>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
