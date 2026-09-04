# Painto

프라모델 애호가를 위한 **작업실 재고 관리** 앱입니다.
도료, 프라모델(킷), 마스킹 테이프, 모델링 용품을 한 화면에서 관리합니다.
안드로이드를 먼저 배포하고, 같은 코드로 iOS 까지 배포하는 것을 전제로 구성했습니다.

## 기술 스택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 앱 프레임워크 | Expo SDK 57 (React Native 0.86) | 하나의 코드로 Android·iOS 동시 대응, Windows 에서도 EAS 로 iOS 빌드 가능 |
| 언어 | TypeScript | |
| 라우팅 | expo-router (파일 기반) | 딥링크·타입 안전 라우트 기본 제공 |
| 스타일 | NativeWind 4 (Tailwind CSS 3) | shadcn 과 같은 CSS 변수 토큰 방식, 라이트/다크 테마 자동 대응 |
| 아이콘 | lucide-react-native | |
| 로컬 DB | expo-sqlite + Drizzle ORM | 오프라인 우선. 도색장에서 인터넷 없이도 재고 확인 |
| 마이그레이션 | drizzle-kit | 스키마 변경 이력을 SQL 로 관리 |

서버·계정 기능은 아직 없습니다. 모든 데이터는 기기 내 SQLite(`painto.db`)에만 저장됩니다.

## 실행

```bash
npm install
npm start          # QR 코드 → Expo Go 앱으로 열기
npm run android    # 연결된 안드로이드 기기/에뮬레이터로 실행
```

쓰는 네이티브 모듈(expo-sqlite, expo-camera, expo-image-picker, react-native-svg)이
모두 Expo Go 에 포함되어 있어 개발 단계에서는 별도 네이티브 빌드 없이
Expo Go 만으로 바코드 스캔까지 확인할 수 있습니다. (에뮬레이터에서는 카메라가
제한적이므로 바코드 스캔은 실기기에서 확인하세요.)

## 폴더 구조

```
src/
  app/                    expo-router 라우트 (파일 = 화면)
    (tabs)/index.tsx      대시보드 (첫 화면)
    (tabs)/paints.tsx     도료 목록
    (tabs)/settings.tsx   설정
    paint/[id].tsx        도료 등록/편집 (id 가 'new' 면 등록)
    paint/scan.tsx        바코드 스캔
    supply/[id].tsx       용품·마스킹 테이프 추가/편집
    project/[id].tsx      프라모델 편집 + 사용 도료 팔레트
    projects.tsx          프라모델 목록 (대시보드 카드에서 진입)
    masking.tsx           마스킹 테이프 목록 (폭별)
    supplies.tsx          모델링 용품 목록 (마스킹 제외)
    shopping.tsx          구매 목록
  components/ui/          Button, Card, Input, Badge 등 공용 UI
  db/
    schema.ts             Drizzle 스키마 (테이블 정의의 유일한 출처)
    client.ts             SQLite 핸들 + drizzle 인스턴스
    provider.tsx          앱 시작 시 마이그레이션·기본 데이터 적용
    seed.ts               기본 브랜드 목록, 샘플 데이터
  features/dashboard/     카드 registry + 카드별 컴포넌트 + 배치 저장
  features/<도메인>/       queries.ts(데이터 접근) + components/
  lib/                    labels(한글 라벨), utils, photos(사진 저장)
drizzle/                  생성된 마이그레이션 SQL (커밋 대상)
```

## 대시보드 카드

첫 화면은 카드로 구성되고, 사용자가 카드를 추가·삭제·정렬할 수 있습니다.

- 카드 정의는 `src/features/dashboard/registry.tsx` 의 `DASHBOARD_CARDS` 배열 하나뿐입니다.
  **새 기능을 만들면 이 배열에 항목을 추가**하면 대시보드에 바로 나타납니다.
- 표시 여부·순서·크기는 `dashboard_cards` 테이블에 저장됩니다. 설정이 없는 카드는
  registry 의 `defaultVisible` / `defaultOrder` / `defaultSize` 를 따릅니다.
- **카드 크기**: `large` 는 한 줄 전체, `small` 은 화면 너비의 절반이라 한 줄에 두 개가 들어갑니다.
  카드 본문은 `size` 를 받아 작은 카드에서는 핵심 수치만 그립니다.
- **카드를 길게 누르면** 카드가 들리고 그대로 끌어서 순서를 바꿀 수 있습니다.
  손가락 아래의 카드에 점선이 표시되고, 놓으면 그 자리로 들어갑니다.
  동시에 편집 모드가 켜져 각 카드에 크기 조정(⤢)·삭제(✕) 버튼이 나타납니다.
- 기본으로 켜져 있는 카드: **도료 관리 · 프라모델 관리 · 마스킹 테이프 · 모델링 용품**
- 편집 모드의 "카드 추가"로 켤 수 있는 카드: 재고 부족 · 구매 목록

