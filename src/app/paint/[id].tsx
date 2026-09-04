import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, ScanBarcode, Star, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { PhotoPicker } from '@/components/photo-picker';
import { ActionSheet, type ActionSheetItem } from '@/components/ui/action-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Field, Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { Text } from '@/components/ui/text';
import { PAINT_FINISHES, PAINT_TYPES, type PaintFinish, type PaintType } from '@/db/schema';
import { BarcodeScannerModal } from '@/features/paints/components/barcode-scanner-modal';
import {
  createPaint,
  deletePaint,
  findPaintByBarcode,
  updatePaint,
  useBrandOptions,
  usePaint,
  usePaintStockLogs,
} from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { PAINT_FINISH_LABELS, PAINT_TYPE_LABELS, STOCK_REASON_LABELS } from '@/lib/labels';
import { deletePhoto } from '@/lib/photos';
import { formatDate, formatQuantity, normalizeHex, toNumber } from '@/lib/utils';

type PaintForm = {
  name: string;
  code: string;
  barcode: string;
  photoUri: string | null;
  brandId: number | null;
  type: PaintType;
  finish: PaintFinish;
  colorHex: string;
  volumeMl: string;
  /** 희석비 도료 쪽 값 */
  thinnerPaint: string;
  /** 희석비 신너 쪽 값 */
  thinnerSolvent: string;
  quantity: number;
  /** 적정 보유 수량 — 보유량이 이 아래로 내려가면 부족으로 표시 */
  minQuantity: number;
  location: string;
  notes: string;
  isFavorite: boolean;
};

