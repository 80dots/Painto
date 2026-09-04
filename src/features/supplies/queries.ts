import { and, asc, desc, eq, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import {
  stockLogs,
  supplies,
  type NewSupply,
  type StockReason,
  type SupplyCategory,
} from '@/db/schema';

export type SupplyFilters = {
  search?: string;
  category?: SupplyCategory | null;
  onlyLowStock?: boolean;
};

function buildSupplyWhere({ search, category, onlyLowStock }: SupplyFilters) {
  const conditions: (SQL | undefined)[] = [eq(supplies.isArchived, false)];

  const keyword = search?.trim();
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(like(supplies.name, pattern), like(supplies.brand, pattern), like(supplies.spec, pattern)),
    );
  }
  if (category) conditions.push(eq(supplies.category, category));
  if (onlyLowStock) conditions.push(lte(supplies.quantity, supplies.minQuantity));

  return and(...conditions);
}

export function useSupplyList(filters: SupplyFilters = {}) {
  const { search, category, onlyLowStock } = filters;

  return useLiveQuery(
    db
      .select()
      .from(supplies)
      .where(buildSupplyWhere(filters))
      .orderBy(asc(supplies.category), asc(supplies.name)),
    [search, category, onlyLowStock],
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

export function useSupplySummary() {
  return useLiveQuery(
    db
      .select({
        total: sql<number>`count(*)`,
        lowStock: sql<number>`sum(case when ${supplies.quantity} <= ${supplies.minQuantity} then 1 else 0 end)`,
      })
      .from(supplies)
      .where(eq(supplies.isArchived, false)),
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
