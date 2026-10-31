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

- 루트 `pnpm build` / `lint` / `typecheck` / `test` / `dev`는 Turborepo로 각 패키지의 같은 이름 스크립트를 돌린다.
- 패키지·앱을 추가할 때
  - 내부 패키지 이름은 `@shop-sim/*`. 빌드 없이 TS 소스를 `exports`로 내보내고 변환은 앱의 번들러가 한다(Next.js는 `transpilePackages`).
  - `tsconfig.json`은 `@shop-sim/tsconfig/base.json`을 extends하고 환경별 설정(lib, jsx, types)만 더한다.
  - 스크립트: `"typecheck": "tsc"`, `"lint": "oxlint --type-aware --deny-warnings"`. TypeScript·oxlint·turbo는 루트에만 설치한다.
  - oxlint 설정은 루트 `.oxlintrc.json`을 찾아 쓴다. 패키지 설정이 필요하면 루트를 `extends`하고, `-c`는 쓰지 않는다(다른 설정 탐색이 꺼진다).
  - `build` 결과물이 `dist/` 밖이면(Next.js의 `.next/` 등) `turbo.json`의 `build.outputs`에 더한다. 빠지면 캐시가 적중해도 결과물이 복원되지 않는다.
  - 여러 패키지가 쓰는 의존성(스펙 패키지, vitest, TanStack Query 등)은 `pnpm-workspace.yaml`의 `catalog`에 exact로 두고 `package.json`에는 `"catalog:"`로 적는다. `catalogMode: strict`는 `pnpm add`만 막으므로 손으로 적은 버전은 리뷰에서 본다.
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
  - 정적 응답은 스키마만 지킨 값이다(완제품인데 `leadTimeDays: 1`). 도메인 규칙은 지키지 않는다. 목록은 매 페이지 같은 id와 `nextPageToken: "string"`이라 "더 보기"가 끝나지 않고 React key 중복 경고가 난다(실제 API는 겹치지 않는다). 동적 모드의 `nextPageToken`도 무작위 문자열이라 페이지 끝이 오지 않는다.
  - turbo strict env 모드라 태스크에는 `turbo.json`에 적은 환경 변수만 들어간다. 앱 dev 태스크에 변수가 필요하면 `env`·`passThroughEnv`에 더한다.

## API 클라이언트 (#10)

- 앱은 `@shop-sim/api-client`(SDK 함수, 스펙 타입, 클라이언트 생성 함수, 오류 타입), `@shop-sim/api-client/query`(TanStack Query 옵션), `@shop-sim/api-client/server`(서버 컴포넌트 전용, `server-only`)로만 호출한다. 이 진입점들이 기본 클라이언트에 오류 정규화 인터셉터를 건다.
- 생성물(`packages/api-client/src/generated/`)은 커밋하지 않는다. turbo가 typecheck·lint·test와 앱 `dev`·`build` 전에 `generate`를 돌린다.
- 오류 분기: SDK 결과와 쿼리의 `error`는 `ApiError`로 받는다. 생성 타입은 스펙의 오류 응답(`Problem`)만 알아서 `ApiClientError`가 빠져 있다.
  - `error instanceof ApiClientError`이면 `error.failure.kind`로 나눈다: `network`(응답 없음), `aborted`(호출 쪽 취소, 화면에 오류로 보이지 않는다), `timeout`(`AbortSignal.timeout`), `unexpected`(Problem이 아닌 응답, `status` 있음).
  - 나머지는 `Problem`이고 `type`으로만 분기한다.
- 서버 컴포넌트는 `@shop-sim/api-client/server`의 `createServerClient((await cookies()).toString())`를 SDK 함수·쿼리 옵션의 `client`로 넘긴다(ADR 0017).
  - 쿠키는 이 클라이언트에만 담는다. 요청 옵션 `headers`는 queryKey에 들어가 브라우저가 다시 요청하고, 기본 클라이언트는 서버에서 여러 사용자가 함께 쓴다.
  - 서버와 브라우저는 같은 `baseUrl`을 써야 queryKey가 같다. 기본 클라이언트가 빌드할 때 번들에 들어간 `VITE_API_BASE_URL` 또는 `NEXT_PUBLIC_API_BASE_URL`을 읽어 둘이 구조적으로 같다(`src/hey-api.ts`, 로컬 값은 `mise.toml`).
