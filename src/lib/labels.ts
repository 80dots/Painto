import type {
  PaintFinish,
  PaintType,
  ProjectStatus,
  StockReason,
  SupplyCategory,
} from '@/db/schema';

export const PAINT_TYPE_LABELS: Record<PaintType, string> = {
  lacquer: '락카',
  enamel: '에나멜',
  acrylic: '아크릴',
  water: '수성',
  primer: '프라이머',
  clear: '클리어',
  weathering: '웨더링',
  other: '기타',
};

export const PAINT_FINISH_LABELS: Record<PaintFinish, string> = {
  flat: '무광',
  semi_gloss: '반광',
  gloss: '유광',
  metallic: '메탈릭',
  pearl: '펄',
  candy: '캔디',
  none: '지정 안 함',
};

export const SUPPLY_CATEGORY_LABELS: Record<SupplyCategory, string> = {
  sandpaper: '사포·연마',
  glue: '접착제',
  putty: '퍼티',
  masking: '마스킹',
  airbrush: '에어브러시',
  brush: '붓',
  decal: '데칼',
  thinner: '신너·용제',
  tool: '공구',
  etc: '기타',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  unbuilt: '미조립',
  building: '조립 중',
  painting: '도색 중',
  finishing: '마감 중',
  done: '완성',
  shelved: '보류',
  planned: '구입 예정',
};

/** 마스킹 테이프에서 자주 쓰는 폭(mm) */
export const MASKING_WIDTH_PRESETS = [1, 2, 3, 5, 6, 10, 12, 15, 18, 20, 40] as const;

export const STOCK_REASON_LABELS: Record<StockReason, string> = {
  purchase: '구매',
  use: '사용',
  adjust: '재고 조정',
  discard: '폐기',
  gift: '나눔',
};

export const SUPPLY_UNITS = ['개', '병', 'ml', 'g', 'm', '장', '롤', 'set'] as const;
