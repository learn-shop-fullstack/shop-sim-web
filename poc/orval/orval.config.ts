import { defineConfig } from 'orval';

export default defineConfig({
  shopSim: {
    // 버전 고정된 스펙 패키지에서 생성한다. 경로는 이 설정 파일 기준
    input: { target: '../../node_modules/@shop-sim/api-spec/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: './generated/endpoints.ts',
      schemas: './generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      // 생성 기본값 비교용 고정값. 실제로는 환경 변수를 읽는 mutator가 필요하다
      baseUrl: 'http://localhost:3000/api',
      mock: true,
      // 기본값은 4xx를 반환해서 TanStack Query가 성공으로 처리한다 → throw하게 한다
      override: { fetch: { forceSuccessResponse: true } },
    },
  },
});