- 커서 목록(`pageToken` 파라미터)에는 `listXxxInfiniteOptions`가 생성된다. 쓰는 쪽이 `initialPageParam: {}`(빈 문자열은 `minLength` 위반 400)와 `getNextPageParam: (last) => last.nextPageToken ?? undefined`를 붙인다.
- 새 클라이언트는 `createApiClient`로 만든다. 생성물의 `createClient`로 만들면 오류 인터셉터와 기본 설정(`src/hey-api.ts`의 baseUrl, `parseAs`)이 빠진다.
- 함정
  - `parseAs`는 `json`으로 고정했다(기본값 `auto`는 `text/plain` 2xx 본문을 문자열 data로 통과시킨다). CSV 다운로드 등은 호출할 때 `parseAs`를 지정한다.
  - Problem 판정은 "Problem 형식이고 본문 `status`가 응답 상태 코드와 같다"이다. 스펙의 상태 코드 목록은 런타임에 남지 않아서, 선언하지 않은 상태 코드(예: 500)라도 서버가 Problem을 보내면 Problem이다.
  - fetch 전 코드 오류(요청 인터셉터, 본문 직렬화)도 `network`로 온다. 원래 오류는 `cause`에 있다.
  - TanStack Query 기본 재시도는 404 Problem도 3회 재시도한다. 앱의 `QueryClient` 기본값에서 `isTransientError`(network·timeout·5xx만 true)로 거른다.
  - 생성된 무한 쿼리 옵션은 `queryFn` 타입에 `skipToken`이 있어 `useSuspenseInfiniteQuery`에 넘길 수 없다. `useInfiniteQuery`를 쓴다.
  - `./server`를 import하는 테스트는 `vi.mock('server-only', () => ({}))`가 필요하다(Vitest에는 `react-server` 조건이 없어 throw한다).
  - `src/hey-api.ts`는 번들러가 치환하는 표현식(`import.meta.env.VITE_*`, `process.env.NEXT_PUBLIC_*`)을 그대로 써야 한다. 변수로 빼거나 구조 분해하면 치환되지 않는다. `VITE_API_BASE_URL` 타입은 이 파일이 선언하므로 SPA의 `vite-env.d.ts`에 다시 선언하지 않는다(선택 여부가 달라 충돌한다).

## 스토어 (#14)

- 페이지(서버 컴포넌트)는 `getQueryClient()`로 prefetch하고 `HydrationBoundary`로 넘긴다. 서버와 브라우저는 같은 옵션 함수(예: `products/product-pages.ts`)로 쿼리를 만든다.
  - `prefetchQuery`는 실패해도 throw하지 않는다. `getQueryState(queryKey).error`를 보고 404·400 Problem은 `notFound()`, 그 밖은 throw해 `app/error.tsx`로 보낸다. `dehydrate`는 성공한 쿼리만 넘겨서 실패를 그냥 두면 브라우저가 다시 요청한다.
