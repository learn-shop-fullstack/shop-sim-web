import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './generated/routeTree.gen';
import { createQueryClient } from './query-client';

const queryClient = createQueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  // 라우터의 자체 캐시(기본 30초)가 미리 받기를 건너뛰지 않게 한다. 신선도는 TanStack Query가 정한다
  defaultPreloadStaleTime: 0,
  Wrap: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
});

// 경로·파라미터·URL 쿼리 타입을 Link, useNavigate 등에 알린다
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root 요소가 없다');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
