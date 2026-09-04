import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { persistPhoto } from '@/lib/photos';

export type PhotoPickerProps = {
  uri: string | null;
  onChange: (uri: string | null) => void;
};

/** 도료 사진 촬영/선택. 고른 사진은 앱 문서 폴더로 복사한 뒤 경로를 돌려준다. */
export function PhotoPicker({ uri, onChange }: PhotoPickerProps) {
  const { colors } = useTheme();
  const [working, setWorking] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
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

  return (
    <View className="gap-2">
      {uri ? (
        <View className="relative self-start">
          <Image
            source={{ uri }}
            style={{ width: 120, height: 120, borderRadius: 12 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => onChange(null)}
            accessibilityLabel="사진 삭제"
            hitSlop={8}
            className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full border border-border bg-card"
          >
            <X size={14} color={colors.foreground} />
          </Pressable>
        </View>
      ) : (
        <View className="h-28 w-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <Text variant="small">사진 없음</Text>
        </View>
      )}

      <View className="flex-row gap-2">
        <Button variant="outline" size="sm" loading={working} onPress={() => pick('camera')}>
          <Camera size={16} color={colors.foreground} />
          <Text className="text-sm font-semibold text-foreground">촬영</Text>
        </Button>
        <Button variant="outline" size="sm" loading={working} onPress={() => pick('library')}>
          <ImagePlus size={16} color={colors.foreground} />
          <Text className="text-sm font-semibold text-foreground">앨범</Text>
        </Button>
      </View>
    </View>
  );
}
