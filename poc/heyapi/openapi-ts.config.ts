import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // 버전 고정된 스펙 패키지에서 생성한다
  input: './node_modules/@shop-sim/api-spec/openapi.yaml',
  output: './poc/heyapi/generated',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    // baseUrl 등은 런타임 설정 파일에서. 서버·브라우저 양쪽에서 같은 방식으로 초기화된다
    { name: '@hey-api/client-next', runtimeConfigPath: './poc/heyapi/hey-api' },
    { name: '@tanstack/react-query', queryOptions: true },
  ],
});