- `QueryClient`(`app/query-client.ts`): 서버는 요청마다 새로 만들고 재시도하지 않는다(재시도 대기만큼 빈 화면). 브라우저는 하나를 쓰고 일시적 오류만 3회 재시도한다. `staleTime` 60초로 하이드레이션 직후 다시 요청하지 않는다.
- API 주소는 빌드할 때 번들에 들어가 홈과 404는 정적이다. 상품 화면은 쿠키를 읽어 동적이다. `NEXT_PUBLIC_API_BASE_URL`이 없으면 `next.config.ts`에서 build·dev·typegen이 멈춘다.
- typecheck 스크립트는 `next typegen && tsc`다. `next-env.d.ts`와 `.next/types`(라우트 타입)를 만든 뒤 검사한다. 둘 다 커밋하지 않는다.
- 함정
  - 오류 화면의 다시 시도는 `retry`(Next 16.4. 16.2 문서의 `unstable_retry`)다. 서버 컴포넌트를 다시 렌더링한다. `reset`은 서버를 다시 부르지 않는다. `error.tsx`는 같은 폴더의 layout 오류를 잡지 못한다.
  - `mise exec`는 셸에서 넣은 변수보다 `mise.toml` `[env]`를 우선한다. 다른 API 주소로 빌드해 보려면 mise를 거치지 않고 `next build`를 실행한다. 이렇게 직접 실행한 빌드가 store에 `@types/node`를 자동 설치해 `package.json`·lockfile을 바꾼 적이 있다. 끝나면 `git status`를 본다.
  - `NEXT_*`는 turbo가 기본으로 태스크에 넘기지만 캐시 해시에 넣지 않는다. 번들에 들어가는 변수는 `build.env`에 적는다. 안 적으면 다른 값으로 만든 결과물을 캐시에서 복원한다.
  - api-client 생성물 폴더를 지웠다 다시 만들면 실행 중인 dev 서버(Turbopack)가 옛 모듈을 계속 쓴다. dev 서버를 다시 띄운다.

## 셀러센터·어드민 (#18)

- 두 앱은 같은 구성이다(셀러센터 dev 3001, 어드민 3002). 구성을 바꿀 때는 두 앱을 함께 고친다. 공용 패키지로 올리는 일은 별도 이슈로 한다.
  - `src/query-client.ts`(재시도·`staleTime` 등 쿼리 기본값)는 예외다. store를 포함해 앱마다 따로 두고 각자 다르게 유지한다. 공용화 대상이 아니다.
- 라우트는 `src/routes/`에 파일로 둔다(ADR 0021). 라우트 트리는 `src/generated/routeTree.gen.ts`에 생성되고 커밋하지 않는다. turbo `generate`(`tsr generate`)가 typecheck·lint 전에, Vite 플러그인이 dev·build 중에 만든다. 둘 다 `tsr.config.json`을 읽는다.
- 데이터: 라우트 `loader`에서 `context.queryClient.ensureQueryData(옵션)`로 받고, 화면은 같은 옵션을 `useSuspenseQuery`로 읽는다. 라우터 자체 캐시는 끄고(`defaultPreloadStaleTime: 0`) 신선도는 TanStack Query가 정한다.
- `VITE_API_BASE_URL`이 없으면 `vite.config.ts`의 `requireEnv` 플러그인이 build·dev를 멈춘다.
- 상품 목록: 판매자·운영자 API가 없어 공개 목록 첫 페이지(100개)를 AG Grid 클라이언트 사이드 행 모델로 정렬·필터한다. 그리드 모듈은 그리드마다 `modules`로 등록하고, 개발 모드에서만 `enableDevValidations()`를 켠다.
- 함정
  - `tsr.config.json`의 `generatedRouteTree`를 기본값(`src/routeTree.gen.ts`)으로 두면 turbo `generate` outputs(`src/generated/**`)에 잡히지 않아 캐시가 적중해도 복원되지 않는다.
  - `Link`의 `to`는 라우터를 `Register`에 등록해야(`main.tsx`) 경로 타입으로 검사된다.
  - Vite 설정 파일이 실행되는 동안에는 `.env` 파일이 읽히지 않는다. 설정에서 환경 변수를 검사할 때는 플러그인 `configResolved`의 `config.env`를 본다.
  - `pnpm install`의 "Agent skills awaiting approval"은 TanStack 패키지에 든 에이전트 스킬 파일 안내다. 설치 스크립트와 무관하고 승인하지 않는다.
  - 없는 경로에도 `index.html`을 돌려줘야 라우터가 화면을 그린다. Vite dev 서버는 기본으로 그렇고, 배포용 정적 파일 서버도 같은 설정이 필요하다.

## CI (#12)

