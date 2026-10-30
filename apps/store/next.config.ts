import type { NextConfig } from 'next';

const config: NextConfig = {
  // 내부 패키지는 빌드 없이 TS 소스를 내보낸다. Next.js가 앱 코드처럼 변환·번들하게 한다
  transpilePackages: ['@shop-sim/api-client'],
};

export default config;
