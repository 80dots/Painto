import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type ChipOption<T> = {
  value: T;
  label: string;
  /** 좌측에 찍히는 색상 점 (도료 색상 등) */
  dotColor?: string | null;
};

export type ChipGroupProps<T> = {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 가로 스크롤 대신 줄바꿈으로 배치 */
  wrap?: boolean;
  className?: string;
};

export function ChipGroup<T extends string | number | null>({
  options,
  value,
  onChange,
  wrap = false,
  className,
}: ChipGroupProps<T>) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={String(option.value)}
        onPress={() => onChange(option.value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className={cn(
          'flex-row items-center gap-1.5 rounded-md border px-3 py-2',
          selected ? 'border-primary bg-primary' : 'border-border bg-card',
        )}
      >
        {option.dotColor ? (
          <View
            className="h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: option.dotColor }}
          />
        ) : null}
        <Text
          className={cn(
            'text-sm font-medium',
            selected ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (wrap) {
    return <View className={cn('flex-row flex-wrap gap-2', className)}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pr-4"
      className={cn('-mx-4 px-4', className)}
    >
      {chips}
    </ScrollView>
  );
}
