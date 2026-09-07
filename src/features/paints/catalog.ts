import finishers from '@/data/paint-catalog/finishers.json';
import gaianotes from '@/data/paint-catalog/gaianotes.json';
import gsiCreos from '@/data/paint-catalog/gsi-creos.json';
import momodeling from '@/data/paint-catalog/momodeling.json';
import tamiya from '@/data/paint-catalog/tamiya.json';
import { PAINT_FINISHES, PAINT_TYPES, type PaintFinish, type PaintType } from '@/db/schema';

/**
 * 앱에 내장한 시판 도료 목록.
 *
 * 등록 화면에서 이름·품번을 몇 글자 치면 여기서 찾아 브랜드·품번·색상·용량·희석비를
 * 한 번에 채워 준다. DB 에 넣지 않고 번들에 JSON 으로 들고 다니므로
 * 마이그레이션 없이 브랜드를 추가할 수 있다.
 *
 * 새 브랜드는 `src/data/paint-catalog/<브랜드>.json` 을 같은 모양으로 만들어
 * 아래 `CATALOG_FILES` 에 넣기만 하면 된다.
 */

type CatalogFile = {
  brand: string;
  brandEn: string | null;
  /** 검색어로 받아 줄 다른 표기 (Tamiya, タミヤ …) */
  brandAliases?: string[];
  country: string | null;
  updatedAt: string;
  paints: {
    code: string | null;
    name: string;
    nameEn: string | null;
    /** 색이름의 다른 표기 (일본어명 등) */
    aliases?: string[] | null;
    line: string | null;
    /** 브랜드 목록에 쓸 굵은 구분 (타미야 아크릴 / 에나멜 …) */
    brandLine?: string | null;
    type: string;
    finish: string;
    colorHex: string | null;
    volumeMl: number | null;
    thinnerRatio: string | null;
    barcode: string | null;
  }[];
};

const CATALOG_FILES: CatalogFile[] = [momodeling, tamiya, gsiCreos, gaianotes, finishers];

export type CatalogPaint = {
  /** 목록 key. 브랜드 + 라인 + 품번 조합은 겹치지 않는다. */
  id: string;
  brand: string;
  brandEn: string | null;
  country: string | null;
  code: string | null;
  name: string;
  nameEn: string | null;
  line: string | null;
  brandLine: string | null;
  type: PaintType;
  finish: PaintFinish;
  colorHex: string | null;
  volumeMl: number | null;
  thinnerRatio: string | null;
  barcode: string | null;
  /** 검색용으로 미리 눌러 둔 문자열 */
  haystack: string;
};

/** 공백·하이픈·점을 지우고 소문자로. "XF-2" 와 "xf2" 가 같은 것으로 취급된다. */
function normalize(value: string) {
  return value.toLowerCase().replace(/[\s\-_.]/g, '');
}

const isPaintType = (value: string): value is PaintType =>
  (PAINT_TYPES as readonly string[]).includes(value);
const isPaintFinish = (value: string): value is PaintFinish =>
  (PAINT_FINISHES as readonly string[]).includes(value);

export const CATALOG_PAINTS: CatalogPaint[] = CATALOG_FILES.flatMap((file) =>
  file.paints.map((paint) => ({
    id: `${file.brand}:${paint.line ?? ''}:${paint.code ?? paint.name}`,
    brand: file.brand,
    brandEn: file.brandEn,
    country: file.country,
    code: paint.code,
    name: paint.name,
    nameEn: paint.nameEn,
    line: paint.line,
    brandLine: paint.brandLine ?? null,
    type: isPaintType(paint.type) ? paint.type : 'other',
    finish: isPaintFinish(paint.finish) ? paint.finish : 'none',
    colorHex: paint.colorHex,
    volumeMl: paint.volumeMl,
    thinnerRatio: paint.thinnerRatio,
    barcode: paint.barcode,
    haystack: normalize(
      [
        file.brand,
        file.brandEn,
        ...(file.brandAliases ?? []),
        paint.code,
        paint.name,
        paint.nameEn,
        ...(paint.aliases ?? []),
        paint.line,
        paint.barcode,
      ]
        .filter(Boolean)
        .join(' '),
    ),
  })),
);

/** 내장 카탈로그가 있는 브랜드 (브랜드를 만들 때 쓴다) */
export const CATALOG_BRANDS = CATALOG_FILES.map((file) => ({
  name: file.brand,
  country: file.country,
  updatedAt: file.updatedAt,
  count: file.paints.length,
}));

/**
 * 이름·품번으로 카탈로그를 찾는다.
 * 품번이 먼저, 그다음 이름이 앞에서부터 맞는 것, 마지막으로 포함되는 것 순으로 준다.
 */
export function searchCatalog(query: string, limit = 8): CatalogPaint[] {
  const needle = normalize(query);
  if (needle.length < 1) return [];

  const scored: { paint: CatalogPaint; score: number }[] = [];
  for (const paint of CATALOG_PAINTS) {
    const index = paint.haystack.indexOf(needle);
    if (index < 0) continue;

    const code = paint.code ? normalize(paint.code) : '';
    const name = normalize(paint.name);
    const nameEn = paint.nameEn ? normalize(paint.nameEn) : '';

    let score = 40 + Math.min(index, 20);
    if (code === needle) score = 0;
    else if (code.startsWith(needle)) score = 5;
    else if (name.startsWith(needle) || nameEn.startsWith(needle)) score = 10;
    else if (name.includes(needle) || nameEn.includes(needle)) score = 20;

    // 점수가 같으면 색을 아는 쪽을 앞에 둔다 (브랜드명만 쳤을 때 대표 색이 먼저 나온다)
    if (!paint.colorHex) score += 1;

    scored.push({ paint, score });
  }

  scored.sort((a, b) => a.score - b.score || a.paint.id.localeCompare(b.paint.id));
  return scored.slice(0, limit).map((item) => item.paint);
}

/** 스캔한 바코드가 카탈로그에 있는지 본다. */
export function findCatalogByBarcode(barcode: string): CatalogPaint | null {
  const trimmed = barcode.trim();
  if (!trimmed) return null;
  return CATALOG_PAINTS.find((paint) => paint.barcode === trimmed) ?? null;
}
