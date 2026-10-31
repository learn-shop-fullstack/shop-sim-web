import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
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
