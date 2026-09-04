import { forwardRef, type ReactNode } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export type InputProps = TextInputProps & {
  className?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  const { colors } = useTheme();

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.mutedForeground}
      className={cn(
        'h-11 rounded-lg border border-input bg-card px-3 text-base text-foreground',
        props.multiline && 'h-auto min-h-24 py-3',
        className,
      )}
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
