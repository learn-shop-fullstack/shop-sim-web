'use client';

import type { ErrorInfo } from 'next/error';

/**
 * 루트 layout 아래 페이지의 오류 화면(오류 경계는 클라이언트 컴포넌트여야 한다).
 * 서버 렌더링 중 오류는 운영 빌드에서 메시지가 가려지고 digest만 온다. 원인은 서버 로그에서 본다
 */
export default function ErrorPage({ retry }: ErrorInfo) {
  return (
    <main>
      <h1>페이지를 불러오지 못했습니다</h1>
      <p>잠시 후 다시 시도해 주세요.</p>
      {/* retry는 서버 컴포넌트를 다시 렌더링한다(router.refresh). 서버 prefetch부터 다시 돈다 */}
      <button type="button" onClick={retry}>
        다시 시도
      </button>
    </main>
  );
}
