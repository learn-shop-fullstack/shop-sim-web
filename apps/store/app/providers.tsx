'use client';

import { setBrowserBaseUrl } from '@shop-sim/api-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './query-client';

/**
 * 브라우저 전역 설정. 하위 컴포넌트보다 먼저 렌더링되므로 첫 요청 전에 baseUrl이 맞춰진다.
 * 서버 렌더링 때도 실행되지만 서버가 읽은 것과 같은 값이라 서버 기본 클라이언트는 그대로다
 */
export default function Providers({ apiBaseUrl, children }: { apiBaseUrl: string; children: React.ReactNode }) {
  setBrowserBaseUrl(apiBaseUrl);
  // useState로 만들지 않는다. 이 위에 Suspense 경계가 없어 첫 렌더링이 중단되면 React가 상태를 버린다
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
