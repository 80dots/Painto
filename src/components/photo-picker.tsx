import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { ActionSheet, type ActionSheetItem } from '@/components/ui/action-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { persistPhoto } from '@/lib/photos';

export type PhotoPickerProps = {
  uri: string | null;
  onChange: (uri: string | null) => void;
  /** 정사각 썸네일 한 변 (px) */
  size?: number;
  /** 시트 제목 */
  title?: string;
};

/**
 * 사진 썸네일. 누르면 촬영/앨범 선택 시트가 열린다.
 * 고른 사진은 앱 문서 폴더로 복사한 뒤 경로를 돌려준다.
 */
export function PhotoPicker({ uri, onChange, size = 96, title = '사진' }: PhotoPickerProps) {
  const { colors } = useTheme();
  const [working, setWorking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
    setSheetOpen(false);
    setWorking(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          '권한이 필요합니다',
          source === 'camera'
            ? '사진을 찍으려면 카메라 권한을 허용해 주세요.'
            : '앨범에서 사진을 가져오려면 사진 접근 권한을 허용해 주세요.',
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets[0]) return;
      onChange(await persistPhoto(result.assets[0].uri));
    } catch (error) {
      Alert.alert('사진을 저장하지 못했습니다', String(error));
    } finally {
      setWorking(false);
    }
  };

  const items: ActionSheetItem[] = [
    { key: 'camera', label: '촬영', onPress: () => pick('camera') },
    { key: 'library', label: '앨범에서 선택', onPress: () => pick('library') },
  ];

  if (uri) {
    items.push({
      key: 'remove',
      label: '사진 삭제',
      destructive: true,
      onPress: () => {
        setSheetOpen(false);
        onChange(null);
      },
    });
  }

  return (
    <>
      <Pressable
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={uri ? `${title} 변경` : `${title} 추가`}
        className="overflow-hidden rounded-lg active:opacity-70"
        style={{ width: size, height: size }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted">
            {working ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Camera size={20} color={colors.mutedForeground} />
                <Text variant="small">사진</Text>
              </>
            )}
          </View>
        )}

        {uri && working ? (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        ) : null}
      </Pressable>

      <ActionSheet
        visible={sheetOpen}
        title={title}
        items={items}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
