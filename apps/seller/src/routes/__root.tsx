import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
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