- PR과 main 푸시에서 `ci` job이 install → lint → typecheck → test → build를 돈다. main 보호 ruleset이 `ci` 통과를 요구한다(GitHub Actions 앱으로 한정, 브랜치 최신화 필수).
  - job 이름 `ci`를 바꾸면 ruleset의 필수 체크도 같이 바꾼다. 안 바꾸면 체크가 영원히 대기라 머지가 막힌다.
  - 워크플로에 `paths` 필터를 걸지 않는다. 필터에 걸린 PR은 체크가 생기지 않아 머지가 막힌다.
- 스펙 패키지 토큰: mise 단계에만 `GH_TOKEN`(워크플로 토큰)을 넘긴다. `gh auth token`이 그 값을 돌려줘 `mise.toml` `[env]` 템플릿이 그대로 `pnpm_config__auth`를 만든다. `gh`가 인증되지 않으면 `mise install`부터 템플릿 오류로 실패한다.
- 패키지 설정 "Manage Actions access"에 이 레포가 Read로 있어야 한다. 없으면 `packages: read`가 있어도 install이 403이다. 스펙 패키지를 받는 새 레포도 같은 설정이 필요하다(웹 UI, 패키지 관리자만).

## 결정사항

- 스토어: Next.js / 셀러센터·어드민: 각각 React SPA (같은 디자인 시스템·그리드 패키지 공유)
- 에디터: Tiptap (ProseMirror 기반), JSON 저장
- 화면 구분: 구매자(스토어) / 판매자(셀러센터) / 플랫폼 운영자(어드민). 한 계정이 구매자 겸 판매자라 스토어 ↔ 셀러센터 전환 진입점을 둔다
- API 클라이언트: Hey API로 `packages/api-client`에 생성하고, 앱은 이 패키지의 공용 코드로만 호출한다. 서버 컴포넌트는 요청마다 쿠키를 담은 클라이언트를 만드는 공용 함수를 쓰고, 오류는 인터셉터가 정규화한 타입으로 분기한다(ADR 0017)
- 서버 상태 관리: TanStack Query. 스토어는 서버 컴포넌트에서 prefetch하고 `HydrationBoundary`로 브라우저에 넘긴다(ADR 0017)
- SPA 빌드 도구: Vite(정확한 버전 고정)와 `@vitejs/plugin-react`(ADR 0019)
- SPA 라우터: TanStack Router, 파일 기반 라우트. URL 쿼리는 라우트 `validateSearch`로 검증하고, 데이터는 라우터 context의 `QueryClient`로 loader에서 미리 받는다(ADR 0021)
- API 주소: 빌드할 때 프레임워크 관례대로 주입한다. 스토어 `NEXT_PUBLIC_API_BASE_URL`, SPA `VITE_API_BASE_URL`이고 api-client가 둘 다 읽는다. 값이 없으면 빌드가 실패한다. 대가로 환경(staging·production)마다 이미지를 따로 빌드한다. 번들에 보이는 값이라 공개해도 되는 값만 이 방식으로 넣는다(ADR 0020, 0018 대체, #16)
- 스펙 패키지 접근: private을 유지한다(공개 전환은 되돌릴 수 없다). CI는 패키지 설정 "Manage Actions access"에 이 레포를 읽기로 추가하고, 워크플로 `GITHUB_TOKEN`(`permissions: packages: read`)을 `pnpm_config__auth`로 넘겨 설치한다. 개인 토큰을 시크릿으로 두지 않는다. #12에서 적용해 확인했다(권한 추가 전 403, 추가 후 통과)(#10, api#32)

## 미결정

- [ ] 차트 라이브러리

## 현재 단계

1단계(뼈대 배포) 진행 중. 모노레포 세팅(#4), 스펙 기반 목 서버(#6), `packages/api-client`(#10), web CI(#12), 스토어 상품 목록·상세(#14), API 주소 빌드 시 주입 전환(#16), 셀러센터·어드민 빈 레이아웃과 상품 목록(#18)을 마쳤다. 다음은 infra 재사용 워크플로를 호출하는 배포다.
