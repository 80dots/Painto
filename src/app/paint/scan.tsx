import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { Keyboard, ScanBarcode } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { incrementPaintByBarcode, type PaintListItem } from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { formatQuantity } from '@/lib/utils';

/** 도료 병에 흔히 쓰이는 1차원 바코드 위주로 스캔한다. */
const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code39',
  'code93',
  'code128',
  'itf14',
  'codabar',
  'qr',
] as const;

type ScanResult =
  | { status: 'matched'; barcode: string; paint: PaintListItem }
  | { status: 'unknown'; barcode: string };

export default function PaintScanScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const busy = useRef(false);

  const handleScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    // 카메라는 같은 바코드를 계속 던지므로 처리 중에는 무시한다.
    if (busy.current) return;
    busy.current = true;

    const barcode = data.trim();
    const paint = await incrementPaintByBarcode(barcode);

    setResult(paint ? { status: 'matched', barcode, paint } : { status: 'unknown', barcode });
  }, []);

  const scanAgain = () => {
    setResult(null);
    busy.current = false;
  };

  if (!permission) {
    return <Centered>카메라를 준비하고 있습니다…</Centered>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
        <Stack.Screen options={{ title: '바코드 스캔' }} />
        <ScanBarcode size={32} color={colors.mutedForeground} />
        <Text variant="subtitle" className="text-center">
          바코드를 찍으려면 카메라 권한이 필요합니다
        </Text>
        <Text variant="muted" className="text-center">
          도료 병의 바코드를 인식해 재고를 올리거나 새 도료를 등록합니다.
        </Text>
        <Button onPress={requestPermission}>카메라 권한 허용</Button>
        <Button variant="ghost" onPress={() => router.replace('/paint/new')}>
          직접 입력해서 추가하기
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ title: '바코드 스캔' }} />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={result ? undefined : handleScanned}
      />

      {/* 조준 가이드 */}
      <View className="flex-1 items-center justify-center">
        <View className="h-40 w-72 rounded-xl border-2 border-white/80" />
        <Text className="mt-4 text-sm text-white">도료 병의 바코드를 사각형 안에 맞춰 주세요</Text>
      </View>

      <View className="gap-3 bg-background p-4 pb-8">
        {result?.status === 'matched' ? (
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <ColorSwatch color={result.paint.colorHex} fallbackText={result.paint.code} />
              <View className="flex-1">
                <Text variant="subtitle" numberOfLines={1}>
                  {result.paint.name}
                </Text>
                <Text variant="muted">
                  재고 +1 → 현재 {formatQuantity(result.paint.quantity)}병
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Button className="flex-1" onPress={scanAgain}>
                계속 스캔
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => router.push(`/paint/${result.paint.id}`)}
              >
                도료 열기
              </Button>
            </View>
          </View>
        ) : result?.status === 'unknown' ? (
          <View className="gap-3">
            <View>
              <Text variant="subtitle">등록되지 않은 바코드입니다</Text>
              <Text variant="muted">{result.barcode}</Text>
            </View>
            <View className="flex-row gap-2">
              <Button
                className="flex-1"
                onPress={() =>
                  router.replace({ pathname: '/paint/new', params: { barcode: result.barcode } })
                }
              >
                이 바코드로 등록
              </Button>
              <Button variant="outline" className="flex-1" onPress={scanAgain}>
                다시 스캔
              </Button>
            </View>
          </View>
        ) : (
          <Button variant="outline" onPress={() => router.replace('/paint/new')}>
            <Keyboard size={16} color={colors.foreground} />
            <Text className="text-base font-semibold text-foreground">직접 입력해서 추가</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

function Centered({ children }: { children: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text variant="muted">{children}</Text>
    </View>
  );
}
