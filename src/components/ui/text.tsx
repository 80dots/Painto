import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/utils';

const textVariants = {
  default: 'text-base text-foreground',
  title: 'text-2xl font-bold text-foreground',
  heading: 'text-lg font-semibold text-foreground',
  subtitle: 'text-base font-semibold text-foreground',
  label: 'text-sm font-medium text-foreground',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
} as const;

export type TextVariant = keyof typeof textVariants;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
};

export function Text({ variant = 'default', className, ...props }: TextProps) {
  return <RNText className={cn(textVariants[variant], className)} {...props} />;
}
