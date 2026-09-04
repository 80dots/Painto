import { and, asc, desc, eq, like, lte, ne, or, sql, type SQL } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import {
  stockLogs,
  supplies,
  type NewSupply,
  type StockReason,
  type SupplyCategory,
} from '@/db/schema';

/** 마스킹 테이프는 폭 단위로 관리해야 해서 별도 화면으로 분리돼 있다. */
export const MASKING_CATEGORY: SupplyCategory = 'masking';

export type SupplyFilters = {
  search?: string;
  category?: SupplyCategory | null;
  onlyLowStock?: boolean;
  /** 이 분류만 본다 (마스킹 테이프 화면) */
  onlyCategory?: SupplyCategory | null;
  /** 이 분류는 뺀다 (모델링 용품 화면에서 마스킹 제외) */
  excludeCategory?: SupplyCategory | null;
};

function buildSupplyWhere({
  search,
  category,
  onlyLowStock,
  onlyCategory,
  excludeCategory,
}: SupplyFilters) {
  const conditions: (SQL | undefined)[] = [eq(supplies.isArchived, false)];

  const keyword = search?.trim();
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(like(supplies.name, pattern), like(supplies.brand, pattern), like(supplies.spec, pattern)),
    );
  }
  if (category) conditions.push(eq(supplies.category, category));
  if (onlyCategory) conditions.push(eq(supplies.category, onlyCategory));
  if (excludeCategory) conditions.push(ne(supplies.category, excludeCategory));
  if (onlyLowStock) conditions.push(lte(supplies.quantity, supplies.minQuantity));

  return and(...conditions);
}

export function useSupplyList(filters: SupplyFilters = {}) {
  const { search, category, onlyLowStock, onlyCategory, excludeCategory } = filters;

  return useLiveQuery(
    db
      .select()
      .from(supplies)
      .where(buildSupplyWhere(filters))
      .orderBy(asc(supplies.category), asc(supplies.name)),
    [search, category, onlyLowStock, onlyCategory, excludeCategory],
  );
}

/** 마스킹 테이프 목록 — 폭이 좁은 것부터 */
export function useMaskingTapes(search?: string) {
  return useLiveQuery(
    db
      .select()
      .from(supplies)
      .where(buildSupplyWhere({ search, onlyCategory: MASKING_CATEGORY }))
      .orderBy(asc(supplies.widthMm), asc(supplies.name)),
    [search],
  );
}

export function useSupply(id: number | null) {
  return useLiveQuery(
    db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id ?? -1))
      .limit(1),
    [id],
  );
}

/**
 * 소모품 재고 요약.
 * scope: 'all' 전체 / 'masking' 마스킹 테이프만 / 'others' 마스킹 제외
 */
export function useSupplySummary(scope: 'all' | 'masking' | 'others' = 'all') {
  const scopeCondition =
    scope === 'masking'
      ? eq(supplies.category, MASKING_CATEGORY)
      : scope === 'others'
        ? ne(supplies.category, MASKING_CATEGORY)
        : undefined;

  return useLiveQuery(
    db
      .select({
        total: sql<number>`count(*)`,
        lowStock: sql<number>`sum(case when ${supplies.quantity} <= ${supplies.minQuantity} then 1 else 0 end)`,
        units: sql<number>`coalesce(sum(${supplies.quantity}), 0)`,
      })
      .from(supplies)
      .where(and(eq(supplies.isArchived, false), scopeCondition)),
    [scope],
  );
}

export async function createSupply(values: NewSupply) {
  const [row] = await db
    .insert(supplies)
    .values({ ...values, updatedAt: new Date() })
    .returning({ id: supplies.id });
  return row.id;
}

export async function updateSupply(id: number, values: Partial<NewSupply>) {
  await db
    .update(supplies)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(supplies.id, id));
}

export async function deleteSupply(id: number) {
  await db.delete(supplies).where(eq(supplies.id, id));
}

export async function adjustSupplyQuantity(
  id: number,
  delta: number,
  reason: StockReason = 'adjust',
  note?: string,
) {
  const [current] = await db
    .select({ quantity: supplies.quantity })
    .from(supplies)
    .where(eq(supplies.id, id))
    .limit(1);
  if (!current) return;

  const next = Math.max(0, Math.round((current.quantity + delta) * 10) / 10);
  if (next === current.quantity) return;

  await db
    .update(supplies)
    .set({ quantity: next, updatedAt: new Date() })
    .where(eq(supplies.id, id));

  await db.insert(stockLogs).values({
    itemType: 'supply',
    itemId: id,
    delta: next - current.quantity,
    reason,
    note: note ?? null,
  });
}

export function useSupplyStockLogs(supplyId: number | null, limit = 20) {
  return useLiveQuery(
    db
      .select()
      .from(stockLogs)
      .where(and(eq(stockLogs.itemType, 'supply'), eq(stockLogs.itemId, supplyId ?? -1)))
      .orderBy(desc(stockLogs.createdAt))
      .limit(limit),
    [supplyId, limit],
  );
}
