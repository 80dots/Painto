import { relations, sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

/** 도료 제조사 (군제, 타미야, 바예호 …). 사용자가 직접 추가할 수 있다. */
export const brands = sqliteTable(
  'brands',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    /** 도료 라인업 이름 (Mr.COLOR, 아크리시온 …) */
    line: text('line'),
    country: text('country'),
    isBuiltIn: integer('is_built_in', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex('brands_name_line_idx').on(t.name, t.line)],
);

/** 도료 종류 */
export const PAINT_TYPES = [
  'lacquer', // 락카
  'enamel', // 에나멜
  'acrylic', // 아크릴
  'water', // 수성
  'primer', // 프라이머/서페이서
  'clear', // 클리어/탑코트
  'weathering', // 웨더링 (피그먼트, 워싱)
  'other',
] as const;
export type PaintType = (typeof PAINT_TYPES)[number];

/** 도료 마감 */
export const PAINT_FINISHES = [
  'flat', // 무광
  'semi_gloss', // 반광
  'gloss', // 유광
  'metallic', // 메탈릭
  'pearl', // 펄
  'candy', // 캔디
  'none',
] as const;
export type PaintFinish = (typeof PAINT_FINISHES)[number];

/** 보유 도료 한 종류 (= 같은 품번의 병 묶음) */
export const paints = sqliteTable(
  'paints',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    brandId: integer('brand_id').references(() => brands.id, { onDelete: 'set null' }),
    /** 품번 (H-12, XF-1, 71.003 …) */
    code: text('code'),
    name: text('name').notNull(),
    /** 목록에서 보여줄 색상 (#RRGGBB) */
    colorHex: text('color_hex'),
    type: text('type').$type<PaintType>().notNull().default('lacquer'),
    finish: text('finish').$type<PaintFinish>().notNull().default('none'),
    /** 병 용량 (ml) */
    volumeMl: real('volume_ml'),
    /** 보유 병 수 */
    quantity: real('quantity').notNull().default(0),
    /** 개봉한 병의 잔량 (%) — 대략적인 소진 상태 파악용 */
    remainingPct: integer('remaining_pct').notNull().default(100),
    /** 이 수량 이하로 떨어지면 부족으로 표시 */
    minQuantity: real('min_quantity').notNull().default(1),
    /** 희석비 "도료:신너" (1:2, 1:1.5 …) */
    thinnerRatio: text('thinner_ratio'),
    /** 보관 위치 (A박스 2번칸 …) */
    location: text('location'),
    /** 병에 붙은 바코드. 스캔으로 같은 도료를 찾아 재고를 올린다. */
    barcode: text('barcode'),
    /** 앱 문서 폴더에 복사해 둔 도료 사진 경로 */
    photoUri: text('photo_uri'),
    notes: text('notes'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    /** 단종/사용 안 함 처리 (기록은 남기되 목록에서 숨김) */
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index('paints_brand_idx').on(t.brandId),
    index('paints_name_idx').on(t.name),
    index('paints_code_idx').on(t.code),
    index('paints_barcode_idx').on(t.barcode),
  ],
);

/** 소모품 분류 */
export const SUPPLY_CATEGORIES = [
  'sandpaper', // 사포/연마
  'glue', // 접착제
  'putty', // 퍼티
  'masking', // 마스킹
  'airbrush', // 에어브러시 소모품
  'brush', // 붓
  'decal', // 데칼/마크세터
  'thinner', // 신너/용제
  'tool', // 공구
  'etc',
] as const;
export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number];

/** 도료 외 소모품 재고 */
export const supplies = sqliteTable(
  'supplies',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    category: text('category').$type<SupplyCategory>().notNull().default('etc'),
    brand: text('brand'),
    /** 규격 (#400, 3mm, 0.3mm 노즐 …) */
    spec: text('spec'),
    quantity: real('quantity').notNull().default(0),
    /** 단위 (개, m, ml, 장 …) */
    unit: text('unit').notNull().default('개'),
    minQuantity: real('min_quantity').notNull().default(1),
    location: text('location'),
    barcode: text('barcode'),
    photoUri: text('photo_uri'),
    notes: text('notes'),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [index('supplies_category_idx').on(t.category), index('supplies_name_idx').on(t.name)],
);

