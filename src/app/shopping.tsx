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
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn, formatQuantity } from '@/lib/utils';

export default function ShoppingScreen() {
  const { colors } = useTheme();
  const t = useT();
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
          placeholder={t('shopping.inputPlaceholder')}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          className="flex-1"
        />
        <Pressable
          onPress={handleAdd}
          accessibilityLabel={t('common.add')}
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
                <Badge
                  label={item.itemType === 'paint' ? t('shopping.paint') : t('shopping.supply')}
                />
                {item.quantity !== 1 ? (
                  <Text variant="small">
                    {t('count.items', { count: formatQuantity(item.quantity) })}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() => deleteShoppingItem(item.id)}
              hitSlop={8}
              accessibilityLabel={t('common.delete')}
            >
              <Trash2 size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={ShoppingCart}
            title={t('shopping.empty')}
            description={t('shopping.emptyDescription')}
          />
        }
        ListFooterComponent={
          purchasedCount > 0 ? (
            <View className="p-4">
              <Button variant="outline" size="sm" onPress={clearPurchasedItems}>
                {t('shopping.clearPurchased', { count: purchasedCount })}
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
}