const EMPTY_FORM: PaintForm = {
  name: '',
  code: '',
  barcode: '',
  photoUri: null,
  brandId: null,
  type: 'lacquer',
  finish: 'none',
  colorHex: '',
  volumeMl: '',
  thinnerPaint: '',
  thinnerSolvent: '',
  quantity: 1,
  minQuantity: 1,
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

/** "1:2" → { paint: '1', solvent: '2' } */
function splitRatio(ratio?: string | null) {
  const [paint = '', solvent = ''] = (ratio ?? '').split(':');
  return { paint: paint.trim(), solvent: solvent.trim() };
}

export default function PaintDetailScreen() {
  const { id, barcode: barcodeParam } = useLocalSearchParams<{ id: string; barcode?: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isNew = id === 'new';
  const paintId = isNew ? null : Number(id);

  const { data: paintRows } = usePaint(paintId);
  const { data: brandRows } = useBrandOptions();
  const { data: logs } = usePaintStockLogs(paintId);

  const [form, setForm] = useState<PaintForm>({
    ...EMPTY_FORM,
    barcode: barcodeParam ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  /** 자주 안 쓰는 항목은 접어 둔다 */
  const [showMore, setShowMore] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const initialized = useRef(isNew);
  /** 저장 시 지워야 할 예전 사진 경로 */
  const savedPhotoUri = useRef<string | null>(null);

  const paint = paintRows?.[0];

  useEffect(() => {
    if (initialized.current || !paint) return;
    initialized.current = true;
    savedPhotoUri.current = paint.photoUri;

    const ratio = splitRatio(paint.thinnerRatio);
    setForm({
      name: paint.name,
      code: paint.code ?? '',
      barcode: paint.barcode ?? '',
      photoUri: paint.photoUri,
      brandId: paint.brandId,
      type: paint.type,
      finish: paint.finish,
      colorHex: paint.colorHex ?? '',
      volumeMl: paint.volumeMl ? String(paint.volumeMl) : '',
      thinnerPaint: ratio.paint,
      thinnerSolvent: ratio.solvent,
      quantity: paint.quantity,
      minQuantity: paint.minQuantity,
      location: paint.location ?? '',
      notes: paint.notes ?? '',
      isFavorite: paint.isFavorite,
    });
  }, [paint]);

  const brands = useMemo(
    () =>
      (brandRows ?? []).map((brand) => ({
        id: brand.id,
        name: brand.name,
        line: brand.line,
      })),
    [brandRows],
  );

  const brandLabel = useMemo(() => {
    const brand = brands.find((item) => item.id === form.brandId);
    if (!brand) return null;
    return brand.line ? `${brand.name} ${brand.line}` : brand.name;
  }, [brands, form.brandId]);

  const brandItems = useMemo<ActionSheetItem[]>(
    () => [
      {
        key: 'none',
        label: '브랜드 없음',
        selected: form.brandId === null,
        onPress: () => {
          update('brandId', null);
          setBrandOpen(false);
        },
      },
      ...brands.map((brand) => ({
        key: String(brand.id),
        label: brand.name,
        description: brand.line ?? undefined,
        selected: brand.id === form.brandId,
        onPress: () => {
          update('brandId', brand.id);
          setBrandOpen(false);
        },
      })),
    ],
    [brands, form.brandId],
  );

  const update = <K extends keyof PaintForm>(key: K, value: PaintForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleScanned = async (scanned: string) => {
    update('barcode', scanned);

    // 이미 등록된 바코드를 새 도료에 붙이려 하면 알려 준다.
    const existing = await findPaintByBarcode(scanned);
    if (existing && existing.id !== paintId) {
      Alert.alert(
        '이미 등록된 바코드입니다',
        `'${existing.name}' 에 등록된 바코드입니다. 그 도료를 열까요?`,
        [
          { text: '아니요', style: 'cancel' },
          { text: '열기', onPress: () => router.replace(`/paint/${existing.id}`) },
        ],
      );
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('이름을 입력해 주세요');
      return;
    }
    setSaving(true);
    try {
      const thinnerRatio =
        form.thinnerPaint.trim() && form.thinnerSolvent.trim()
          ? `${form.thinnerPaint.trim()}:${form.thinnerSolvent.trim()}`
          : null;

      const values = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        barcode: form.barcode.trim() || null,
        photoUri: form.photoUri,
        brandId: form.brandId,
        type: form.type,
        finish: form.finish,
        colorHex: normalizeHex(form.colorHex),
        volumeMl: form.volumeMl ? toNumber(form.volumeMl) : null,
        thinnerRatio,
        quantity: form.quantity,
        minQuantity: form.minQuantity,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
        isFavorite: form.isFavorite,
      };

      if (isNew) {
        await createPaint(values);
      } else if (paintId) {
        await updatePaint(paintId, values);
      }

      // 사진을 바꿨다면 예전 파일을 정리한다.
      if (savedPhotoUri.current && savedPhotoUri.current !== form.photoUri) {
        deletePhoto(savedPhotoUri.current);
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
          title: isNew ? '도료 등록' : '도료 편집',
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
        {/* 사진 · 브랜드 · 이름 */}
        <View className="flex-row gap-3">
          <PhotoPicker
            uri={form.photoUri}
            onChange={(uri) => update('photoUri', uri)}
            size={104}
            title="도료 사진"
          />

          <View className="flex-1 justify-center gap-2">
            <Pressable
              onPress={() => setBrandOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="브랜드 선택"
              className="h-10 flex-row items-center gap-2 rounded-lg border border-input bg-card px-3 active:bg-muted"
            >
              <Text
                className={
                  brandLabel
                    ? 'flex-1 text-sm text-foreground'
                    : 'flex-1 text-sm text-muted-foreground'
                }
                numberOfLines={1}
              >
                {brandLabel ?? '브랜드 선택'}
              </Text>
              <ChevronDown size={16} color={colors.mutedForeground} />
            </Pressable>

            <Input
              value={form.name}
              onChangeText={(value) => update('name', value)}
              placeholder="도료 이름"
              className="h-14 text-2xl font-semibold"
            />
          </View>
        </View>

        <Field label="종류">
          <ChipGroup options={TYPE_OPTIONS} value={form.type} onChange={(v) => update('type', v)} />
        </Field>

        <Field label="색상" hint="#RRGGBB 형식으로 입력하면 목록에 색이 표시됩니다.">
          <Input
            value={form.colorHex}
            onChangeText={(value) => update('colorHex', value)}
            placeholder="#1A1A1A"
            autoCapitalize="characters"
          />
        </Field>

        <Field label="광택">
          <ChipGroup
            options={FINISH_OPTIONS}
            value={form.finish}
            onChange={(v) => update('finish', v)}
          />
        </Field>

        <Field label="용량 (ml)">
          <Input
            value={form.volumeMl}
            onChangeText={(value) => update('volumeMl', value)}
            keyboardType="decimal-pad"
            placeholder="10"
            className="w-32"
          />
        </Field>

        <Field label="보유 수량">
          <Stepper
            value={form.quantity}
            onChange={(v) => update('quantity', v)}
            step={1}
            suffix="병"
          />
        </Field>

        <Button
          variant="ghost"
          onPress={() => setShowMore((value) => !value)}
          accessibilityState={{ expanded: showMore }}
        >
          {showMore ? (
            <ChevronUp size={16} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={16} color={colors.mutedForeground} />
          )}
          <Text variant="label">{showMore ? '접기' : '더보기'}</Text>
        </Button>

        {showMore ? (
          <>
            <Field label="품번">
              <Input
                value={form.code}
                onChangeText={(value) => update('code', value)}
                placeholder="예: C-2, XF-1"
                autoCapitalize="characters"
              />
            </Field>

            <Field
              label="적정 보유 수량"
              hint="보유 수량이 이 값 아래로 내려가면 부족으로 표시합니다."
            >
              <Stepper
                value={form.minQuantity}
                onChange={(v) => update('minQuantity', v)}
                step={1}
                suffix="병"
              />
            </Field>

            <Field
              label="바코드"
              hint="도료 병의 바코드를 등록해 두면 스캔만으로 재고를 올릴 수 있습니다."
            >
              <View className="flex-row gap-2">
                <Input
                  value={form.barcode}
                  onChangeText={(value) => update('barcode', value)}
                  placeholder="8801234567890"
                  keyboardType="number-pad"
                  className="flex-1"
                />
                <Pressable
                  onPress={() => setScannerOpen(true)}
                  accessibilityLabel="바코드 스캔"
                  className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
                >
                  <ScanBarcode size={18} color={colors.foreground} />
                </Pressable>
              </View>
            </Field>

            <Field label="희석비 (도료 : 신너)">
              <View className="flex-row items-center gap-2">
                <Input
                  value={form.thinnerPaint}
                  onChangeText={(value) => update('thinnerPaint', value)}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  className="flex-1 text-center"
                />
                <Text variant="label">:</Text>
                <Input
                  value={form.thinnerSolvent}
                  onChangeText={(value) => update('thinnerSolvent', value)}
                  keyboardType="decimal-pad"
                  placeholder="2"
                  className="flex-1 text-center"
                />
              </View>
            </Field>

            <Field label="보관 위치">
              <Input
                value={form.location}
                onChangeText={(value) => update('location', value)}
                placeholder="A박스 1칸"
              />
            </Field>

            <Field label="메모">
              <Input
                value={form.notes}
                onChangeText={(value) => update('notes', value)}
                placeholder="조색비, 사용처 등"
                multiline
                textAlignVertical="top"
              />
            </Field>
          </>
        ) : null}

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

      <ActionSheet
        visible={brandOpen}
        title="브랜드"
        items={brandItems}
        onClose={() => setBrandOpen(false)}
      />

      <BarcodeScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleScanned}
      />
    </KeyboardAvoidingView>
  );
}
