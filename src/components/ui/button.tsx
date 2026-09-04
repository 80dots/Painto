import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const containerVariants = {
  default: 'bg-primary active:opacity-90',
  secondary: 'bg-secondary active:opacity-90',
  outline: 'border border-border bg-transparent active:bg-muted',
  ghost: 'bg-transparent active:bg-muted',
  destructive: 'bg-destructive active:opacity-90',
} as const;

const labelVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
} as const;

const sizeVariants = {
  sm: 'h-9 px-3 rounded-md',
  md: 'h-11 px-4 rounded-lg',
  lg: 'h-14 px-5 rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
} as const;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  variant?: keyof typeof containerVariants;
  size?: keyof typeof sizeVariants;
  loading?: boolean;
  /** 문자열이면 자동으로 Text 로 감싼다 */
  children?: ReactNode;
  className?: string;
  textClassName?: string;
};

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2',
        containerVariants[variant],
        sizeVariants[size],
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : typeof children === 'string' ? (
        <Text className={cn('text-base font-semibold', labelVariants[variant], textClassName)}>
          {children}
        </Text>
      ) : (
        <View className="flex-row items-center gap-2">{children}</View>
      )}
    </Pressable>
  );
}
