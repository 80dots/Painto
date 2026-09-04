import { useCallback, useMemo } from 'react';

import type { DashboardCardSize } from '@/db/schema';
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
  size: DashboardCardSize;
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
        size: saved?.size ?? card.defaultSize,
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
        size: item.size,
      })),
      ...nextHidden.map((item, index) => ({
        cardId: item.card.id,
        isVisible: false,
        sortOrder: nextVisible.length + index,
        size: item.size,
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

  /** 드래그해서 놓은 자리로 카드를 옮긴다. */
  const moveCardTo = useCallback(
    (cardId: string, toIndex: number) => {
      const fromIndex = visible.findIndex((item) => item.card.id === cardId);
      if (fromIndex < 0) return Promise.resolve();

      const bounded = Math.max(0, Math.min(visible.length - 1, toIndex));
      if (bounded === fromIndex) return Promise.resolve();

      const next = [...visible];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(bounded, 0, moved);
      return persist(next, hidden);
    },
    [hidden, persist, visible],
  );

  const setCardSize = useCallback(
    (cardId: string, size: DashboardCardSize) => {
      const next = visible.map((item) => (item.card.id === cardId ? { ...item, size } : item));
      return persist(next, hidden);
    },
    [hidden, persist, visible],
  );

  const toggleCardSize = useCallback(
    (cardId: string) => {
      const target = visible.find((item) => item.card.id === cardId);
      if (!target) return Promise.resolve();
      return setCardSize(cardId, target.size === 'large' ? 'small' : 'large');
    },
    [setCardSize, visible],
  );

  return {
    visible,
    hidden,
    addCard,
    removeCard,
    moveCardTo,
    setCardSize,
    toggleCardSize,
    reset: resetDashboardLayout,
  };
}
