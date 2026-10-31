import { type ApiError, isTransientError } from '@shop-sim/api-client';
import { QueryClient } from '@tanstack/react-query';

// 오류 인터셉터를 거친 오류는 Problem 아니면 ApiClientError다. 쿼리 기본값(retry 등)의 error 타입이 된다
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 0이면 loader가 받은 데이터를 컴포넌트가 마운트하자마자 오래됐다고 보고 다시 요청한다
        staleTime: 60 * 1000,
        // 횟수는 TanStack 기본값(3회)과 같게 두고, 다시 보내도 같은 답인 오류(4xx, 취소)는 바로 실패시킨다
        retry: (failureCount, error) => failureCount < 3 && isTransientError(error),
      },
    },
  });
}
