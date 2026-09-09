# Painto 작업 규칙

프라모델 도료·소모품 재고 관리 앱. Android 우선, 같은 코드로 iOS 배포.
Expo SDK 57 / React Native 0.86 / expo-router / NativeWind 4 / expo-sqlite + Drizzle.

Expo API 는 버전마다 달라진다. 코드를 쓰기 전에
https://docs.expo.dev/versions/v57.0.0/ 의 해당 버전 문서를 확인할 것.

## 코드 규칙

- 스타일은 `className`(NativeWind) 으로. `StyleSheet.create` 는 동적 색상 등 불가피할 때만.
- 색상은 `bg-background`, `text-muted-foreground` 같은 토큰만 사용한다.
  토큰 정의는 `src/global.css`(CSS 변수) + `tailwind.config.js`,
  JS 에서 필요한 같은 값은 `src/constants/theme.ts` 에 있다. 두 곳을 함께 고친다.
- 데이터 접근은 화면에서 직접 하지 않고 `src/features/<도메인>/queries.ts` 를 거친다.
  목록 조회는 `useLiveQuery` 를 써서 DB 변경 시 자동 갱신되게 한다.
- 사용자에게 보이는 문자열은 한국어. enum → 한글 라벨 매핑은 `src/lib/labels.ts`.
- 새 화면은 `src/app/` 아래 파일로 만들고, 스택 화면이면 `src/app/_layout.tsx` 에 등록한다.
- 추가/편집 화면은 `[id].tsx` 하나로 처리한다 (`id === 'new'` 면 추가 모드).

## 대시보드 카드

첫 화면은 카드 목록이다. 새 기능을 만들면
`src/features/dashboard/registry.tsx` 의 `DASHBOARD_CARDS` 에 항목을 추가한다.
카드 본문 컴포넌트는 `Card` 컨테이너 없이 내용만 그린다 (껍데기는 `CardShell` 담당).
표시 여부·순서·크기는 `dashboard_cards` 테이블에 저장되므로 `id` 는 한 번 정하면 바꾸지 않는다.
카드 본문은 `size`('large' | 'small')를 받아 작은 카드에서는 요약만 그린다.

**드래그 중에는 절대 React 상태를 바꾸지 않는다.** GestureDetector 안쪽이 다시 렌더되면
카드가 네비게이션 컨텍스트를 잃고 "Couldn't find a navigation context" 로 깨진다.
들린 카드의 위치와 드롭 위치 표시는 Reanimated 공유값으로만 처리하고,
순서 변경·편집 모드 전환은 손가락을 뗀 뒤(onEnd)에 한다.

## 도메인 구분

- 마스킹 테이프와 모델링 용품은 같은 `supplies` 테이블을 쓰고 `category` 로 나눈다.
  마스킹은 `category = 'masking'` + `widthMm`, 화면은 `/masking`.
  나머지 용품 목록(`/supplies`)은 항상 `excludeCategory: MASKING_CATEGORY` 로 조회한다.
- `projects` 는 "제작 중인 킷"이 아니라 **보유 프라모델 전체**다.
  기본 상태는 `unbuilt`(미조립)이고, 조립~마감 상태는 `IN_PROGRESS_STATUSES` 로 판별한다.

## 내장 도료 카탈로그

`src/data/paint-catalog/<브랜드>.json` 에 시판 도료 목록을 넣어 두고,
등록 화면에서 이름·품번을 치면 `src/features/paints/catalog.ts` 가 찾아
브랜드·품번·종류·광택·용량·색상·희석비를 한 번에 채운다.

- DB 가 아니라 번들에 들고 다닌다. 브랜드를 추가해도 마이그레이션이 필요 없다.
- 새 브랜드는 같은 모양의 JSON 을 만들고 `catalog.ts` 의 `CATALOG_FILES` 에 넣는다.
- `type` / `finish` 값은 `src/db/schema.ts` 의 `PAINT_TYPES` / `PAINT_FINISHES` 와 같아야 한다.
  (틀린 값은 `other` / `none` 으로 떨어진다.)
- 브랜드는 저장할 때 `ensureBrand()` 로 만들어 붙이므로 `brands` 테이블에 미리 없어도 된다.
  같은 품번이 계열마다 있는 브랜드(타미야 X-1 은 아크릴에도 에나멜에도 있다)는
  `brandLine` 으로 갈라 둔다. 그 값이 `brands.line` 이 된다.
- **브랜드 목록은 카탈로그가 있는 브랜드만 보여 준다.** 목록은 손으로 적지 않고
  `CATALOG_BRANDS`(카탈로그의 브랜드 × `brandLine`)에서 뽑는다.
  앱을 켤 때 `syncBuiltInBrands()` 가 빠진 건 만들고, 카탈로그가 없어진 기본
  브랜드는 지운다. 단 그 브랜드에 등록된 도료가 있으면 남긴다.
- 카탈로그 적용은 동기 함수(`fillFromCatalog`)로 둔다. 드래그 규칙과 같은 이유로
  이펙트 안에서 상태를 바꾸지 않으려고, 브랜드 만들기는 저장 시점으로 미룬다.
- `colorHex` 는 근사값이다. 정확한 값이 아니라는 걸 전제로 쓴다.
  JSON 에는 무색 클리어에 흰색을 넣지 말고 비워 둔다 (`null`).
  등록 화면에서 색을 모를 때 채우는 기본값은 `DEFAULT_COLOR_HEX`(흰색)이며,
  이건 폼 쪽 기본값이지 데이터가 아니다.
- `photoUrl` 은 판매처 제품 사진 주소다. 고르면 바로 미리보기로 쓰고,
  저장할 때 `downloadPhoto()` 로 받아 앱 문서 폴더에 넣는다. 번들에 넣지 않는다.
- 카탈로그 값을 얹을 때 **빈 항목은 이전 값을 물려받지 않고 빈칸으로 둔다.**
  앞서 고른 도료의 값이 남으면 엉뚱한 정보로 저장된다. 직접 찍은 바코드만 예외다.
- 바코드를 아는 항목은 스캔만으로 등록 화면이 채워진다 (`findCatalogByBarcode`).
  값이 없으면 `null` 로 두고 사용자가 스캔해 채우게 한다.

## 스키마 변경

`src/db/schema.ts` 수정 → `npm run db:generate` → 생성된 `drizzle/*.sql` 커밋.
마이그레이션은 앱 시작 시 `src/db/provider.tsx` 가 적용한다.

**생성된 SQL 은 반드시 눈으로 확인한다.** 기존 테이블을 다시 만드는 마이그레이션에서
drizzle 이 `INSERT ... SELECT` 에 새 칼럼까지 넣어 버리는 경우가 있는데,
그대로 두면 기기에서 "no such column" 으로 실패한다. 새 칼럼 자리는 기본값으로 바꿔 준다.

## 크로스 플랫폼

- Android 전용 패키지를 넣지 않는다. Expo SDK 지원 여부를 먼저 확인한다.
- 안전영역은 `Screen` 컴포넌트로만 처리한다.
- 변경 후 두 플랫폼 모두 번들되는지 확인:
  `npx expo export --platform android` / `--platform ios`

## 확인 명령

```bash
npm run typecheck
npm run lint
```
