import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // 버전 고정된 스펙 패키지에서 생성한다. 생성물은 커밋하지 않는다
  input: './node_modules/@learn-shop-fullstack/shop-sim-api-openapi/openapi.yaml',
  output: './src/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    // 주소 등 클라이언트 설정은 실행 시점 설정 파일에서 정한다. 확장자를 붙이면 생성물 import가 TS5097로 깨진다
    { name: '@hey-api/client-next', runtimeConfigPath: './src/hey-api' },
    // queryOptions·mutationOptions 등을 만든다. 진입점 @shop-sim/api-client/query로 내보낸다
    '@tanstack/react-query',
  ],
});
