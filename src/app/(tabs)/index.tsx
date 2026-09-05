import { useRouter } from 'expo-router';
import { Check, LayoutGrid, Pencil, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { DashboardGrid } from '@/features/dashboard/components/dashboard-grid';
import { useT } from '@/features/settings/provider';
import { useDashboardLayout, type ResolvedCard } from '@/features/dashboard/use-dashboard-layout';
import { useTheme } from '@/hooks/use-theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const t = useT();
  const { visible, hidden, addCard, removeCard, moveCardTo, toggleCardSize } = useDashboardLayout();

  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-10">
        <ScreenHeader
          title="Painto"
          subtitle={editing ? t('dashboard.editHint') : t('dashboard.subtitle')}
          right={
            <Pressable
              onPress={() => setEditing((value) => !value)}
              accessibilityLabel={editing ? t('dashboard.editDone') : t('dashboard.edit')}
              className="h-10 w-10 items-center justify-center rounded-lg border border-border active:bg-muted"
            >
              {editing ? (
                <Check size={18} color={colors.primary} />
              ) : (
                <Pencil size={18} color={colors.foreground} />
              )}
            </Pressable>
          }
        />

        <View className="gap-4 px-4">
          {visible.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title={t('dashboard.emptyTitle')}
              description={t('dashboard.emptyDescription')}
              actionLabel={t('dashboard.addCard')}
              onAction={() => setPickerOpen(true)}
            />
          ) : (
            <DashboardGrid
              items={visible}
              editing={editing}
              onLift={() => setEditing(true)}
              onMove={moveCardTo}
              onOpen={(item) => {
                if (item.card.href) router.push(item.card.href);
              }}
              onToggleSize={toggleCardSize}
              onRemove={removeCard}
            />
          )}

          {editing || visible.length === 0 ? (
            <Button variant="outline" onPress={() => setPickerOpen(true)}>
              <Plus size={16} color={colors.foreground} />
              <Text className="text-base font-semibold text-foreground">
                {t('dashboard.addCard')}
              </Text>
            </Button>
          ) : null}
        </View>
      </ScrollView>

      <AddCardModal
        visible={pickerOpen}
        cards={hidden}
        onClose={() => setPickerOpen(false)}
        onSelect={async (cardId) => {
          await addCard(cardId);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
}

function AddCardModal({
  visible,
  cards,
  onClose,
  onSelect,
}: {
  visible: boolean;
  cards: ResolvedCard[];
  onClose: () => void;
  onSelect: (cardId: string) => void;
}) {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="max-h-[70%] rounded-t-xl bg-background p-4 pb-8" onPress={() => {}}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text variant="subtitle">{t('dashboard.addCard')}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel={t('common.close')}>
              <Text variant="label">{t('common.close')}</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-2">
            {cards.length === 0 ? (
              <Text variant="muted">{t('dashboard.allCardsUsed')}</Text>
            ) : (
              cards.map(({ card }) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.id}
                    onPress={() => onSelect(card.id)}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text variant="subtitle">{t(card.titleKey)}</Text>
                      <Text variant="small">{t(card.descriptionKey)}</Text>
                    </View>
                    <Plus size={18} color={colors.mutedForeground} />
                  </Card>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
