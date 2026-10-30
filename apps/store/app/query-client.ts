import { type ApiError, isTransientError } from '@shop-sim/api-client';
import { environmentManager, QueryClient } from '@tanstack/react-query';

// 오류 인터셉터를 거친 오류는 Problem 아니면 ApiClientError다. 쿼리 기본값(retry 등)의 error 타입이 된다
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

// 횟수는 TanStack 기본값(3회)과 같게 두고, 다시 보내도 같은 답인 오류(4xx, 취소)는 바로 실패시킨다
function retryTransient(failureCount: number, error: ApiError): boolean {
  return failureCount < 3 && isTransientError(error);
}

function makeQueryClient(retry: typeof retryTransient | false) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 0이면 하이드레이션 직후 서버에서 받은 데이터를 오래됐다고 보고 브라우저가 다시 요청한다
        staleTime: 60 * 1000,
        retry,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * 서버는 요청마다 새로 만든다(사용자 간 캐시 공유 방지). 브라우저는 하나를 계속 쓴다.
 * TanStack Query 공식 SSR 가이드(App Router)의 구성
 */
export function getQueryClient(): QueryClient {
  // 서버는 재시도하지 않는다. 재시도 대기(1·2·4초) 동안 사용자는 빈 화면을 본다.
  // 일시적 장애는 오류 화면의 다시 시도와 다음 요청에 맡긴다
  if (environmentManager.isServer()) return makeQueryClient(false);
  browserQueryClient ??= makeQueryClient(retryTransient);
  return browserQueryClient;
}
