import type { NextConfig } from 'next';

// API 주소는 빌드할 때 번들에 들어간다(ADR 0020). 없으면 상대 경로로 조용히 요청하지 않고 여기서 멈춘다
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL 환경 변수가 없다');
}

const config: NextConfig = {
  // 내부 패키지는 빌드 없이 TS 소스를 내보낸다. Next.js가 앱 코드처럼 변환·번들하게 한다
  transpilePackages: ['@shop-sim/api-client'],
};

export default config;
