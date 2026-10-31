import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';

// 라우트 loader가 받는 값. loader는 이 QueryClient로 미리 받아 두고 화면은 같은 쿼리를 읽는다(ADR 0021)
export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // 없는 경로. 레이아웃 안(Outlet 자리)에 보인다
  notFoundComponent: () => <h1>페이지를 찾을 수 없습니다</h1>,
});

function RootLayout() {
  return (
    <>
      <header>
        <strong>셀러센터</strong>
        <nav>
          <Link to="/">홈</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
