'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './query-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState로 만들지 않는다. 이 위에 Suspense 경계가 없어 첫 렌더링이 중단되면 React가 상태를 버린다
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
