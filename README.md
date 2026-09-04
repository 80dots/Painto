# Painto

프라모델 애호가를 위한 **도료 · 소모품 재고 관리** 앱입니다.
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

쓰는 네이티브 모듈(expo-sqlite, react-native-svg)이 모두 Expo Go 에 포함되어 있어
개발 단계에서는 별도 네이티브 빌드 없이 Expo Go 만으로 확인할 수 있습니다.

## 폴더 구조

```
src/
  app/                    expo-router 라우트 (파일 = 화면)
    (tabs)/               홈 · 도료 · 소모품 · 킷 · 설정 탭
    paint/[id].tsx        도료 추가/편집 (id 가 'new' 면 추가)
    supply/[id].tsx       소모품 추가/편집
    project/[id].tsx      킷 편집 + 사용 도료 팔레트
    shopping.tsx          구매 목록
  components/ui/          Button, Card, Input, Badge 등 공용 UI
  db/
    schema.ts             Drizzle 스키마 (테이블 정의의 유일한 출처)
    client.ts             SQLite 핸들 + drizzle 인스턴스
    provider.tsx          앱 시작 시 마이그레이션·기본 데이터 적용
    seed.ts               기본 브랜드 목록, 샘플 데이터
  features/<도메인>/       queries.ts(데이터 접근) + components/
  lib/                    labels(한글 라벨), utils(cn, 색상 변환 등)
drizzle/                  생성된 마이그레이션 SQL (커밋 대상)
```

## 데이터 모델 요약

- `brands` — 도료 제조사·라인업 (Mr.COLOR, 타미야 에나멜 …)
- `paints` — 보유 도료. 품번/색상/종류/마감/보유 병 수/개봉 병 잔량/보관 위치
- `supplies` — 사포·접착제·마스킹 등 소모품. 수량 + 단위 + 부족 기준
- `projects` / `project_paints` — 제작 중인 킷과 킷별 사용 도료(조색비 포함)
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

- 바코드 스캔으로 도료 등록 (`expo-camera`)
- 도료 사진 첨부 (`expo-image-picker`)
- 재고 부족 알림 (`expo-notifications`)
- 데이터 백업/복원 (JSON 내보내기 → 클라우드 동기화)
