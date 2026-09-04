import { Minus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { cn, formatQuantity } from '@/lib/utils';

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
};

/** 재고 수량을 한 손으로 조절하는 +/- 컨트롤 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  suffix,
  className,
}: StepperProps) {
  const { colors } = useTheme();

  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next * 10) / 10));

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="수량 감소"
        onPress={() => onChange(clamp(value - step))}
        disabled={value <= min}
        className={cn(
          'h-10 w-10 items-center justify-center rounded-lg border border-border bg-card active:bg-muted',
          value <= min && 'opacity-40',
        )}
      >
        <Minus size={18} color={colors.foreground} />
      </Pressable>

      <View className="min-w-12 flex-row items-baseline justify-center gap-1">
        <Text className="text-lg font-semibold text-foreground">{formatQuantity(value)}</Text>
        {suffix ? <Text variant="small">{suffix}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="수량 증가"
        onPress={() => onChange(clamp(value + step))}
        disabled={value >= max}
        className={cn(
          'h-10 w-10 items-center justify-center rounded-lg border border-border bg-card active:bg-muted',
          value >= max && 'opacity-40',
        )}
      >
        <Plus size={18} color={colors.foreground} />
      </Pressable>
    </View>
  );
}