## 도료 등록과 바코드

- **도료 추가**: 대시보드 카드 또는 도료 탭의 `+` → 이름을 직접 입력해 등록
- **바코드 스캔**(`/paint/scan`)
  - 이미 등록된 바코드 → 재고가 자동으로 +1 되고 이력에 "바코드 스캔"으로 남습니다
  - 처음 보는 바코드 → 그 바코드가 채워진 등록 화면으로 이동합니다
- **도료 등록 화면**에서 바코드, 사진, 이름, 색상, 광택(무광/반광/유광 등), 용량,
  희석비(도료:신너)를 입력합니다. 사진은 앱 문서 폴더로 복사해 보관합니다
  (`src/lib/photos.ts`).
- 재고는 대시보드 카드·도료 목록의 `−` / `+` 버튼으로 바로 조절하며,
  모든 증감은 `stock_logs` 에 남습니다.

## 프라모델 · 마스킹 테이프 · 모델링 용품

- **프라모델**(`/projects`) — 미조립(적프라)부터 완성까지 상태별로 관리합니다.
  박스아트 사진, 보유 수량, 구입일·구입가, 보관 위치를 기록하고
  킷별로 사용한 도료(조색비 포함)를 함께 남길 수 있습니다.
- **마스킹 테이프**(`/masking`) — 폭(mm)이 곧 재고 단위라서 전용 화면으로 분리했습니다.
  폭이 좁은 것부터 정렬되고, 목록에 없는 폭은 하단의 "자주 쓰는 폭 빠르게 추가"로 한 번에 등록합니다.
  데이터는 `supplies` 테이블의 `category = 'masking'` 행이며 폭은 `width_mm` 칼럼입니다.
- **모델링 용품**(`/supplies`) — 사포·접착제·퍼티·공구·신너 등 나머지 용품.
  마스킹 테이프는 전용 화면이 있으므로 이 목록에서는 제외됩니다.

세 화면 모두 목록에서 `−` / `+` 로 재고를 바로 조절하고, 증감은 `stock_logs` 에 남습니다.

## 데이터 모델 요약

- `brands` — 도료 제조사·라인업 (Mr.COLOR, 타미야 에나멜 …)
- `paints` — 보유 도료. 품번/색상/종류/광택/용량/희석비/바코드/사진/보유 병 수/잔량/보관 위치
- `dashboard_cards` — 대시보드 카드의 표시 여부와 순서
- `supplies` — 마스킹 테이프(폭 `width_mm`)와 모델링 용품. 수량 + 단위 + 부족 기준
- `projects` / `project_paints` — 보유 프라모델(상태·수량·구입가·보관 위치)과 킷별 사용 도료
- `stock_logs` — 재고 증감 이력 (구매/사용/조정/폐기)
- `shopping_items` — 구매 목록. 부족 재고를 한 번에 담을 수 있음

### 스키마를 바꿀 때

```bash
# 1) src/db/schema.ts 수정
npm run db:generate     # drizzle/ 에 새 마이그레이션 SQL 생성
# 2) 앱을 다시 실행하면 시작 시 자동 적용된다 (src/db/provider.tsx)
```

생성된 마이그레이션 파일은 반드시 커밋합니다. 앱에 번들되어 기기에서 실행됩니다.

## 빌드 · 배포

EAS Build 를 쓰면 macOS 없이도 iOS 빌드를 만들 수 있습니다.

```bash
npm i -g eas-cli
eas login
eas build:configure

# 안드로이드
eas build --platform android --profile preview      # 내부 테스트용 APK
eas build --platform android --profile production   # 플레이스토어용 AAB

# iOS (Apple Developer 계정 필요)
eas build --platform ios --profile production
```

- 패키지/번들 ID: `com.painto.app` (`app.json`)
- 네이티브 코드를 직접 만져야 할 때만 `npm run prebuild` 로 `android/`, `ios/` 를 생성합니다.
  평소에는 만들지 않고(gitignore 처리됨) 설정은 `app.json` 에서 관리합니다.

## iOS 확장을 위해 지켜야 할 것

- 플랫폼 분기는 `Platform.OS` 를 쓰되 화면 단위가 아니라 컴포넌트 내부에서 최소한으로.
- 안전영역은 `components/ui/screen.tsx` 의 `Screen` 을 통해서만 처리합니다.
- Android 전용 네이티브 모듈은 도입하지 않습니다. 새 패키지는 Expo SDK 지원 목록을 먼저 확인하세요.

## 다음에 붙일 만한 기능

- 재고 부족 알림 (`expo-notifications`)
- 바코드로 온라인 도료 정보 자동 채우기
- 데이터 백업/복원 (JSON 내보내기 → 클라우드 동기화)
