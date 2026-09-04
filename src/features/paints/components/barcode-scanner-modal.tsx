import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

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

export type BarcodeScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
};

/** 도료 등록 화면에서 바코드 칸을 채우기 위한 간단한 스캐너 */
export function BarcodeScannerModal({ visible, onClose, onScanned }: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const busy = useRef(false);

  const handleScanned = ({ data }: BarcodeScanningResult) => {
    if (busy.current) return;
    busy.current = true;
    onScanned(data.trim());
    onClose();
    // 다음에 모달을 열었을 때 다시 스캔할 수 있도록 풀어 준다.
    setTimeout(() => {
      busy.current = false;
    }, 500);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
            onBarcodeScanned={handleScanned}
          />
        ) : null}

        <View className="flex-1 items-center justify-center gap-4 p-8">
          {permission?.granted ? (
            <>
              <View className="h-40 w-72 rounded-xl border-2 border-white/80" />
              <Text className="text-sm text-white">바코드를 사각형 안에 맞춰 주세요</Text>
            </>
          ) : (
            <>
              <Text className="text-center text-base text-white">
                바코드를 찍으려면 카메라 권한이 필요합니다
              </Text>
              <Button onPress={requestPermission}>카메라 권한 허용</Button>
            </>
          )}
        </View>

        <View className="bg-background p-4 pb-8">
          <Pressable onPress={onClose} accessibilityRole="button" className="items-center py-2">
            <Text variant="label">닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
