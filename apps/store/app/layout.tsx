import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'shop-sim 스토어',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
