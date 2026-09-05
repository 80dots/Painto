import { Check } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export type ActionSheetItem = {
  key: string;
  label: string;
  /** 라벨 아래 작은 설명 */
  description?: string;
  /** 목록형으로 쓸 때 현재 선택된 항목 */
  selected?: boolean;
  destructive?: boolean;
  onPress: () => void;
};

export type ActionSheetProps = {
  visible: boolean;
  title?: string;
  items: ActionSheetItem[];
  onClose: () => void;
};

/**
 * 아래에서 올라오는 선택 시트.
 * 항목이 3개를 넘으면 Alert 로는 안 되기 때문에 직접 만들어 쓴다.
 */
export function ActionSheet({ visible, title, items, onClose }: ActionSheetProps) {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="max-h-[70%] rounded-t-xl bg-background p-4 pb-8" onPress={() => {}}>
          {title ? (
            <Text variant="subtitle" className="mb-3">
              {title}
            </Text>
          ) : null}

          <ScrollView contentContainerClassName="gap-1">
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: item.selected }}
                className={cn(
                  'flex-row items-center gap-3 rounded-lg px-3 py-3 active:bg-muted',
                  item.selected && 'bg-muted',
                )}
              >
                <View className="flex-1">
                  <Text
                    className={cn(
                      'text-base',
                      item.destructive ? 'text-destructive' : 'text-foreground',
                      item.selected && 'font-semibold',
                    )}
                  >
                    {item.label}
                  </Text>
                  {item.description ? <Text variant="small">{item.description}</Text> : null}
                </View>
                {item.selected ? <Check size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            className="mt-2 items-center rounded-lg border border-border py-3 active:bg-muted"
          >
            <Text variant="label">{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
