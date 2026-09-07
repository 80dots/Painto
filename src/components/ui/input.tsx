import { forwardRef, type ReactNode } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export type InputProps = TextInputProps & {
  className?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { className, style, multiline, ...props },
  ref,
) {
  const { colors } = useTheme();

  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      placeholderTextColor={colors.mutedForeground}
      className={cn(
        'h-11 rounded-lg border border-input bg-card px-3 text-base text-foreground',
        multiline && 'h-auto min-h-24 py-3',
        className,
      )}
      /**
       * 안드로이드 TextInput 은 글꼴 위아래에 여백(includeFontPadding)을 덧붙이고
       * Tailwind 가 넣어 준 lineHeight 를 그대로 반영한다. 높이를 고정한 칸에서는
       * 이 둘이 겹치면서 글자 윗부분이 잘려 보인다.
       * 여백과 lineHeight 를 끄고 세로 가운데 정렬로 맞춘다.
       */
      style={[
        { includeFontPadding: false, lineHeight: undefined },
        multiline
          ? { textAlignVertical: 'top' }
          : { textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 },
        style,
      ]}
      {...props}
    />
  );
});

export type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** 라벨 + 입력 위젯 한 묶음 */
export function Field({ label, hint, required, children, className }: FieldProps) {
  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-center gap-1">
        <Text variant="label">{label}</Text>
        {required ? <Text className="text-sm text-destructive">*</Text> : null}
      </View>
      {children}
      {hint ? <Text variant="small">{hint}</Text> : null}
    </View>
  );
}
