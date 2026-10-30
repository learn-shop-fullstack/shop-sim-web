import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'shop-sim 스토어',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
