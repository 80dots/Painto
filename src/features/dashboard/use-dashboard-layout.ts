import { useCallback, useMemo } from 'react';

import {
  resetDashboardLayout,
  saveDashboardLayout,
  useDashboardSettings,
  type DashboardCardState,
} from '@/features/dashboard/queries';
import { DASHBOARD_CARDS, type DashboardCardDefinition } from '@/features/dashboard/registry';

export type ResolvedCard = {
  card: DashboardCardDefinition;
  isVisible: boolean;
  sortOrder: number;
};

/**
 * registry 의 기본값과 DB 에 저장된 사용자 설정을 합쳐
 * 대시보드에 실제로 그릴 카드 목록과 편집 동작을 돌려준다.
 */
export function useDashboardLayout() {
  const { data } = useDashboardSettings();

  const resolved = useMemo<ResolvedCard[]>(() => {
    const settings = new Map((data ?? []).map((row) => [row.cardId, row]));

    return DASHBOARD_CARDS.map((card) => {
      const saved = settings.get(card.id);
      return {
        card,
        isVisible: saved?.isVisible ?? card.defaultVisible,
        sortOrder: saved?.sortOrder ?? card.defaultOrder,
      };
    });
  }, [data]);

  const visible = useMemo(
    () => resolved.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder),
    [resolved],
  );

  const hidden = useMemo(
    () => resolved.filter((item) => !item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder),
    [resolved],
  );

  /** 보이는 카드 순서를 0..n-1 로 다시 매기고, 숨긴 카드는 그 뒤로 보낸다. */
  const persist = useCallback((nextVisible: ResolvedCard[], nextHidden: ResolvedCard[]) => {
    const states: DashboardCardState[] = [
      ...nextVisible.map((item, index) => ({
        cardId: item.card.id,
        isVisible: true,
        sortOrder: index,
      })),
      ...nextHidden.map((item, index) => ({
        cardId: item.card.id,
        isVisible: false,
        sortOrder: nextVisible.length + index,
      })),
    ];
    return saveDashboardLayout(states);
  }, []);

  const addCard = useCallback(
    (cardId: string) => {
      const target = hidden.find((item) => item.card.id === cardId);
      if (!target) return Promise.resolve();
      return persist(
        [...visible, target],
        hidden.filter((item) => item.card.id !== cardId),
      );
    },
    [hidden, persist, visible],
  );

  const removeCard = useCallback(
    (cardId: string) => {
      const target = visible.find((item) => item.card.id === cardId);
      if (!target) return Promise.resolve();
      return persist(
        visible.filter((item) => item.card.id !== cardId),
        [target, ...hidden],
      );
    },
    [hidden, persist, visible],
  );

  const moveCard = useCallback(
    (cardId: string, direction: -1 | 1) => {
      const index = visible.findIndex((item) => item.card.id === cardId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= visible.length) return Promise.resolve();

      const next = [...visible];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return persist(next, hidden);
    },
    [hidden, persist, visible],
  );

  return { visible, hidden, addCard, removeCard, moveCard, reset: resetDashboardLayout };
}
