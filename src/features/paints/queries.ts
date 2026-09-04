import { and, asc, desc, eq, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import {
  brands,
  paints,
  stockLogs,
  type NewPaint,
  type PaintFinish,
  type PaintType,
  type StockReason,
} from '@/db/schema';

export type PaintSort = 'recent' | 'name' | 'brand' | 'quantity';

export type PaintFilters = {
  search?: string;
  type?: PaintType | null;
  onlyLowStock?: boolean;
  onlyFavorite?: boolean;
  sort?: PaintSort;
};

const paintListColumns = {
  id: paints.id,
  code: paints.code,
  name: paints.name,
  colorHex: paints.colorHex,
  type: paints.type,
  finish: paints.finish,
  volumeMl: paints.volumeMl,
  quantity: paints.quantity,
  remainingPct: paints.remainingPct,
  minQuantity: paints.minQuantity,
  location: paints.location,
  isFavorite: paints.isFavorite,
  brandId: paints.brandId,
  brandName: brands.name,
  brandLine: brands.line,
};

export type PaintListItem = {
  id: number;
  code: string | null;
  name: string;
  colorHex: string | null;
  type: PaintType;
  finish: PaintFinish;
  volumeMl: number | null;
  quantity: number;
  remainingPct: number;
  minQuantity: number;
  location: string | null;
  isFavorite: boolean;
  brandId: number | null;
  brandName: string | null;
  brandLine: string | null;
};

function buildPaintWhere({ search, type, onlyLowStock, onlyFavorite }: PaintFilters) {
  const conditions: (SQL | undefined)[] = [eq(paints.isArchived, false)];

  const keyword = search?.trim();
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(like(paints.name, pattern), like(paints.code, pattern), like(brands.name, pattern)),
    );
  }
  if (type) conditions.push(eq(paints.type, type));
  if (onlyLowStock) conditions.push(lte(paints.quantity, paints.minQuantity));
  if (onlyFavorite) conditions.push(eq(paints.isFavorite, true));

  return and(...conditions);
}

function paintOrderBy(sort: PaintSort = 'recent') {
  switch (sort) {
    case 'name':
      return [asc(paints.name)];
    case 'brand':
      return [asc(brands.name), asc(paints.code)];
    case 'quantity':
      return [asc(paints.quantity), asc(paints.name)];
    default:
      return [desc(paints.updatedAt)];
  }
}

/** 필터가 적용된 도료 목록 (DB 변경 시 자동 갱신) */
export function usePaintList(filters: PaintFilters = {}) {
  const { search, type, onlyLowStock, onlyFavorite, sort } = filters;

  return useLiveQuery(
    db
      .select(paintListColumns)
      .from(paints)
      .leftJoin(brands, eq(paints.brandId, brands.id))
      .where(buildPaintWhere(filters))
      .orderBy(...paintOrderBy(sort)),
    [search, type, onlyLowStock, onlyFavorite, sort],
  );
}

/** 도료 한 건 */
export function usePaint(id: number | null) {
  return useLiveQuery(
    db
      .select({ ...paintListColumns, barcode: paints.barcode, notes: paints.notes })
      .from(paints)
      .leftJoin(brands, eq(paints.brandId, brands.id))
      .where(eq(paints.id, id ?? -1))
      .limit(1),
    [id],
  );
}

/** 재고 요약 (전체 / 부족 / 품절) */
export function usePaintSummary() {
  return useLiveQuery(
    db
      .select({
        total: sql<number>`count(*)`,
        lowStock: sql<number>`sum(case when ${paints.quantity} <= ${paints.minQuantity} then 1 else 0 end)`,
        outOfStock: sql<number>`sum(case when ${paints.quantity} <= 0 then 1 else 0 end)`,
        bottles: sql<number>`coalesce(sum(${paints.quantity}), 0)`,
      })
      .from(paints)
      .where(eq(paints.isArchived, false)),
  );
}

export async function createPaint(values: NewPaint) {
  const [row] = await db
    .insert(paints)
    .values({ ...values, updatedAt: new Date() })
    .returning({ id: paints.id });

  if (values.quantity && values.quantity > 0) {
    await logStockChange(row.id, values.quantity, 'purchase', '등록');
  }
  return row.id;
}

export async function updatePaint(id: number, values: Partial<NewPaint>) {
  await db
    .update(paints)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(paints.id, id));
}

export async function deletePaint(id: number) {
  await db.delete(paints).where(eq(paints.id, id));
}

export async function toggleFavorite(id: number, next: boolean) {
  await updatePaint(id, { isFavorite: next });
}

/** 재고를 delta 만큼 증감하고 이력을 남긴다. 0 미만으로는 내려가지 않는다. */
export async function adjustPaintQuantity(
  id: number,
  delta: number,
  reason: StockReason = 'adjust',
  note?: string,
) {
  const [current] = await db
    .select({ quantity: paints.quantity })
    .from(paints)
    .where(eq(paints.id, id))
    .limit(1);
  if (!current) return;

  const next = Math.max(0, Math.round((current.quantity + delta) * 10) / 10);
  if (next === current.quantity) return;

  await db.update(paints).set({ quantity: next, updatedAt: new Date() }).where(eq(paints.id, id));
  await logStockChange(id, next - current.quantity, reason, note);
}

async function logStockChange(
  paintId: number,
  delta: number,
  reason: StockReason,
  note?: string | null,
) {
  await db.insert(stockLogs).values({
    itemType: 'paint',
    itemId: paintId,
    delta,
    reason,
    note: note ?? null,
  });
}

/** 도료 상세의 최근 입출고 이력 */
export function usePaintStockLogs(paintId: number | null, limit = 20) {
  return useLiveQuery(
    db
      .select()
      .from(stockLogs)
      .where(and(eq(stockLogs.itemType, 'paint'), eq(stockLogs.itemId, paintId ?? -1)))
      .orderBy(desc(stockLogs.createdAt))
      .limit(limit),
    [paintId, limit],
  );
}

/** 도료 등록 폼에서 쓰는 브랜드 목록 */
export function useBrandOptions() {
  return useLiveQuery(db.select().from(brands).orderBy(asc(brands.name), asc(brands.line)));
}
