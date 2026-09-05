import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { Keyboard, ScanBarcode } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { incrementPaintByBarcode, type PaintListItem } from '@/features/paints/queries';
import { useT } from '@/features/settings/provider';
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
  const t = useT();

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
    return <Centered>{t('scan.preparing')}</Centered>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
        <Stack.Screen options={{ title: t('nav.paintScan') }} />
        <ScanBarcode size={32} color={colors.mutedForeground} />
        <Text variant="subtitle" className="text-center">
          {t('scan.permissionTitle')}
        </Text>
        <Text variant="muted" className="text-center">
          {t('scan.permissionDescription')}
        </Text>
        <Button onPress={requestPermission}>{t('scan.allowCamera')}</Button>
        <Button variant="ghost" onPress={() => router.replace('/paint/new')}>
          {t('scan.manualAdd')}
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ title: t('nav.paintScan') }} />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={result ? undefined : handleScanned}
      />

      {/* 조준 가이드 */}
      <View className="flex-1 items-center justify-center">
        <View className="h-40 w-72 rounded-xl border-2 border-white/80" />
        <Text className="mt-4 text-sm text-white">{t('scan.guide')}</Text>
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
                  {t('scan.matched', { count: formatQuantity(result.paint.quantity) })}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Button className="flex-1" onPress={scanAgain}>
                {t('scan.scanAgain')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => router.push(`/paint/${result.paint.id}`)}
              >
                {t('scan.openPaint')}
              </Button>
            </View>
          </View>
        ) : result?.status === 'unknown' ? (
          <View className="gap-3">
            <View>
              <Text variant="subtitle">{t('scan.unknownTitle')}</Text>
              <Text variant="muted">{result.barcode}</Text>
            </View>
            <View className="flex-row gap-2">
              <Button
                className="flex-1"
                onPress={() =>
                  router.replace({
                    pathname: '/paint/[id]',
                    params: { id: 'new', barcode: result.barcode },
                  })
                }
              >
                {t('scan.registerWithBarcode')}
              </Button>
              <Button variant="outline" className="flex-1" onPress={scanAgain}>
                {t('scan.retry')}
              </Button>
            </View>
          </View>
        ) : (
          <Button variant="outline" onPress={() => router.replace('/paint/new')}>
            <Keyboard size={16} color={colors.foreground} />
            <Text className="text-base font-semibold text-foreground">
              {t('scan.manualAddShort')}
            </Text>
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
