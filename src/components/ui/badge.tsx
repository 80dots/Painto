import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-muted',
  primary: 'bg-primary',
  outline: 'border border-border',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
  success: 'bg-success',
} as const;

const badgeTextVariants = {
  default: 'text-muted-foreground',
  primary: 'text-primary-foreground',
  outline: 'text-muted-foreground',
  destructive: 'text-destructive-foreground',
  warning: 'text-white',
  success: 'text-white',
} as const;

export type BadgeProps = {
  label: string;
  variant?: keyof typeof badgeVariants;
  className?: string;
};

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <View className={cn('rounded-md px-2 py-0.5', badgeVariants[variant], className)}>
      <Text className={cn('text-xs font-medium', badgeTextVariants[variant])}>{label}</Text>
    </View>
  );
}
