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
표시 여부·순서는 `dashboard_cards` 테이블에 저장되므로 `id` 는 한 번 정하면 바꾸지 않는다.

## 도메인 구분

- 마스킹 테이프와 모델링 용품은 같은 `supplies` 테이블을 쓰고 `category` 로 나눈다.
  마스킹은 `category = 'masking'` + `widthMm`, 화면은 `/masking`.
  나머지 용품 목록(`/supplies`)은 항상 `excludeCategory: MASKING_CATEGORY` 로 조회한다.
- `projects` 는 "제작 중인 킷"이 아니라 **보유 프라모델 전체**다.
  기본 상태는 `unbuilt`(미조립)이고, 조립~마감 상태는 `IN_PROGRESS_STATUSES` 로 판별한다.

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
