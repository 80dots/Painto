import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn, readableTextColor } from '@/lib/utils';

export type ColorSwatchProps = {
  color?: string | null;
  /** 등록된 도료 사진. 있으면 색상 대신 사진을 보여 준다. */
  photoUri?: string | null;
  /** 색상이 없을 때 대신 보여줄 글자 (품번 앞 두 글자 등) */
  fallbackText?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
} as const;

export function ColorSwatch({
  color,
  photoUri,
  fallbackText,
  size = 'md',
  className,
}: ColorSwatchProps) {
  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-md border border-border',
        sizeClasses[size],
        !color && !photoUri && 'bg-muted',
        className,
      )}
      style={color && !photoUri ? { backgroundColor: color } : undefined}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : fallbackText ? (
        <Text
          className="text-[10px] font-semibold"
          style={{ color: color ? readableTextColor(color) : undefined }}
        >
          {fallbackText.slice(0, 4)}
        </Text>
      ) : null}
    </View>
  );
}
