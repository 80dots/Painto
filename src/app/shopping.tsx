import { Check, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  addShoppingItem,
  clearPurchasedItems,
  deleteShoppingItem,
  toggleShoppingItem,
  useShoppingList,
} from '@/features/shopping/queries';
import { useTheme } from '@/hooks/use-theme';
import { cn, formatQuantity } from '@/lib/utils';

export default function ShoppingScreen() {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');

  const { data } = useShoppingList();
  const items = data ?? [];
  const purchasedCount = items.filter((item) => item.isPurchased).length;

  const handleAdd = async () => {
    const name = draft.trim();
    if (!name) return;
    await addShoppingItem({ name });
    setDraft('');
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border p-4">
        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder="살 것을 입력하세요"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          className="flex-1"
        />
        <Pressable
          onPress={handleAdd}
          accessibilityLabel="추가"
          className="h-11 w-11 items-center justify-center rounded-lg bg-primary active:opacity-90"
        >
          <Plus size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
            <Pressable
              onPress={() => toggleShoppingItem(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.isPurchased }}
              hitSlop={6}
              className={cn(
                'h-6 w-6 items-center justify-center rounded-md border',
                item.isPurchased ? 'border-primary bg-primary' : 'border-border',
              )}
            >
              {item.isPurchased ? <Check size={14} color={colors.primaryForeground} /> : null}
            </Pressable>

            <View className="flex-1">
              <Text
                className={cn(
                  'text-base text-foreground',
                  item.isPurchased && 'text-muted-foreground line-through',
                )}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center gap-1.5">
                {item.brand ? <Text variant="small">{item.brand}</Text> : null}
                {item.code ? <Text variant="small">{item.code}</Text> : null}
                <Badge label={item.itemType === 'paint' ? '도료' : '소모품'} />
                {item.quantity !== 1 ? (
                  <Text variant="small">{formatQuantity(item.quantity)}개</Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() => deleteShoppingItem(item.id)}
              hitSlop={8}
              accessibilityLabel="삭제"
            >
              <Trash2 size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={ShoppingCart}
            title="구매 목록이 비어 있습니다"
            description="홈 화면에서 부족한 재고를 한 번에 담을 수 있습니다."
          />
        }
        ListFooterComponent={
          purchasedCount > 0 ? (
            <View className="p-4">
              <Button variant="outline" size="sm" onPress={clearPurchasedItems}>
                {`구매 완료 ${purchasedCount}개 지우기`}
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
}
