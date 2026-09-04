import { count, eq } from 'drizzle-orm';

import { db } from './client';
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

/** 앱 최초 실행 시 채워 넣는 기본 도료 제조사 목록 */
const BUILT_IN_BRANDS: NewBrand[] = [
  { name: 'GSI Creos', line: 'Mr.COLOR', country: 'JP', isBuiltIn: true },
  { name: 'GSI Creos', line: '수성 호비컬러', country: 'JP', isBuiltIn: true },
  { name: 'GSI Creos', line: '아크리시온', country: 'JP', isBuiltIn: true },
  { name: '타미야', line: '락카', country: 'JP', isBuiltIn: true },
  { name: '타미야', line: '아크릴', country: 'JP', isBuiltIn: true },
  { name: '타미야', line: '에나멜', country: 'JP', isBuiltIn: true },
  { name: 'Vallejo', line: 'Model Color', country: 'ES', isBuiltIn: true },
  { name: 'Vallejo', line: 'Model Air', country: 'ES', isBuiltIn: true },
  { name: 'AK Interactive', line: 'Real Colors', country: 'ES', isBuiltIn: true },
  { name: 'AK Interactive', line: '3rd Generation', country: 'ES', isBuiltIn: true },
  { name: 'AMMO by Mig', line: 'Acrylic', country: 'ES', isBuiltIn: true },
  { name: 'Citadel', line: 'Base', country: 'UK', isBuiltIn: true },
  { name: 'Citadel', line: 'Layer', country: 'UK', isBuiltIn: true },
  { name: 'Mr.Paint', line: 'MRP', country: 'SK', isBuiltIn: true },
  { name: 'Hataka', line: 'Red Line', country: 'PL', isBuiltIn: true },
];

/** 기본 브랜드를 한 번만 채운다. 이미 있으면 아무것도 하지 않는다. */
export async function seedBuiltInBrands() {
  const [{ value }] = await db.select({ value: count() }).from(brands);
  if (value > 0) return;
  await db.insert(brands).values(BUILT_IN_BRANDS);
}

/** 설정 화면에서 넣는 예시 데이터 (기능 확인용) */
export async function insertSampleData() {
  const brandRows = await db.select().from(brands);
  const findBrand = (name: string, line: string) =>
    brandRows.find((b) => b.name === name && b.line === line)?.id ?? null;

  const mrColor = findBrand('GSI Creos', 'Mr.COLOR');
  const tamiyaEnamel = findBrand('타미야', '에나멜');
  const vallejoAir = findBrand('Vallejo', 'Model Air');

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
        brandId: tamiyaEnamel,
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
        brandId: vallejoAir,
        code: '71.003',
        name: 'Red RLM23',
        colorHex: '#A32B26',
        type: 'acrylic',
        finish: 'flat',
        volumeMl: 17,
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
