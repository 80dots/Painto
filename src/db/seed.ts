import { eq, inArray } from 'drizzle-orm';

import { db } from './client';

import { CATALOG_BRANDS } from '@/features/paints/catalog';
import {
  brands,
  paints,
  projectPaints,
  projects,
  shoppingItems,
  stockLogs,
  supplies,
  type NewBrand,
} from './schema';

/** 브랜드 한 줄(이름 + 계열)을 가리키는 열쇠. */
const brandKey = (name: string, line?: string | null) => JSON.stringify([name, line ?? null]);

/**
 * 기본 브랜드 목록을 내장 도료 카탈로그에 맞춘다. 앱을 켤 때마다 돈다.
 *
 * - 카탈로그에 있는 브랜드가 아직 없으면 만든다.
 * - 카탈로그가 없는 기본 브랜드는 지운다. 골라 봐야 채워 줄 도료 목록이 없다.
 *   붙어 있던 도료는 `paints.brand_id` 가 NULL 이 되어 "브랜드 없음"으로 남는다.
 */
export async function syncBuiltInBrands() {
  const rows = await db.select().from(brands);
  const wanted = new Map(CATALOG_BRANDS.map((brand) => [brandKey(brand.name, brand.line), brand]));

  const missing: NewBrand[] = [];
  for (const [key, brand] of wanted) {
    if (rows.some((row) => brandKey(row.name, row.line) === key)) continue;
    missing.push({ name: brand.name, line: brand.line, country: brand.country, isBuiltIn: true });
  }
  if (missing.length > 0) {
    await db.insert(brands).values(missing);
  }

  const stale = rows
    .filter((row) => row.isBuiltIn && !wanted.has(brandKey(row.name, row.line)))
    .map((row) => row.id);
  if (stale.length > 0) {
    await db.delete(brands).where(inArray(brands.id, stale));
  }
}

/** 설정 화면에서 넣는 예시 데이터 (기능 확인용) */
export async function insertSampleData() {
  const brandRows = await db.select().from(brands);
  const findBrand = (name: string, line?: string | null) =>
    brandRows.find((b) => b.name === name && b.line === (line ?? null))?.id ?? null;

  const mrColor = findBrand('GSI Creos', 'Mr.COLOR');
  const tamiya = findBrand('타미야');
  const momodeling = findBrand('모모델링');

  const insertedPaints = await db
    .insert(paints)
    .values([
      {
        brandId: mrColor,
        code: 'C-1',
        name: '화이트',
        colorHex: '#FFFFFF',
        type: 'lacquer',
        finish: 'gloss',
        volumeMl: 10,
        quantity: 2,
        minQuantity: 1,
        location: 'A박스 1칸',
      },
      {
        brandId: mrColor,
        code: 'C-2',
        name: '블랙',
        colorHex: '#1A1A1A',
        type: 'lacquer',
        finish: 'gloss',
        volumeMl: 10,
        quantity: 1,
        minQuantity: 1,
        location: 'A박스 1칸',
      },
      {
        brandId: mrColor,
        code: 'C-333',
        name: '엑스트라 다크 씨 그레이',
        colorHex: '#3C4650',
        type: 'lacquer',
        finish: 'semi_gloss',
        volumeMl: 10,
        quantity: 0,
        minQuantity: 1,
        location: 'A박스 2칸',
      },
      {
        brandId: tamiya,
        code: 'XF-1',
        name: '플랫 블랙',
        colorHex: '#22201F',
        type: 'enamel',
        finish: 'flat',
        volumeMl: 10,
        quantity: 3,
        minQuantity: 1,
        location: '에나멜 박스',
        notes: '먹선용',
      },
      {
        brandId: momodeling,
        code: 'BC-002',
        name: '퓨어레드',
        colorHex: '#D51F2A',
        type: 'lacquer',
        finish: 'gloss',
        volumeMl: 30,
        quantity: 1,
        minQuantity: 1,
        location: 'B박스',
      },
    ])
    .returning({ id: paints.id });

  await db.insert(supplies).values([
    {
      name: '스틱 사포',
      category: 'sandpaper',
      brand: '고드핸드',
      spec: '#400',
      quantity: 4,
      unit: '장',
      minQuantity: 2,
      location: '공구함',
    },
    {
      name: '무수지 접착제',
      category: 'glue',
      brand: '타미야',
      spec: '유동성',
      quantity: 1,
      unit: '병',
      minQuantity: 1,
      location: '공구함',
    },
    {
      name: '마스킹 테이프 6mm',
      category: 'masking',
      brand: '타미야',
      spec: '길이 18m',
      widthMm: 6,
      quantity: 0,
      unit: '롤',
      minQuantity: 1,
      location: '도색 부스',
    },
    {
      name: '마스킹 테이프 10mm',
      category: 'masking',
      brand: '타미야',
      spec: '길이 18m',
      widthMm: 10,
      quantity: 2,
      unit: '롤',
      minQuantity: 1,
      location: '도색 부스',
    },
    {
      name: '마스킹 테이프 18mm',
      category: 'masking',
      brand: '3M',
      spec: '길이 18m',
      widthMm: 18,
      quantity: 1,
      unit: '롤',
      minQuantity: 1,
      location: '도색 부스',
    },
    {
      name: '에폭시 퍼티',
      category: 'putty',
      brand: '타미야',
      spec: '고속경화',
      quantity: 1,
      unit: '개',
      minQuantity: 1,
      location: '공구함',
    },
    {
      name: '락카 신너',
      category: 'thinner',
      brand: 'GSI Creos',
      spec: '레벨링 400ml',
      quantity: 1,
      unit: '병',
      minQuantity: 1,
      location: '도색 부스',
    },
  ]);

  const [project] = await db
    .insert(projects)
    .values({
      name: 'RG 사자비',
      maker: '반다이',
      scale: '1/144',
      status: 'painting',
      quantity: 1,
      price: 42000,
      location: '작업대',
      purchasedAt: new Date(),
      startedAt: new Date(),
      notes: '전체 도색 + 데칼',
    })
    .returning({ id: projects.id });

  await db.insert(projects).values([
    {
      name: 'MG 건담 Ver.Ka',
      maker: '반다이',
      scale: 'MG 1/100',
      status: 'unbuilt',
      quantity: 1,
      price: 68000,
      location: '창고 3번 선반',
      purchasedAt: new Date(),
    },
    {
      name: '타미야 1/35 티거 I',
      maker: '타미야',
      scale: '1/35',
      status: 'unbuilt',
      quantity: 2,
      price: 35000,
      location: '창고 2번 선반',
    },
  ]);

  if (project && insertedPaints.length > 0) {
    await db.insert(projectPaints).values([
      { projectId: project.id, paintId: insertedPaints[0].id, part: '내부 프레임 하도' },
      {
        projectId: project.id,
        paintId: insertedPaints[3].id,
        part: '먹선',
        mixRatio: '블랙 7 : 브라운 3',
      },
    ]);
  }
}

/** 모든 사용자 데이터 삭제 (기본 브랜드는 다시 채운다) */
export async function resetAllData() {
  await db.delete(projectPaints);
  await db.delete(stockLogs);
  await db.delete(shoppingItems);
  await db.delete(projects);
  await db.delete(paints);
  await db.delete(supplies);
  await db.delete(brands).where(eq(brands.isBuiltIn, false));
}
