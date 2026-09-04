import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import { PAINT_FINISHES, PAINT_TYPES, type PaintFinish, type PaintType } from '@/db/schema';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import {
  createPaint,
  deletePaint,
  updatePaint,
  useBrandOptions,
  usePaint,
  usePaintStockLogs,
} from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { PAINT_FINISH_LABELS, PAINT_TYPE_LABELS, STOCK_REASON_LABELS } from '@/lib/labels';
import { formatDate, formatQuantity, normalizeHex, toNumber } from '@/lib/utils';

type PaintForm = {
  name: string;
  code: string;
  brandId: number | null;
  type: PaintType;
  finish: PaintFinish;
  colorHex: string;
  volumeMl: string;
  quantity: number;
  remainingPct: number;
  minQuantity: string;
  location: string;
  notes: string;
  isFavorite: boolean;
};

const EMPTY_FORM: PaintForm = {
  name: '',
  code: '',
  brandId: null,
  type: 'lacquer',
  finish: 'none',
  colorHex: '',
  volumeMl: '',
  quantity: 1,
  remainingPct: 100,
  minQuantity: '1',
  location: '',
  notes: '',
  isFavorite: false,
};

const TYPE_OPTIONS: ChipOption<PaintType>[] = PAINT_TYPES.map((type) => ({
  value: type,
  label: PAINT_TYPE_LABELS[type],
}));

const FINISH_OPTIONS: ChipOption<PaintFinish>[] = PAINT_FINISHES.map((finish) => ({
  value: finish,
  label: PAINT_FINISH_LABELS[finish],
}));

const REMAINING_OPTIONS: ChipOption<number>[] = [100, 75, 50, 25, 10].map((value) => ({
  value,
  label: `${value}%`,
}));

export default function PaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isNew = id === 'new';
  const paintId = isNew ? null : Number(id);

  const { data: paintRows } = usePaint(paintId);
  const { data: brandRows } = useBrandOptions();
  const { data: logs } = usePaintStockLogs(paintId);

  const [form, setForm] = useState<PaintForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(isNew);

  const paint = paintRows?.[0];

  useEffect(() => {
    if (initialized.current || !paint) return;
    initialized.current = true;
    setForm({
      name: paint.name,
      code: paint.code ?? '',
      brandId: paint.brandId,
      type: paint.type,
      finish: paint.finish,
      colorHex: paint.colorHex ?? '',
      volumeMl: paint.volumeMl ? String(paint.volumeMl) : '',
      quantity: paint.quantity,
      remainingPct: paint.remainingPct,
      minQuantity: String(paint.minQuantity),
      location: paint.location ?? '',
      notes: paint.notes ?? '',
      isFavorite: paint.isFavorite,
    });
  }, [paint]);

  const brandOptions = useMemo<ChipOption<number | null>[]>(
    () => [
      { value: null, label: '없음' },
      ...(brandRows ?? []).map((brand) => ({
        value: brand.id,
        label: brand.line ? `${brand.name} ${brand.line}` : brand.name,
      })),
    ],
    [brandRows],
  );

  const update = <K extends keyof PaintForm>(key: K, value: PaintForm[K]) =>
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
        code: form.code.trim() || null,
        brandId: form.brandId,
        type: form.type,
        finish: form.finish,
        colorHex: normalizeHex(form.colorHex),
        volumeMl: form.volumeMl ? toNumber(form.volumeMl) : null,
        quantity: form.quantity,
        remainingPct: form.remainingPct,
        minQuantity: toNumber(form.minQuantity, 1),
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
        isFavorite: form.isFavorite,
      };

      if (isNew) {
        await createPaint(values);
      } else if (paintId) {
        await updatePaint(paintId, values);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!paintId) return;
    Alert.alert('도료 삭제', `'${form.name}' 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deletePaint(paintId);
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
        options={{
          title: isNew ? '도료 추가' : '도료 편집',
          headerRight: () => (
            <Pressable
              onPress={() => update('isFavorite', !form.isFavorite)}
              hitSlop={8}
              accessibilityLabel="즐겨찾기"
            >
              <Star
                size={20}
                color={form.isFavorite ? colors.warning : colors.mutedForeground}
                fill={form.isFavorite ? colors.warning : 'transparent'}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <ColorSwatch color={normalizeHex(form.colorHex)} fallbackText={form.code} size="lg" />
          <View className="flex-1 gap-2">
            <Input
              value={form.name}
              onChangeText={(value) => update('name', value)}
              placeholder="도료 이름 (예: 무광 블랙)"
            />
            <Input
              value={form.code}
              onChangeText={(value) => update('code', value)}
              placeholder="품번 (예: C-2, XF-1)"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <Field label="색상" hint="#RRGGBB 형식으로 입력하면 목록에 색이 표시됩니다.">
          <Input
            value={form.colorHex}
            onChangeText={(value) => update('colorHex', value)}
            placeholder="#1A1A1A"
            autoCapitalize="characters"
          />
        </Field>

        <Field label="브랜드">
          <ChipGroup
            options={brandOptions}
            value={form.brandId}
            onChange={(v) => update('brandId', v)}
          />
        </Field>

        <Field label="종류">
          <ChipGroup options={TYPE_OPTIONS} value={form.type} onChange={(v) => update('type', v)} />
        </Field>

        <Field label="마감">
          <ChipGroup
            options={FINISH_OPTIONS}
            value={form.finish}
            onChange={(v) => update('finish', v)}
          />
        </Field>

        <View className="flex-row gap-3">
          <Field label="보유 수량" className="flex-1">
            <Stepper
              value={form.quantity}
              onChange={(v) => update('quantity', v)}
              step={1}
              suffix="병"
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

        <Field label="개봉한 병 잔량">
          <ChipGroup
            options={REMAINING_OPTIONS}
            value={form.remainingPct}
            onChange={(v) => update('remainingPct', v)}
          />
        </Field>

        <View className="flex-row gap-3">
          <Field label="용량 (ml)" className="w-28">
            <Input
              value={form.volumeMl}
              onChangeText={(value) => update('volumeMl', value)}
              keyboardType="decimal-pad"
              placeholder="10"
            />
          </Field>
          <Field label="보관 위치" className="flex-1">
            <Input
              value={form.location}
              onChangeText={(value) => update('location', value)}
              placeholder="A박스 1칸"
            />
          </Field>
        </View>

        <Field label="메모">
          <Input
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            placeholder="조색비, 사용처 등"
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Button onPress={handleSave} loading={saving} size="lg">
          {isNew ? '등록' : '저장'}
        </Button>

        {!isNew ? (
          <>
            <Button variant="outline" onPress={handleDelete}>
              <Trash2 size={16} color={colors.destructive} />
              <Text className="text-base font-semibold text-destructive">삭제</Text>
            </Button>

            {logs && logs.length > 0 ? (
              <Card className="gap-3">
                <Text variant="subtitle">재고 이력</Text>
                {logs.map((log) => (
                  <View key={log.id} className="flex-row items-center gap-2">
                    <Badge label={STOCK_REASON_LABELS[log.reason]} />
                    <Text className="flex-1 text-sm text-foreground">
                      {log.delta > 0 ? '+' : ''}
                      {formatQuantity(log.delta)}
                      {log.note ? ` · ${log.note}` : ''}
                    </Text>
                    <Text variant="small">{formatDate(log.createdAt)}</Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
