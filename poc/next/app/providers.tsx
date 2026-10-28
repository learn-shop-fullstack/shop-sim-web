'use client';

// TanStack Query 공식 SSR 가이드(App Router)의 구성
import { environmentManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  // staleTime > 0: 하이드레이션 직후 "오래된 데이터"라서 다시 요청하는 경우를 배제한다
  return new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
