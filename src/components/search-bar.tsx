import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

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
        <Pressable onPress={() => onChangeText('')} accessibilityLabel="검색어 지우기" hitSlop={8}>
          <X size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
