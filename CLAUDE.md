# shop-sim-web — 마켓플레이스 프론트엔드

멀티 판매자 마켓플레이스 **shop-sim**의 프론트엔드 레포. 회사에서 일한다고 가정하고 진행하는 학습 프로젝트다.

공통 문서 (`../.github/handbook/`):
- 작업 방식: @../.github/handbook/working-agreement.md
- 시스템 구성·계약·도메인 모델: `../.github/handbook/architecture.md`
- 작업 목록: `../.github/handbook/ROADMAP.md`의 `[web]`, `[both]` 항목
- 결정 근거: `../.github/handbook/adr/`

## 이 레포의 책임 (pnpm + Turborepo 모노레포)

```
apps/
  store/        # Next.js 구매자 스토어 (SSR, SEO)
                #   소셜 로그인, 검색(자동완성·패싯), 판매자 스토어, 상품 상세(AI 리뷰 요약),
                #   장바구니·주문서·토스페이먼츠 결제 위젯, 마이페이지 주문·배송 조회, 판매자와 채팅, 알림, 고객센터
  seller/       # React SPA 셀러센터
                #   대시보드(매출·TOP10·수요 예측·발주 추천), 상품관리(목록·등록·Tiptap 에디터·재고·쿠폰),
                #   주문/배송 관리, 정산관리(CSV), 고객관리(채팅), 판매자 정보, 알림, 공지·FAQ·1:1 문의
  admin/        # React SPA 플랫폼 어드민 (사내 운영 도구)
                #   입점 심사, 회원·판매자·상품·주문 모니터링, 플랫폼 쿠폰, 정산 현황, 고객센터 운영,
                #   검색 인덱스 관리, DLT 재처리, 배치 이력, 운영·시스템 모니터링 대시보드
packages/
  api-client/   # shop-sim-api 스펙 패키지(버전 고정)에서 생성한 타입·클라이언트
  realtime/     # SSE·WebSocket 연결 관리 (재연결, 누락 복구, 탭 간 중복 연결 처리)
  grid/         # AG Grid 공통 설정, 서버 데이터소스 어댑터, 셀 렌더러
  ui/           # 공용 디자인 시스템
  tiptap-nodes/ # 커스텀 에디터 노드 (셀러센터 편집 + 스토어 렌더링 공유)
```

**이 레포에 없는 것**: 트래픽 시뮬레이터(`shop-sim-loadtest`), 물류 서버 콘솔(`shop-sim-vendor`), 배포 설정(`shop-sim-infra`).

## 학습 목표

- 대시보드: 셀러센터(매출 추이, TOP10, 예측 vs 재고), 어드민(거래액, 시스템 모니터링, 컨슈머 랙), 시계열 차트, 로그 뷰어
- AG Grid: 서버 필터·정렬, 셀 편집, 실시간 배치 업데이트
- 리치 텍스트 에디터: Tiptap 커스텀 노드, JSON 저장 → SSR 렌더링
- 실시간 UI: SSE 알림, WebSocket 구매자↔판매자 채팅(낙관적 전송, 누락 복구, 읽음 표시, 주문 카드)
- 결제 위젯 연동: 토스페이먼츠 테스트 모드

## 레포 규칙

- API 타입은 손으로 작성하지 않는다. 항상 `packages/api-client`의 생성 타입을 쓴다. 스펙에 없는 필드가 필요하면 shop-sim-api에 스펙 변경 이슈를 먼저 만든다.
- 스펙 패키지 버전은 고정한다. 업그레이드는 별도 PR로, 변경 로그를 확인하고 올린다.
- 백엔드 구현 전이라도 스펙이 배포됐으면 스펙 기반 목 서버로 화면을 먼저 개발한다.
- 앱끼리 서로 import하지 않는다. 공유할 것은 `packages/`로 올린다.
- 그리드: AG Grid는 배포본에 Community(MIT)만. Enterprise 기능은 로컬 실험 브랜치에서만.
- 결제: 토스페이먼츠 **테스트 키만** 쓴다. 키는 환경 변수로 받고 커밋하지 않는다.

## 모노레포 (#4)

- 루트 `pnpm build` / `lint` / `typecheck` / `dev`는 Turborepo로 각 패키지의 같은 이름 스크립트를 돌린다.
- 패키지·앱을 추가할 때
  - 내부 패키지 이름은 `@shop-sim/*`. 빌드 없이 TS 소스를 `exports`로 내보내고 변환은 앱의 번들러가 한다(Next.js는 `transpilePackages`).
  - `tsconfig.json`은 `@shop-sim/tsconfig/base.json`을 extends하고 환경별 설정(lib, jsx, types)만 더한다.
  - 스크립트: `"typecheck": "tsc"`, `"lint": "oxlint --type-aware --deny-warnings"`. TypeScript·oxlint·turbo는 루트에만 설치한다.
  - oxlint 설정은 루트 `.oxlintrc.json`을 찾아 쓴다. 패키지 설정이 필요하면 루트를 `extends`하고, `-c`는 쓰지 않는다(다른 설정 탐색이 꺼진다).
  - `build` 결과물이 `dist/` 밖이면(Next.js의 `.next/` 등) `turbo.json`의 `build.outputs`에 더한다. 빠지면 캐시가 적중해도 결과물이 복원되지 않는다.
  - `transit`이라는 스크립트를 만들지 않는다. `turbo.json`에서 의존 패키지 변경을 typecheck·lint 캐시에 전달하는 빈 노드 이름이다.
