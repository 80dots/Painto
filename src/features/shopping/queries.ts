import { and, asc, eq, lte } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { brands, paints, shoppingItems, supplies, type ShoppingItem } from '@/db/schema';

export function useShoppingList() {
  return useLiveQuery(
    db
      .select()
      .from(shoppingItems)
      .orderBy(asc(shoppingItems.isPurchased), asc(shoppingItems.createdAt)),
  );
}

export async function addShoppingItem(values: {
  name: string;
  itemType?: 'paint' | 'supply';
  brand?: string | null;
  code?: string | null;
  quantity?: number;
  memo?: string | null;
  refId?: number | null;
}) {
  await db.insert(shoppingItems).values({
    itemType: values.itemType ?? 'paint',
    name: values.name,
    brand: values.brand ?? null,
    code: values.code ?? null,
    quantity: values.quantity ?? 1,
    memo: values.memo ?? null,
    refId: values.refId ?? null,
    updatedAt: new Date(),
  });
}

export async function toggleShoppingItem(item: ShoppingItem) {
  await db
    .update(shoppingItems)
    .set({ isPurchased: !item.isPurchased, updatedAt: new Date() })
    .where(eq(shoppingItems.id, item.id));
}

export async function deleteShoppingItem(id: number) {
  await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
}

export async function clearPurchasedItems() {
  await db.delete(shoppingItems).where(eq(shoppingItems.isPurchased, true));
}

/**
 * 재고가 기준치 이하인 도료·소모품을 구매 목록에 한 번에 담는다.
 * 이미 담겨 있는(구매 전) 항목은 건너뛴다.
 */
export async function addLowStockToShoppingList() {
  const existing = await db
    .select()
    .from(shoppingItems)
    .where(eq(shoppingItems.isPurchased, false));
  const alreadyQueued = new Set(existing.map((item) => `${item.itemType}:${item.refId}`));

  const lowPaints = await db
    .select({
      id: paints.id,
      name: paints.name,
      code: paints.code,
      brandName: brands.name,
    })
    .from(paints)
    .leftJoin(brands, eq(paints.brandId, brands.id))
    .where(and(eq(paints.isArchived, false), lte(paints.quantity, paints.minQuantity)));

  const lowSupplies = await db
    .select({ id: supplies.id, name: supplies.name, brand: supplies.brand })
    .from(supplies)
    .where(and(eq(supplies.isArchived, false), lte(supplies.quantity, supplies.minQuantity)));

  const rows = [
    ...lowPaints
      .filter((p) => !alreadyQueued.has(`paint:${p.id}`))
      .map((p) => ({
        itemType: 'paint' as const,
        refId: p.id,
        name: p.name,
        brand: p.brandName,
        code: p.code,
        quantity: 1,
        updatedAt: new Date(),
      })),
    ...lowSupplies
      .filter((s) => !alreadyQueued.has(`supply:${s.id}`))
      .map((s) => ({
        itemType: 'supply' as const,
        refId: s.id,
        name: s.name,
        brand: s.brand,
        quantity: 1,
        updatedAt: new Date(),
      })),
  ];

  if (rows.length > 0) {
    await db.insert(shoppingItems).values(rows);
  }
  return rows.length;
}
