import { asc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { dashboardCards, type DashboardCardSize } from '@/db/schema';

export type DashboardCardState = {
  cardId: string;
  isVisible: boolean;
  sortOrder: number;
  size: DashboardCardSize;
};

/** 카드 표시 여부·순서·크기에 대한 사용자 설정. 행이 없는 카드는 registry 기본값을 따른다. */
export function useDashboardSettings() {
  return useLiveQuery(db.select().from(dashboardCards).orderBy(asc(dashboardCards.sortOrder)));
}

/** 카드 배치를 통째로 저장한다 (표시 중인 카드 + 숨긴 카드 모두). */
export async function saveDashboardLayout(states: DashboardCardState[]) {
  const now = new Date();

  for (const state of states) {
    await db
      .insert(dashboardCards)
      .values({ ...state, updatedAt: now })
      .onConflictDoUpdate({
        target: dashboardCards.cardId,
        set: {
          isVisible: state.isVisible,
          sortOrder: state.sortOrder,
          size: state.size,
          updatedAt: now,
        },
      });
  }
}

/** 대시보드를 기본 배치로 되돌린다. */
export async function resetDashboardLayout() {
  await db.delete(dashboardCards);
}
