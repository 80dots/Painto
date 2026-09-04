import { type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

export type CardProps = ViewProps & {
  children?: ReactNode;
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className, ...props }: CardProps) {
  const classes = cn('rounded-lg border border-border bg-card p-4', className);

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={cn(classes, 'active:opacity-70')}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
