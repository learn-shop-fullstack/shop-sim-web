import type { Metadata } from 'next';
import { connection } from 'next/server';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'shop-sim 스토어',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // 빌드 때 렌더링하면 빌드 환경의 값이 HTML에 박힌다. 요청 시점에 렌더링해 실행 환경의 값을 쓴다
  await connection();
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) throw new Error('API_BASE_URL 환경 변수가 없다');
  return (
    <html lang="ko">
      <body>
        <Providers apiBaseUrl={apiBaseUrl}>{children}</Providers>
      </body>
    </html>
  );
}