/** 제작 상태 */
export const PROJECT_STATUSES = [
  'planned', // 적프라 (계획)
  'building', // 조립 중
  'painting', // 도색 중
  'finishing', // 마감/데칼
  'done', // 완성
  'shelved', // 보류
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** 제작 중인 킷 */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  /** 킷 제조사 (반다이, 타미야 …) */
  maker: text('maker'),
  /** 스케일 (1/144, 1/35 …) */
  scale: text('scale'),
  status: text('status').$type<ProjectStatus>().notNull().default('planned'),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
  coverUri: text('cover_uri'),
  notes: text('notes'),
  ...timestamps,
});

/** 킷별 사용 도료 팔레트 (레시피) */
export const projectPaints = sqliteTable(
  'project_paints',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    paintId: integer('paint_id')
      .notNull()
      .references(() => paints.id, { onDelete: 'cascade' }),
    /** 적용 부위 (동체, 캐노피 프레임 …) */
    part: text('part'),
    /** 조색비 메모 (본색 8 : 화이트 2 …) */
    mixRatio: text('mix_ratio'),
    notes: text('notes'),
    ...timestamps,
  },
  (t) => [uniqueIndex('project_paints_uniq_idx').on(t.projectId, t.paintId, t.part)],
);

/** 재고 변동 사유 */
export const STOCK_REASONS = [
  'purchase', // 구매
  'use', // 사용
  'adjust', // 재고 조정
  'discard', // 폐기/굳음
  'gift', // 나눔
] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

/** 재고 입·출고 이력 */
export const stockLogs = sqliteTable(
  'stock_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    itemType: text('item_type').$type<'paint' | 'supply'>().notNull(),
    itemId: integer('item_id').notNull(),
    /** 증감량 (+구매 / -사용) */
    delta: real('delta').notNull(),
    reason: text('reason').$type<StockReason>().notNull().default('adjust'),
    /** 관련 프로젝트 (도색에 썼다면) */
    projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('stock_logs_item_idx').on(t.itemType, t.itemId, t.createdAt)],
);

/** 구매 예정 목록 */
export const shoppingItems = sqliteTable('shopping_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemType: text('item_type').$type<'paint' | 'supply'>().notNull().default('paint'),
  /** 이미 등록된 품목에서 담았다면 연결 */
  refId: integer('ref_id'),
  name: text('name').notNull(),
  brand: text('brand'),
  code: text('code'),
  quantity: real('quantity').notNull().default(1),
  memo: text('memo'),
  isPurchased: integer('is_purchased', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
});

/**
 * 대시보드에 어떤 카드를 어떤 순서로 보여줄지에 대한 사용자 설정.
 * 카드의 내용 자체는 코드(src/features/dashboard/registry.tsx)에 있고,
 * 이 테이블은 표시 여부와 순서만 저장한다. 행이 없는 카드는 기본값을 따른다.
 */
export const dashboardCards = sqliteTable('dashboard_cards', {
  /** registry 에 정의된 카드 식별자 */
  cardId: text('card_id').primaryKey(),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  paints: many(paints),
}));

export const paintsRelations = relations(paints, ({ one, many }) => ({
  brand: one(brands, { fields: [paints.brandId], references: [brands.id] }),
  projectPaints: many(projectPaints),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectPaints: many(projectPaints),
}));

export const projectPaintsRelations = relations(projectPaints, ({ one }) => ({
  project: one(projects, { fields: [projectPaints.projectId], references: [projects.id] }),
  paint: one(paints, { fields: [projectPaints.paintId], references: [paints.id] }),
}));

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Paint = typeof paints.$inferSelect;
export type NewPaint = typeof paints.$inferInsert;
export type Supply = typeof supplies.$inferSelect;
export type NewSupply = typeof supplies.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectPaint = typeof projectPaints.$inferSelect;
export type StockLog = typeof stockLogs.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type DashboardCardSetting = typeof dashboardCards.$inferSelect;
