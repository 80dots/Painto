import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChangeText, placeholder, className }: SearchBarProps) {
  const { colors } = useTheme();
  const t = useT();

  return (
    <View
      className={cn(
        'h-11 flex-row items-center gap-2 rounded-lg border border-input bg-card px-3',
        className,
      )}
    >
      <Search size={18} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="search"
        className="flex-1 text-base text-foreground"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityLabel={t('a11y.clearSearch')}
          hitSlop={8}
        >
          <X size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