- 함정
  - pnpm이 실제로 쓰는 버전은 `package.json`의 `devEngines.packageManager`다. 어긋나면 경고 없이 그 버전을 받아 실행한다. 올릴 때는 `mise.toml`과 함께, api 레포와 같이 올린다.
  - `CI=true`이면 `pnpm install`이 `--frozen-lockfile`로 동작해 lock 파일을 갱신하지 않는다. 의존성을 바꿀 때는 `--no-frozen-lockfile`을 붙인다.
  - 설치 스크립트가 있는 의존성은 `pnpm-workspace.yaml`의 `allowBuilds`에 허용·거부를 적어야 설치가 통과한다.

## 목 서버 (#6)

- 처음 한 번: `gh auth refresh -s read:packages`, `mise trust`. 스펙 패키지(GitHub Packages, private) 토큰은 `mise.toml` `[env]`가 `gh auth token`으로 `pnpm_config__auth`에 넣는다.
  - 레포 `.npmrc`에는 스코프 레지스트리만 둔다. pnpm은 레포 `.npmrc`의 토큰과 `${ENV}`를 무시한다.
- 실행: 루트 `pnpm dev` → `@shop-sim/mock-server`가 `http://localhost:4010`에서 스펙을 서빙한다(Prism 정적 모드, CORS 허용).
- 스펙 버전은 `pnpm-workspace.yaml`의 `catalog`에서 exact로 고정한다. 목 서버와 `packages/api-client`가 `catalog:`로 같은 버전을 쓴다.
- 요청 헤더로 응답 고르기: `Prefer: code=404`(상태 코드), `Prefer: code=400, example=invalidPageToken`(스펙 예시 이름), `Prefer: dynamic=true`(무작위 값).
- 함정
  - 오류 본문은 스펙의 예시(api `openapi/CONVENTIONS.md` "예시 (목 서버)")를 그대로 돌려준다. 요청 검증에 실패하면 400의 첫 예시(validation-error)라 `pointer`는 실제 위반과 다를 수 있다. 실제 위반은 `sl-violations` 응답 헤더에 있다.
  - 비즈니스 오류(잘못된 `pageToken`, 없는 상품)는 스스로 내지 않는다. 스키마에 맞는 요청이면 200이다. 그 분기는 `Prefer: code=…, example=…`로 받아 확인한다.
  - 정적 응답은 스키마만 지킨 값이다(완제품인데 `leadTimeDays: 1`). 도메인 규칙은 지키지 않는다. 동적 모드의 `nextPageToken`은 무작위 문자열이라 페이지 끝이 오지 않는다.
  - turbo strict env 모드라 태스크에는 `turbo.json`에 적은 환경 변수만 들어간다. 앱 dev 태스크에 변수가 필요하면 `env`·`passThroughEnv`에 더한다.

## 결정사항

- 스토어: Next.js / 셀러센터·어드민: 각각 React SPA (같은 디자인 시스템·그리드 패키지 공유)
- 에디터: Tiptap (ProseMirror 기반), JSON 저장
- 화면 구분: 구매자(스토어) / 판매자(셀러센터) / 플랫폼 운영자(어드민). 한 계정이 구매자 겸 판매자라 스토어 ↔ 셀러센터 전환 진입점을 둔다
- API 클라이언트: Hey API로 `packages/api-client`에 생성하고, 앱은 이 패키지의 공용 코드로만 호출한다. 서버 컴포넌트는 요청마다 쿠키를 담은 클라이언트를 만드는 공용 함수를 쓰고, 오류는 인터셉터가 정규화한 타입으로 분기한다(ADR 0017)
- 서버 상태 관리: TanStack Query. 스토어는 서버 컴포넌트에서 prefetch하고 `HydrationBoundary`로 브라우저에 넘긴다(ADR 0017)

## 미결정

- [ ] 차트 라이브러리
- [ ] SPA 빌드 도구 (Vite 등)

## 현재 단계

1단계(뼈대 배포) 진행 중. 모노레포 세팅(#4), 스펙 기반 목 서버(#6)를 마쳤다. 다음은 `packages/api-client`. CI는 api-client에서 스펙 패키지 읽기 권한 방식을 정한 뒤 따로 만든다.
